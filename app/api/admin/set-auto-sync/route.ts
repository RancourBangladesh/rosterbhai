import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { setAutoSyncEnabled, setAutoSyncEnabledForTenant } from '@/lib/dataStore';

export async function POST(req: NextRequest) {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body = await req.json();
  const { enabled } = body;
  if (typeof enabled !== 'boolean') {
    return NextResponse.json({error:'Invalid request'},{status:400});
  }
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    setAutoSyncEnabledForTenant(tenantId, enabled);
  } else {
    setAutoSyncEnabled(enabled);
  }
  
  return NextResponse.json({success:true, autoSyncEnabled: enabled});
}
