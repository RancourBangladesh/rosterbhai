import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { getTenantById, updateTenant } from '@/lib/tenants';

export async function POST(req: NextRequest) {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  
  const { logo_data } = await req.json();
  
  if (!logo_data || typeof logo_data !== 'string') {
    return NextResponse.json({success:false, error:'Invalid logo data'});
  }
  
  // Validate that it's a proper base64 image
  if (!logo_data.startsWith('data:image/')) {
    return NextResponse.json({success:false, error:'Logo must be an image file'});
  }
  
  // Check file size (limit to 500KB)
  const sizeInBytes = (logo_data.length * 3) / 4;
  if (sizeInBytes > 500000) {
    return NextResponse.json({success:false, error:'Logo file size must be less than 500KB'});
  }
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    const tenant = getTenantById(tenantId);
    if (tenant) {
      updateTenant(tenantId, {
        settings: {
          ...tenant.settings,
          logo_url: logo_data
        }
      });
      return NextResponse.json({success:true, message:'Logo uploaded successfully', logo_url: logo_data});
    }
  }
  
  return NextResponse.json({success:false, error:'Not a tenant admin'});
}
