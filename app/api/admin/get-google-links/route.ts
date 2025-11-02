import { NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { getGoogleLinks, getGoogleLinksForTenant } from '@/lib/dataStore';

export async function GET() {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    return NextResponse.json(getGoogleLinksForTenant(tenantId));
  }
  
  // Legacy fallback
  return NextResponse.json(getGoogleLinks());
}