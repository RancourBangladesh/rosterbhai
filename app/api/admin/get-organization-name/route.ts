import { NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { getTenantById } from '@/lib/tenants';

export async function GET() {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    const tenant = getTenantById(tenantId);
    if (tenant) {
      return NextResponse.json({
        success: true,
        organization_name: tenant.settings.organization_name || tenant.name,
        logo_url: tenant.settings.logo_url || null
      });
    }
  }
  
  // Legacy fallback
  return NextResponse.json({
    success: true,
    organization_name: 'RosterBhai',
    logo_url: null
  });
}
