import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { 
  getAdmin, 
  setAdmin, 
  getAdminForTenant, 
  setAdminForTenant, 
  loadAllForTenant,
  getGoogleForTenant,
  setGoogleForTenant,
  mergeDisplayForTenant,
  deactivateEmployee
} from '@/lib/dataStore';

export async function POST(req: NextRequest) {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  const {employeeId} = await req.json();
  
  if (!employeeId) {
    return NextResponse.json({error:'Employee ID is required'},{status:400});
  }
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    // Tenant-aware soft deletion (deactivation)
    loadAllForTenant(tenantId);
    
    const admin = getAdminForTenant(tenantId);
    const google = getGoogleForTenant(tenantId);
    
    // Create "Inactive Employees" team if it doesn't exist
    if (!admin.teams['Inactive Employees']) {
      admin.teams['Inactive Employees'] = [];
    }
    
    let employeeFound = false;
    
    // 1. Move employee from current team to "Inactive Employees" in admin data
    for (const [team, emps] of Object.entries(admin.teams)) {
      const empIndex = emps.findIndex((e: any) => e.id === employeeId);
      if (empIndex > -1 && team !== 'Inactive Employees') {
        const emp = emps[empIndex];
        emp.currentTeam = 'Inactive Employees';
        emp.status = 'inactive';
        emp.deleted_at = new Date().toISOString();
        
        // Remove from current team and add to Inactive
        admin.teams[team].splice(empIndex, 1);
        admin.teams['Inactive Employees'].push(emp);
        employeeFound = true;
        break;
      }
    }
    
    // 2. Also mark in Google (base) data if exists
    for (const [team, emps] of Object.entries(google.teams)) {
      const empIndex = emps.findIndex((e: any) => e.id === employeeId);
      if (empIndex > -1) {
        const emp = emps[empIndex];
        emp.status = 'inactive';
        emp.deleted_at = new Date().toISOString();
        break;
      }
    }
    
    // 3. Mark employee credentials as inactive (prevents login)
    deactivateEmployee(tenantId, employeeId);
    
    // 4. Save changes
    setAdminForTenant(tenantId, admin);
    setGoogleForTenant(tenantId, google);
    mergeDisplayForTenant(tenantId);
    
    if (!employeeFound) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      });
    }
    
  } else {
    // Legacy global deletion (move to Inactive)
    const admin = getAdmin();
    
    if (!admin.teams['Inactive Employees']) {
      admin.teams['Inactive Employees'] = [];
    }
    
    for (const [team, emps] of Object.entries(admin.teams)) {
      const empIndex = emps.findIndex((e: any) => e.id === employeeId);
      if (empIndex > -1 && team !== 'Inactive Employees') {
        const emp = emps[empIndex];
        emp.currentTeam = 'Inactive Employees';
        emp.status = 'inactive';
        emp.deleted_at = new Date().toISOString();
        
        admin.teams[team].splice(empIndex, 1);
        admin.teams['Inactive Employees'].push(emp);
        break;
      }
    }
    
    setAdmin(admin);
  }
  
  return NextResponse.json({success:true});
}