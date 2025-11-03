import { NextRequest, NextResponse } from 'next/server';
import { getAdmin, setAdmin, getAdminForTenant, setAdminForTenant, loadAllForTenant } from '@/lib/dataStore';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';

export async function POST(req: NextRequest) {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  const {teamName} = await req.json();
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    loadAllForTenant(tenantId);
    const admin = getAdminForTenant(tenantId);
    if (teamName in admin.teams) {
      // Instead of deleting employees, move them to "Unassigned" team
      const employeesInTeam = admin.teams[teamName];
      
      // Create Unassigned team if it doesn't exist
      if (!admin.teams['Unassigned']) {
        admin.teams['Unassigned'] = [];
      }
      
      // Move all employees to Unassigned and update their currentTeam
      for (const emp of employeesInTeam) {
        emp.currentTeam = 'Unassigned';
        admin.teams['Unassigned'].push(emp);
      }
      
      // Now delete the team
      delete admin.teams[teamName];
      setAdminForTenant(tenantId, admin);
    }
  } else {
    const admin = getAdmin();
    if (teamName in admin.teams) {
      // Same logic for non-tenant mode
      const employeesInTeam = admin.teams[teamName];
      
      if (!admin.teams['Unassigned']) {
        admin.teams['Unassigned'] = [];
      }
      
      for (const emp of employeesInTeam) {
        emp.currentTeam = 'Unassigned';
        admin.teams['Unassigned'].push(emp);
      }
      
      delete admin.teams[teamName];
      setAdmin(admin);
    }
  }
  
  return NextResponse.json({success:true});
}