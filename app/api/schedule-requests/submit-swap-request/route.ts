import { NextRequest, NextResponse } from 'next/server';
import { addSwapRequest, addSwapRequestForTenant } from '@/lib/dataStore';
import { getSessionTenantId } from '@/lib/auth';
import { findEmployeeTenant } from '@/lib/employeeAuth';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const {
    requesterId, requesterName,
    targetEmployeeId, targetEmployeeName,
    team, date, requesterShift, targetShift, reason
  } = await req.json();
  // Shifts can be empty strings, so we check them separately
  if (!requesterId || !requesterName || !targetEmployeeId || !targetEmployeeName || !team || !date || !reason) {
    return NextResponse.json({success:false, error:'All fields are required'});
  }
  // Ensure shifts are defined (can be empty string)
  if (requesterShift === undefined || requesterShift === null || targetShift === undefined || targetShift === null) {
    return NextResponse.json({success:false, error:'Shift information is required'});
  }
  // Prefer admin session tenant; fallback to deriving from requesterId (employee portal doesn't carry admin cookie)
  let tenantId = getSessionTenantId();
  if (!tenantId) {
    tenantId = findEmployeeTenant(requesterId);
  }
  const payload = {
    requester_id: requesterId,
    requester_name: requesterName,
    target_employee_id: targetEmployeeId,
    target_employee_name: targetEmployeeName,
    team,
    date,
    requester_shift: requesterShift,
    target_shift: targetShift,
    reason
  } as const;
  const r = tenantId
    ? addSwapRequestForTenant(tenantId, payload)
    : addSwapRequest(payload);
  return NextResponse.json({success:true, request:r});
}