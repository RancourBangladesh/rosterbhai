import { NextRequest, NextResponse } from 'next/server';
import { addScheduleChangeRequest, addScheduleChangeRequestForTenant } from '@/lib/dataStore';
import { getSessionTenantId } from '@/lib/auth';
import { findEmployeeTenant } from '@/lib/employeeAuth';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const {employeeId, employeeName, team, date, currentShift, requestedShift, reason} = await req.json();
  // currentShift can be empty string, so we check it separately
  if (!employeeId || !employeeName || !team || !date || !requestedShift || !reason) {
    return NextResponse.json({success:false, error:'All fields required'});
  }
  // Prefer admin session tenant; fallback to deriving from employeeId (employee portal doesn't carry admin cookie)
  let tenantId = getSessionTenantId();
  if (!tenantId) {
    tenantId = findEmployeeTenant(employeeId);
  }
  const payload = {
    employee_id:employeeId,
    employee_name:employeeName,
    team,
    date,
    current_shift: currentShift,
    requested_shift: requestedShift,
    reason
  } as const;
  const r = tenantId
    ? addScheduleChangeRequestForTenant(tenantId, payload)
    : addScheduleChangeRequest(payload);
  return NextResponse.json({success:true, request:r});
}