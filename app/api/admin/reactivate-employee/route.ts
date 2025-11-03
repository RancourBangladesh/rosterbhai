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
  reactivateEmployeeCredential
} from '@/lib/dataStore';

export async function POST(req: NextRequest) {
  if (!getSessionUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { employeeId, targetTeam } = await req.json();

  if (!employeeId) {
    return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
  }
  if (!targetTeam || typeof targetTeam !== 'string') {
    return NextResponse.json({ error: 'targetTeam is required' }, { status: 400 });
  }

  const tenantId = getSessionTenantId();
  if (tenantId) {
    // Tenant-aware reactivation
    loadAllForTenant(tenantId);

    const admin = getAdminForTenant(tenantId);
    const google = getGoogleForTenant(tenantId);

    // Ensure target team exists
    if (!admin.teams[targetTeam]) {
      admin.teams[targetTeam] = [];
    }

    let employeeFound = false;

    // 1) Try to find the employee in Inactive Employees in admin data
    const inactiveTeam = 'Inactive Employees';
    if (admin.teams[inactiveTeam]) {
      const idx = admin.teams[inactiveTeam].findIndex(e => e.id === employeeId);
      if (idx > -1) {
        const emp = admin.teams[inactiveTeam][idx];
        // remove from inactive and push to target
        admin.teams[inactiveTeam].splice(idx, 1);
        emp.currentTeam = targetTeam;
        emp.status = 'active';
        if (emp.deleted_at) delete emp.deleted_at;
        admin.teams[targetTeam].push(emp);
        employeeFound = true;
      }
    }

    // 2) If not found in inactive team, scan all teams and update status
    if (!employeeFound) {
      for (const [team, emps] of Object.entries(admin.teams)) {
        const i = emps.findIndex((e: any) => e.id === employeeId);
        if (i > -1) {
          const emp = emps[i];
          // If already in a team, just ensure status & team match target
          if (team !== targetTeam) {
            admin.teams[team].splice(i, 1);
            emp.currentTeam = targetTeam;
            admin.teams[targetTeam].push(emp);
          }
          emp.status = 'active';
          if (emp.deleted_at) delete emp.deleted_at;
          employeeFound = true;
          break;
        }
      }
    }

    // 3) Update google (base) record if exists
    for (const [, emps] of Object.entries(google.teams)) {
      const gi = (emps as any[]).findIndex((e: any) => e.id === employeeId);
      if (gi > -1) {
        const gemp = (emps as any[])[gi] as any;
        gemp.status = 'active';
        if (gemp.deleted_at) delete gemp.deleted_at;
        break;
      }
    }

    // 4) Reactivate credentials
    reactivateEmployeeCredential(tenantId, employeeId);

    // 5) Save
    setAdminForTenant(tenantId, admin);
    setGoogleForTenant(tenantId, google);
    mergeDisplayForTenant(tenantId);

    if (!employeeFound) {
      return NextResponse.json({ success: false, error: 'Employee not found' });
    }
  } else {
    // Legacy global reactivation
    const admin = getAdmin();

    if (!admin.teams[targetTeam]) {
      admin.teams[targetTeam] = [];
    }

    const inactiveTeam = 'Inactive Employees';
    let employeeFound = false;
    if (admin.teams[inactiveTeam]) {
      const idx = admin.teams[inactiveTeam].findIndex((e: any) => e.id === employeeId);
      if (idx > -1) {
        const emp = admin.teams[inactiveTeam][idx];
        admin.teams[inactiveTeam].splice(idx, 1);
        emp.currentTeam = targetTeam;
        emp.status = 'active';
        if (emp.deleted_at) delete emp.deleted_at;
        admin.teams[targetTeam].push(emp);
        employeeFound = true;
      }
    }

    if (!employeeFound) {
      for (const [team, emps] of Object.entries(admin.teams)) {
        const i = emps.findIndex((e: any) => e.id === employeeId);
        if (i > -1) {
          const emp = emps[i];
          if (team !== targetTeam) {
            admin.teams[team].splice(i, 1);
            emp.currentTeam = targetTeam;
            admin.teams[targetTeam].push(emp);
          }
          emp.status = 'active';
          if (emp.deleted_at) delete emp.deleted_at;
          break;
        }
      }
    }

    setAdmin(admin);
  }

  return NextResponse.json({ success: true });
}
