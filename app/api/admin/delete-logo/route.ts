import { NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { getTenantById, updateTenant } from '@/lib/tenants';

export async function POST() {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    const tenant = getTenantById(tenantId);
    if (tenant) {
      updateTenant(tenantId, {
        settings: {
          ...tenant.settings,
          logo_url: undefined
        }
      });
      return NextResponse.json({success:true, message:'Logo removed successfully'});
    }
  }
  
  return NextResponse.json({success:false, error:'Not a tenant admin'});
}
