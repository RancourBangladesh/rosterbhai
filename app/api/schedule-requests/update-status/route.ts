import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { updateRequestStatus, updateRequestStatusForTenant } from '@/lib/dataStore';
import { applyShiftChangeRequest, applySwap, applyShiftChangeRequestForTenant, applySwapForTenant } from '@/lib/shifts';

export async function POST(req: NextRequest) {
  const user = getSessionUser();
  if (!user) return NextResponse.json({error:'Unauthorized'},{status:401});
  const {requestId, status, adminMessage} = await req.json();
  if (!requestId || !['approved','rejected'].includes(status)) return NextResponse.json({success:false,error:'Invalid request'});
  const tenantId = getSessionTenantId();
  let upd = tenantId
    ? updateRequestStatusForTenant(tenantId, requestId, status, user, adminMessage)
    : updateRequestStatus(requestId, status, user, adminMessage);
  // Fallback to legacy or tenant if not found in the primary store, to handle migration edge cases
  if (!upd && tenantId) {
    upd = updateRequestStatus(requestId, status, user, adminMessage);
  }
  if (!upd) return NextResponse.json({success:false,error:'Request not found'});
  if (status==='approved') {
    if (upd.type==='shift_change') {
      if (tenantId && updateRequestStatusForTenant(tenantId, requestId, status, user, adminMessage)) {
        applyShiftChangeRequestForTenant(tenantId, upd as any, user);
      } else {
        applyShiftChangeRequest(upd as any, user);
      }
    } else if (upd.type==='swap') {
      if (tenantId && updateRequestStatusForTenant(tenantId, requestId, status, user, adminMessage)) {
        applySwapForTenant(tenantId, upd as any, user);
      } else {
        applySwap(upd as any, user);
      }
    }
  }
  return NextResponse.json({success:true, request:upd});
}