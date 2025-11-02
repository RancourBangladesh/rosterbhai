import { NextRequest, NextResponse } from 'next/server';
import { requireDeveloper } from '@/lib/auth';
import { getTenantById } from '@/lib/tenants';
import { 
  setAdminForTenant, 
  setScheduleRequestsForTenant,
  setModifiedShiftsForTenant,
  loadAllForTenant 
} from '@/lib/dataStore';

export async function POST(
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
    
    // Reset all tenant data
    try {
      // Load current data first to ensure proper initialization
      loadAllForTenant(tenant.id);
      
      // Reset admin data (employees)
      setAdminForTenant(tenant.id, {
        teams: {},
        headers: [],
        allEmployees: []
      });
      
      // Reset schedule requests
      setScheduleRequestsForTenant(tenant.id, {
        shift_change_requests: [],
        swap_requests: [],
        pending_count: 0,
        approved_count: 0
      });
      
      // Reset modified shifts
      setModifiedShiftsForTenant(tenant.id, {
        modifications: [],
        monthly_stats: {}
      });
      
      // Reload cache
      loadAllForTenant(tenant.id);
      
      return NextResponse.json({ 
        success: true,
        message: 'Tenant data reset successfully'
      });
    } catch (resetErr: any) {
      console.error('Reset tenant data error:', resetErr);
      return NextResponse.json({ 
        success: false, 
        error: resetErr.message || 'Failed to reset tenant data' 
      }, { status: 500 });
    }
  } catch (err: any) {
    console.error('Reset tenant error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Failed to reset tenant' 
    }, { status: 500 });
  }
}
