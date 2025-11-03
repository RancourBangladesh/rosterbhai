import { NextRequest, NextResponse } from 'next/server';
import { requireDeveloper } from '@/lib/auth';
import { getTenants, createTenant } from '@/lib/tenants';
import { getTenantAdminUsers } from '@/lib/tenants';
import { getDisplayForTenant, loadAllForTenant } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  try {
    requireDeveloper();
    
    const tenantsData = getTenants();
    
    // Get stats for each tenant
    const stats: Record<string, { users: number; employees: number }> = {};
    for (const tenant of tenantsData.tenants) {
      try {
        // Load tenant data to get employee count
        loadAllForTenant(tenant.id);
        const displayData = getDisplayForTenant(tenant.id);
        const adminUsers = getTenantAdminUsers(tenant.id);
        
        stats[tenant.id] = {
          users: adminUsers.users.length,
          employees: displayData.allEmployees.length
        };
      } catch (e) {
        stats[tenant.id] = { users: 0, employees: 0 };
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      tenants: tenantsData.tenants,
      stats
    });
  } catch (err) {
    console.error('Get tenants error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Unauthorized' 
    }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireDeveloper();
    
    const { name, slug, max_users, max_employees, adminUser } = await req.json();
    
    if (!name || !slug) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and slug are required' 
      }, { status: 400 });
    }
    
    const tenant = createTenant({
      name,
      slug,
      max_users,
      max_employees
    });
    
    // Initialize tenant data
    loadAllForTenant(tenant.id);
    
    // Create admin user if provided
    if (adminUser) {
      try {
        const { addTenantAdminUser } = await import('@/lib/tenants');
        addTenantAdminUser(tenant.id, {
          username: adminUser.username,
          password: adminUser.password,
          full_name: adminUser.full_name,
          role: 'admin'
        });
      } catch (adminErr: any) {
        console.error('Failed to create admin user:', adminErr);
        // Don't fail tenant creation if admin user fails
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      tenant 
    });
  } catch (err: any) {
    console.error('Create tenant error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Failed to create tenant' 
    }, { status: 500 });
  }
}
