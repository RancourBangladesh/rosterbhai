import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { getAdmin, setAdmin, getAdminForTenant, setAdminForTenant, reloadAllForTenant } from '@/lib/dataStore';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  const {teamName, action, oldName} = await req.json();
  if (!teamName) return NextResponse.json({success:false, error:'Team name required'});
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    console.log(`[save-team] Tenant ID: ${tenantId}, Action: ${action}, Team: ${teamName}`);
    reloadAllForTenant(tenantId); // Ensure data is loaded
    const admin = getAdminForTenant(tenantId);
    console.log(`[save-team] Current teams:`, Object.keys(admin.teams));
    
    // Ensure teams object exists
    if (!admin.teams) admin.teams = {};
    if (!admin.allEmployees) admin.allEmployees = [];
    if (!admin.headers) admin.headers = [];
    
    if (action==='add') {
      if (!admin.teams[teamName]) admin.teams[teamName] = [];
      console.log(`[save-team] Added team ${teamName}`);
    } else if (action==='edit') {
      if (oldName && admin.teams[oldName]) {
        admin.teams[teamName] = admin.teams[oldName];
        delete admin.teams[oldName];
        console.log(`[save-team] Renamed team ${oldName} to ${teamName}`);
      }
    }
    setAdminForTenant(tenantId, admin);
    console.log(`[save-team] Teams after save:`, Object.keys(admin.teams));
  } else {
    const admin = getAdmin();
    if (action==='add') {
      if (!admin.teams[teamName]) admin.teams[teamName] = [];
    } else if (action==='edit') {
      if (oldName && admin.teams[oldName]) {
        admin.teams[teamName] = admin.teams[oldName];
        delete admin.teams[oldName];
      }
    }
    setAdmin(admin);
  }
  
  return NextResponse.json({success:true});
}