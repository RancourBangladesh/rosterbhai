import { NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { getSettings, getSettingsForTenant } from '@/lib/dataStore';

export async function GET() {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    const settings = getSettingsForTenant(tenantId);
    return NextResponse.json(settings);
  }
  
  // Legacy fallback
  const settings = getSettings();
  return NextResponse.json(settings);
}
