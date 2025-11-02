import { NextRequest, NextResponse } from 'next/server';
import { requireDeveloper } from '@/lib/auth';
import { getTenantById, updateTenant, getTenantAdminUsers } from '@/lib/tenants';
import { getDisplayForTenant, loadAllForTenant } from '@/lib/dataStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireDeveloper();
    
    console.log('[API] Getting tenant:', params.id);
    const tenant = getTenantById(params.id);
    
    if (!tenant) {
      console.log('[API] Tenant not found:', params.id);
      return NextResponse.json({ 
        success: false, 
        error: 'Tenant not found' 
      }, { status: 404 });
    }
    
    console.log('[API] Tenant found:', tenant.name);
    
    // Load tenant data
    try {
      loadAllForTenant(tenant.id);
  const displayData = getDisplayForTenant(tenant.id);
      const adminUsers = getTenantAdminUsers(tenant.id);
      
      console.log('[API] Loaded data:', {
        adminUsers: adminUsers.users.length,
        employees: displayData.allEmployees.length
      });
      
      // Ensure each employee has a team field populated for UI
      const idToTeam = new Map<string, string>();
      Object.entries(displayData.teams).forEach(([teamName, list]: any) => {
        list.forEach((e: any) => {
          if (e?.id && !idToTeam.has(e.id)) idToTeam.set(e.id, teamName);
        });
      });
      const employeesWithTeam = displayData.allEmployees.map((e: any) => ({
        ...e,
        team: e?.team || e?.currentTeam || idToTeam.get(e?.id) || 'Unassigned'
      }));

      return NextResponse.json({ 
        success: true, 
        tenant,
        adminUsers: adminUsers.users,
        employees: employeesWithTeam
      });
    } catch (dataErr) {
      console.error('[API] Data loading error:', dataErr);
      // Return tenant info even if data loading fails
      return NextResponse.json({ 
        success: true, 
        tenant,
        adminUsers: [],
        employees: []
      });
    }
  } catch (err) {
    console.error('Get tenant error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Unauthorized' 
    }, { status: 401 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireDeveloper();
    
    const updates = await req.json();
    const tenant = updateTenant(params.id, updates);
    
    return NextResponse.json({ 
      success: true, 
      tenant 
    });
  } catch (err: any) {
    console.error('Update tenant error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Failed to update tenant' 
    }, { status: 500 });
  }
}
