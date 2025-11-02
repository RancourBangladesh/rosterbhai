import { NextRequest, NextResponse } from 'next/server';
import { getDisplay } from '@/lib/dataStore';
import { verifyEmployeePassword, initializeEmployeePasswords, findEmployeeTenant, verifyTenantEmployeePassword, initializeTenantEmployeePasswords } from '@/lib/employeeAuth';
import { getDisplayForTenant, loadAllForTenant } from '@/lib/dataStore.tenant';
import { getTenantBySlug } from '@/lib/tenants';

export async function POST(req: NextRequest) {
  try {
    let { employeeId, password } = await req.json();
    
    if (!employeeId || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Employee ID and password are required' 
      }, { status: 400 });
    }

    // Parse tenant prefix if provided (format: tenantSlug@employeeId or tenantSlug/employeeId)
    let tenantId = null;
    let actualEmployeeId = employeeId.trim();
    
    if (employeeId.includes('@')) {
      const parts = employeeId.split('@');
      if (parts.length === 2) {
        const tenantSlug = parts[0].trim();
        actualEmployeeId = parts[1].trim();
        const tenant = getTenantBySlug(tenantSlug);
        if (tenant && tenant.is_active) {
          tenantId = tenant.id;
          console.log(`[LOGIN] Found tenant by slug: ${tenantSlug} -> ${tenantId}`);
        }
      }
    } else if (employeeId.includes('/')) {
      const parts = employeeId.split('/');
      if (parts.length === 2) {
        const tenantSlug = parts[0].trim();
        actualEmployeeId = parts[1].trim();
        const tenant = getTenantBySlug(tenantSlug);
        if (tenant && tenant.is_active) {
          tenantId = tenant.id;
          console.log(`[LOGIN] Found tenant by slug: ${tenantSlug} -> ${tenantId}`);
        }
      }
    }
    
    // If no tenant prefix was provided, try to find the employee's tenant automatically
    if (!tenantId) {
      tenantId = findEmployeeTenant(actualEmployeeId);
      console.log(`[LOGIN] Auto-detected tenant for ${actualEmployeeId}: ${tenantId}`);
    }
    
    console.log(`[LOGIN] Attempting login - Employee: ${actualEmployeeId}, Tenant: ${tenantId}, Password length: ${password.length}`);
    
    let employee;
    let validPassword = false;
    
    if (tenantId) {
      // Tenant-based authentication
      // Load tenant data first
      loadAllForTenant(tenantId);
      const displayData = getDisplayForTenant(tenantId);
      console.log(`[LOGIN] Found ${displayData.allEmployees.length} employees in tenant`);
      
      // Initialize default passwords for all employees if not already done
      const allEmployeeIds = displayData.allEmployees.map(emp => emp.id);
      console.log(`[LOGIN] Initializing passwords for: ${allEmployeeIds.join(', ')}`);
      initializeTenantEmployeePasswords(tenantId, allEmployeeIds);
      
      // Find employee by ID (case-insensitive)
      employee = displayData.allEmployees.find(
        emp => emp.id.toLowerCase() === actualEmployeeId.toLowerCase()
      );
      console.log(`[LOGIN] Employee found: ${!!employee}`);
      
      if (employee) {
        // Verify password using tenant-aware authentication
        validPassword = verifyTenantEmployeePassword(tenantId, employee.id, password);
        console.log(`[LOGIN] Password valid: ${validPassword}`);
      }
    } else {
      // Fall back to legacy authentication for backward compatibility
      const displayData = getDisplay();
      
      // Initialize default passwords for all employees if not already done
      const allEmployeeIds = displayData.allEmployees.map(emp => emp.id);
      initializeEmployeePasswords(allEmployeeIds);
      
      // Find employee by ID (case-insensitive)
      employee = displayData.allEmployees.find(
        emp => emp.id.toLowerCase() === actualEmployeeId.toLowerCase()
      );
      
      if (employee) {
        // Verify password using legacy authentication
        validPassword = verifyEmployeePassword(employee.id, password);
      }
    }

    if (!employee) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid employee ID or password' 
      }, { status: 401 });
    }
    
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
        tenantId: tenantId || undefined
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
