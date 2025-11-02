import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { getScheduleRequests, getScheduleRequestsForTenant } from '@/lib/dataStore';
import { getSessionTenantId } from '@/lib/auth';
import { findEmployeeTenant } from '@/lib/employeeAuth';

export async function POST(req: NextRequest) {
  const {employeeId} = await req.json();
  if (!employeeId) return NextResponse.json({success:false,error:'Employee ID required'});
  // Prefer admin session tenant; fallback to deriving from employeeId
  let tenantId = getSessionTenantId();
  if (!tenantId) {
    tenantId = findEmployeeTenant(employeeId);
  }
  const file = tenantId ? getScheduleRequestsForTenant(tenantId) : getScheduleRequests();
  const list = [
    ...file.shift_change_requests.filter(r=>r.employee_id===employeeId),
    ...file.swap_requests.filter(r=>r.requester_id===employeeId || r.target_employee_id===employeeId)
  ];
  return NextResponse.json({success:true, requests:list});
}