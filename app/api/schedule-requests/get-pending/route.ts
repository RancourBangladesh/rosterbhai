import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { getPendingRequests, getScheduleRequests, getPendingRequestsForTenant, getScheduleRequestsForTenant } from '@/lib/dataStore';

export async function GET() {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    // Prefer tenant-scoped requests; also merge in any legacy requests for backward compatibility
    const tenantPending = getPendingRequestsForTenant(tenantId);
    const tenantFile = getScheduleRequestsForTenant(tenantId);
    const legacyPending = getPendingRequests();
    const legacyFile = getScheduleRequests();
    const pending_requests = [...tenantPending, ...legacyPending];
    const stats = {
      pending_count: (tenantFile.pending_count || 0) + (legacyFile.pending_count || 0),
      approved_count: (tenantFile.approved_count || 0) + (legacyFile.approved_count || 0),
      total_shift_change: (tenantFile.shift_change_requests?.length || 0) + (legacyFile.shift_change_requests?.length || 0),
      total_swap: (tenantFile.swap_requests?.length || 0) + (legacyFile.swap_requests?.length || 0)
    };
    return NextResponse.json({success:true, pending_requests, stats});
  }
  
  // Legacy fallback
  const pending_requests = getPendingRequests();
  const stats = {
    pending_count: getScheduleRequests().pending_count,
    approved_count: getScheduleRequests().approved_count,
    total_shift_change: getScheduleRequests().shift_change_requests.length,
    total_swap: getScheduleRequests().swap_requests.length
  };
  return NextResponse.json({success:true, pending_requests, stats});
}