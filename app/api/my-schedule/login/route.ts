import { NextRequest, NextResponse } from 'next/server';
import { verifyTenantEmployeePassword, initializeTenantEmployeePasswords } from '@/lib/employeeAuth';
import { getDisplayForTenant, loadAllForTenant } from '@/lib/dataStore.tenant';
import { getSubdomainFromHostname } from '@/lib/subdomain';
import { getTenantBySlug } from '@/lib/tenants';

export async function POST(req: NextRequest) {
  try {
    const { employeeId, password } = await req.json();
    
    if (!employeeId || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee ID and password are required' 
      }, { status: 400 });
    }

    // Get tenant from subdomain using headers
    const hostname = req.headers.get('host') || '';
    const subdomain = getSubdomainFromHostname(hostname);
    
    if (!subdomain) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid tenant subdomain' 
      }, { status: 400 });
    }
    
    const tenant = getTenantBySlug(subdomain);
    
    if (!tenant) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid tenant subdomain' 
      }, { status: 400 });
    }
    
    if (!tenant.is_active) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tenant is not active' 
      }, { status: 403 });
    }

    const actualEmployeeId = employeeId.trim();
    
    console.log(`[LOGIN] Attempting login - Employee: ${actualEmployeeId}, Tenant: ${tenant.id}, Password length: ${password.length}`);
    
    // Load tenant data
    loadAllForTenant(tenant.id);
    const displayData = getDisplayForTenant(tenant.id);
    console.log(`[LOGIN] Found ${displayData.allEmployees.length} employees in tenant`);
    
    // Initialize default passwords for all employees if not already done
    const allEmployeeIds = displayData.allEmployees.map(emp => emp.id);
    console.log(`[LOGIN] Initializing passwords for: ${allEmployeeIds.join(', ')}`);
    initializeTenantEmployeePasswords(tenant.id, allEmployeeIds);
    
    // Find employee by ID (case-insensitive)
    const employee = displayData.allEmployees.find(
      emp => emp.id.toLowerCase() === actualEmployeeId.toLowerCase()
    );
    console.log(`[LOGIN] Employee found: ${!!employee}`);
    
    if (!employee) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid employee ID or password' 
      }, { status: 401 });
    }
    
    // Verify password using tenant-aware authentication
    const validPassword = verifyTenantEmployeePassword(tenant.id, employee.id, password);
    console.log(`[LOGIN] Password valid: ${validPassword}`);
    
    if (!validPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid employee ID or password' 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      employee: {
        id: employee.id,
        name: employee.name,
        team: employee.currentTeam || employee.team,
        tenantId: tenant.id
      }
    });
  } catch (err) {
    console.error('Employee login error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed' 
    }, { status: 500 });
  }
}
