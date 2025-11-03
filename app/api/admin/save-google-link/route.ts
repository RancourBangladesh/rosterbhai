import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { addGoogleLink, addGoogleLinkForTenant } from '@/lib/dataStore';

export async function POST(req: NextRequest) {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  const {monthYear, googleLink} = await req.json();
  if (!monthYear || !googleLink) return NextResponse.json({success:false, error:'Month year and link required'});
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    addGoogleLinkForTenant(tenantId, monthYear, googleLink);
  } else {
    addGoogleLink(monthYear, googleLink);
  }
  
  return NextResponse.json({success:true, message:'Google Sheets link saved successfully'});
}