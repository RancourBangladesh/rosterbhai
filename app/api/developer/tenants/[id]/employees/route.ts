import { NextRequest, NextResponse } from 'next/server';
import { requireDeveloper } from '@/lib/auth';
import { getTenantById } from '@/lib/tenants';
import { getAdminForTenant, setAdminForTenant, loadAllForTenant, employeeIdExists } from '@/lib/dataStore';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireDeveloper();
    
    const tenant = getTenantById(params.id);
    if (!tenant) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tenant not found' 
      }, { status: 404 });
    }
    
    const { employeeId, name, team, is_active } = await req.json();
    if (!employeeId) {
      return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
    }
    
    // Load tenant data
    loadAllForTenant(tenant.id);
    const displayData = getAdminForTenant(tenant.id);
    
    // Find and update employee across teams
    let found: any | null = null;
    let fromTeam: string | null = null;
    Object.entries(displayData.teams).forEach(([teamName, list]: any) => {
      const idx = list.findIndex((e: any) => e.id === employeeId);
      if (idx !== -1) {
        found = list[idx];
        fromTeam = teamName;
      }
    });
    if (!found) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee not found' 
      }, { status: 404 });
    }
    // Update attributes
    if (typeof name === 'string' && name.trim()) {
      found.name = name.trim();
    }
    if (typeof is_active === 'boolean') {
      (found as any).is_active = is_active;
    }
    if (typeof team === 'string' && team.trim() && fromTeam && team.trim() !== fromTeam) {
      // Move employee between teams
      const sourceList = (displayData.teams as any)[fromTeam];
      const idx = sourceList.findIndex((e: any) => e.id === employeeId);
      if (idx !== -1) {
        const [emp] = sourceList.splice(idx, 1);
        if (!(displayData.teams as any)[team]) {
          (displayData.teams as any)[team] = [];
        }
        (emp as any).team = team;
        ;(displayData.teams as any)[team].push(emp);
      }
    }
    
    // Save updated data - reconstruct admin file format
    const adminFile = {
      teams: displayData.teams,
      headers: displayData.headers,
      allEmployees: displayData.allEmployees
    };
    setAdminForTenant(tenant.id, adminFile);
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Update employee error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Failed to update employee' 
    }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireDeveloper();

    const tenant = getTenantById(params.id);
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    const { id, name, team } = await req.json();
    if (!id || !name || !team) {
      return NextResponse.json({ success: false, error: 'id, name and team are required' }, { status: 400 });
    }

    loadAllForTenant(tenant.id);
    if (employeeIdExists(tenant.id, id)) {
      return NextResponse.json({ success: false, error: 'Employee ID already exists' }, { status: 400 });
    }

    const adminData = getAdminForTenant(tenant.id) as any;
    if (!adminData.teams[team]) adminData.teams[team] = [];
  const newEmp = { id, name, team, schedule: [], allTeams: [team], status: 'active', is_active: true };
    adminData.teams[team].push(newEmp);
    // Rebuild allEmployees
    adminData.allEmployees = [];
    Object.values(adminData.teams).forEach((emps: any) => adminData.allEmployees.push(...emps));
    setAdminForTenant(tenant.id, adminData);

    return NextResponse.json({ success: true, employee: newEmp });
  } catch (err: any) {
    console.error('Create employee error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to create employee' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireDeveloper();

    const tenant = getTenantById(params.id);
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }
    const { employeeId } = await req.json();
    if (!employeeId) {
      return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
    }

    loadAllForTenant(tenant.id);
    const adminData = getAdminForTenant(tenant.id) as any;
    let removed = false;
    Object.keys(adminData.teams).forEach((team: string) => {
      const before = adminData.teams[team].length;
      adminData.teams[team] = adminData.teams[team].filter((e: any) => e.id !== employeeId);
      if (adminData.teams[team].length !== before) removed = true;
    });
    if (!removed) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }
    adminData.allEmployees = [];
    Object.values(adminData.teams).forEach((emps: any) => adminData.allEmployees.push(...emps));
    setAdminForTenant(tenant.id, adminData);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete employee error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete employee' }, { status: 500 });
  }
}
