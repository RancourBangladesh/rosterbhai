import { NextRequest, NextResponse } from 'next/server';
import { requireDeveloper } from '@/lib/auth';
import { getTenantById, getTenantAdminUsers } from '@/lib/tenants';
import { 
  getDisplayForTenant, 
  getScheduleRequestsForTenant,
  getModifiedShiftsForTenant,
  loadAllForTenant 
} from '@/lib/dataStore';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireDeveloper();
    
    const tenant = getTenantById(params.id);
    if (!tenant) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tenant not found' 
      }, { status: 404 });
    }
    
    // Load all tenant data
    loadAllForTenant(tenant.id);
    const displayData = getDisplayForTenant(tenant.id);
    const scheduleRequests = getScheduleRequestsForTenant(tenant.id);
    const modifiedShifts = getModifiedShiftsForTenant(tenant.id);
    const adminUsers = getTenantAdminUsers(tenant.id);
    
    // Prepare export data
    const exportData = {
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        created_at: tenant.created_at,
        is_active: tenant.is_active,
        settings: tenant.settings
      },
      admin_users: adminUsers.users.map(user => ({
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at
        // Password excluded for security
      })),
      employees: displayData.allEmployees,
      schedule_requests: {
        shift_change_requests: scheduleRequests.shift_change_requests,
        swap_requests: scheduleRequests.swap_requests,
        stats: {
          pending_count: scheduleRequests.pending_count,
          approved_count: scheduleRequests.approved_count
        }
      },
      modified_shifts: modifiedShifts.modifications,
      export_metadata: {
        exported_at: new Date().toISOString(),
        exported_by: 'developer',
        version: '1.0'
      }
    };
    
    // Return as JSON download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="tenant-${tenant.slug}-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    });
  } catch (err: any) {
    console.error('Export tenant error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Failed to export tenant data' 
    }, { status: 500 });
  }
}
