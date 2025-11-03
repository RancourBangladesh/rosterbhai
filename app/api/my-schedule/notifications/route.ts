import { NextRequest, NextResponse } from 'next/server';
import { getScheduleRequestsForTenant, getModifiedShiftsForTenant } from '@/lib/dataStore';
import { findEmployeeTenant } from '@/lib/employeeAuth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/my-schedule/notifications
 * Get notifications for an employee (approved requests, shift updates, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const { employeeId } = await req.json();
    
    if (!employeeId) {
      return NextResponse.json({ success: false, error: 'Missing employeeId' }, { status: 400 });
    }

    const tenantId = await findEmployeeTenant(employeeId);
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    const scheduleRequestsData = getScheduleRequestsForTenant(tenantId);
    const scheduleRequests = [
      ...(scheduleRequestsData.shift_change_requests || []),
      ...(scheduleRequestsData.swap_requests || [])
    ];
    const modifiedShiftsData = getModifiedShiftsForTenant(tenantId);
    const modifiedShifts = modifiedShiftsData.modifications || [];

    const notifications: any[] = [];

    // 1. Recently approved shift change requests (last 7 days)
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    console.log('[Notifications] Checking for employee:', employeeId);
    console.log('[Notifications] Total requests:', scheduleRequests.length);
    
    scheduleRequests
      .filter((req: any) => {
        const isMyRequest = req.employee_id === employeeId || req.requester_id === employeeId;
        const isApproved = req.status === 'approved';
        const hasUpdatedAt = !!req.updated_at;
        const isRecent = hasUpdatedAt && new Date(req.updated_at).getTime() > sevenDaysAgo;
        
        if (isMyRequest && isApproved) {
          console.log('[Notifications] Approved request:', {
            id: req.id,
            type: req.type,
            status: req.status,
            updated_at: req.updated_at,
            isRecent
          });
        }
        
        return isMyRequest && isApproved && hasUpdatedAt && isRecent;
      })
      .forEach((req: any) => {
        const baseMessage = `Your ${req.type === 'swap' ? 'swap' : 'shift change'} request for ${req.date} has been approved`;
        const fullMessage = req.admin_message 
          ? `${baseMessage}. Message from admin: ${req.admin_message}`
          : baseMessage;
        
        notifications.push({
          id: `req-${req.id}`,
          type: 'request_approved',
          title: 'Request Approved',
          message: fullMessage,
          adminMessage: req.admin_message,
          date: req.date,
          timestamp: req.updated_at,
          priority: 'high'
        });
      });

    // 2. Rejected requests (last 7 days)
    scheduleRequests
      .filter((req: any) => {
        const isMyRequest = req.employee_id === employeeId || req.requester_id === employeeId;
        return isMyRequest && 
               req.status === 'rejected' &&
               req.updated_at &&
               new Date(req.updated_at).getTime() > sevenDaysAgo;
      })
      .forEach((req: any) => {
        const baseMessage = `Your ${req.type === 'swap' ? 'swap' : 'shift change'} request for ${req.date} was rejected`;
        const fullMessage = req.admin_message 
          ? `${baseMessage}. Message from admin: ${req.admin_message}`
          : baseMessage;
        
        notifications.push({
          id: `req-rej-${req.id}`,
          type: 'request_rejected',
          title: 'Request Rejected',
          message: fullMessage,
          adminMessage: req.admin_message,
          date: req.date,
          timestamp: req.updated_at,
          priority: 'medium'
        });
      });

    // 3. Modified shifts (admin changes, last 7 days)
    modifiedShifts
      .filter((shift: any) => 
        shift.employee_id === employeeId &&
        shift.modified_at &&
        new Date(shift.modified_at).getTime() > sevenDaysAgo
      )
      .forEach((shift: any) => {
        notifications.push({
          id: `shift-${shift.date}-${shift.employee_id}`,
          type: 'shift_modified',
          title: 'Shift Updated',
          message: `Your shift on ${shift.date} has been changed from ${shift.old_shift} to ${shift.new_shift}`,
          date: shift.date,
          timestamp: shift.modified_at,
          priority: 'high'
        });
      });

    // 4. Swap requests targeting this employee (pending)
    scheduleRequests
      .filter((req: any) => 
        req.type === 'swap' &&
        req.target_employee_id === employeeId && 
        req.status === 'pending'
      )
      .forEach((req: any) => {
        notifications.push({
          id: `swap-target-${req.id}`,
          type: 'swap_request_received',
          title: 'Swap Request',
          message: `${req.requester_name || 'A colleague'} wants to swap shifts with you on ${req.date}`,
          date: req.date,
          timestamp: req.created_at,
          priority: 'medium'
        });
      });

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });

    console.log('[Notifications] Returning', notifications.length, 'notifications');

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length,
      unreadCount: notifications.filter(n => n.priority === 'high').length
    });

  } catch (error: any) {
    console.error('[Notifications API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load notifications' },
      { status: 500 }
    );
  }
}
