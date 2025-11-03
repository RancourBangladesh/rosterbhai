import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { 
  loadAllForTenant, 
  getAdminForTenant, 
  setAdminForTenant,
  trackModifiedShiftForTenant,
  mergeDisplayForTenant
} from '@/lib/dataStore';

export async function POST(req: NextRequest) {
  const username = getSessionUser();
  if (!username) return NextResponse.json({success:false, error:'Unauthorized'},{status:401});
  
  const { employeeId, dateIndex, newShift, googleShift } = await req.json();
  if (!employeeId || dateIndex===undefined) return NextResponse.json({success:false, error:'Missing fields'});
  
  // Get tenant ID from session
  const tenantId = getSessionTenantId();
  if (!tenantId) return NextResponse.json({success:false, error:'No tenant'},{status:400});
  
  // Load tenant data
  await loadAllForTenant(tenantId);
  
  // Get tenant data
  const admin = getAdminForTenant(tenantId);
  if (!admin || !admin.teams) {
    return NextResponse.json({success:false, error:'No admin data'},{status:400});
  }
  
  // Find and update the employee's shift
  let found = false;
  for (const [teamName, emps] of Object.entries(admin.teams)) {
    const emp = (emps as any[]).find((e: any) => e.id === employeeId);
    if (emp) {
      if (dateIndex >= 0 && dateIndex < emp.schedule.length) {
        const oldShift = emp.schedule[dateIndex];
        emp.schedule[dateIndex] = newShift;
        
        // Track modification if different from Google original
        if (newShift !== (googleShift || '')) {
          const dateHeader = admin.headers[dateIndex] || `Date_${dateIndex}`;
          trackModifiedShiftForTenant(
            tenantId,
            employeeId,
            dateIndex,
            oldShift,
            newShift,
            emp.name,
            teamName,
            dateHeader,
            username
          );
        }
        found = true;
        break;
      }
    }
  }
  
  if (found) {
    // Save updated admin data
    setAdminForTenant(tenantId, admin);
    // Merge display data
    mergeDisplayForTenant(tenantId);
    return NextResponse.json({success: true});
  }
  
  return NextResponse.json({success: false, error: 'Employee or date not found'});
}