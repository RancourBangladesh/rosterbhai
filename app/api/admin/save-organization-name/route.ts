import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { getTenantById, updateTenant } from '@/lib/tenants';

export async function POST(req: NextRequest) {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  
  const { organization_name } = await req.json();
  if (!organization_name || !organization_name.trim()) {
    return NextResponse.json({success:false, error:'Organization name required'});
  }
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    const tenant = getTenantById(tenantId);
    if (tenant) {
      updateTenant(tenantId, {
        settings: {
          ...tenant.settings,
          organization_name: organization_name.trim()
        }
      });
      return NextResponse.json({success:true, message:'Organization name updated successfully'});
    }
  }
  
  return NextResponse.json({success:false, error:'Not a tenant admin'});
}
