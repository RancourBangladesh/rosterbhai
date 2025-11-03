import { readJSON, writeJSON } from './utils';
import { EMPLOYEE_CREDENTIALS_FILE, getTenantEmployeeCredentialsFile } from './constants';
import { EmployeeCredentialsFile, EmployeeCredential } from './types';

/**
 * Get employee credentials for legacy (non-tenant) system
 */
export function getEmployeeCredentials(): EmployeeCredentialsFile {
  return readJSON(EMPLOYEE_CREDENTIALS_FILE, { credentials: [] });
}

/**
 * Get employee credentials for a specific tenant
 */
export function getTenantEmployeeCredentials(tenantId: string): EmployeeCredentialsFile {
  return readJSON(getTenantEmployeeCredentialsFile(tenantId), { credentials: [] });
}

/**
 * Save employee credentials (legacy)
 */
export function saveEmployeeCredentials(data: EmployeeCredentialsFile) {
  writeJSON(EMPLOYEE_CREDENTIALS_FILE, data);
}

/**
 * Save employee credentials for tenant
 */
export function saveTenantEmployeeCredentials(tenantId: string, data: EmployeeCredentialsFile) {
  writeJSON(getTenantEmployeeCredentialsFile(tenantId), data);
}

/**
 * Set or update employee password (legacy)
 */
export function setEmployeePassword(employeeId: string, password: string): void {
  const credentials = getEmployeeCredentials();
  const existingIndex = credentials.credentials.findIndex(c => c.employee_id === employeeId);
  
  const credential: EmployeeCredential = {
    employee_id: employeeId,
    password: password, // TODO: Hash password in production
    created_at: existingIndex >= 0 ? credentials.credentials[existingIndex].created_at : new Date().toISOString(),
    last_updated: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    credentials.credentials[existingIndex] = credential;
  } else {
    credentials.credentials.push(credential);
  }
  
  saveEmployeeCredentials(credentials);
}

/**
 * Set or update employee password for tenant
 */
export function setTenantEmployeePassword(tenantId: string, employeeId: string, password: string): void {
  const credentials = getTenantEmployeeCredentials(tenantId);
  const existingIndex = credentials.credentials.findIndex(c => c.employee_id === employeeId);
  
  const credential: EmployeeCredential = {
    employee_id: employeeId,
    password: password, // TODO: Hash password in production
    created_at: existingIndex >= 0 ? credentials.credentials[existingIndex].created_at : new Date().toISOString(),
    last_updated: new Date().toISOString()
  };
  
  if (existingIndex >= 0) {
    credentials.credentials[existingIndex] = credential;
  } else {
    credentials.credentials.push(credential);
  }
  
  saveTenantEmployeeCredentials(tenantId, credentials);
}

/**
 * Verify employee password (legacy)
 */
export function verifyEmployeePassword(employeeId: string, password: string): boolean {
  const credentials = getEmployeeCredentials();
  const credential = credentials.credentials.find(c => c.employee_id === employeeId);
  
  if (!credential) {
    // If no credential exists, use employee ID as default password (for backward compatibility)
    // This allows existing systems to work but should be changed
    return password === employeeId;
  }
  
  // Check if employee is inactive/deleted
  if (credential.status === 'inactive') {
    return false;
  }
  
  // TODO: Use bcrypt.compare() in production
  return credential.password === password;
}

/**
 * Verify employee password for tenant
 */
export function verifyTenantEmployeePassword(tenantId: string, employeeId: string, password: string): boolean {
  const credentials = getTenantEmployeeCredentials(tenantId);
  const credential = credentials.credentials.find(c => c.employee_id === employeeId);
  
  console.log(`[AUTH] verifyTenantEmployeePassword - Employee: ${employeeId}, Password: ${password}, Credential found: ${!!credential}`);
  
  if (!credential) {
    // If no credential exists, use employee ID as default password (for backward compatibility)
    const isValid = password === employeeId;
    console.log(`[AUTH] No credential found, using default (employeeID as password): ${isValid}`);
    return isValid;
  }
  
  // Check if employee is inactive/deleted
  if (credential.status === 'inactive') {
    console.log(`[AUTH] Employee ${employeeId} is inactive/deleted - login denied`);
    return false;
  }
  
  // TODO: Use bcrypt.compare() in production
  const isValid = credential.password === password;
  console.log(`[AUTH] Credential found, stored password: ${credential.password}, provided: ${password}, valid: ${isValid}`);
  return isValid;
}

/**
 * Initialize default passwords for all employees
 * This sets employee ID as the default password for each employee
 * Admins can change these passwords later through the admin panel
 */
export function initializeEmployeePasswords(employeeIds: string[]): void {
  const credentials = getEmployeeCredentials();
  
  employeeIds.forEach(empId => {
    const exists = credentials.credentials.find(c => c.employee_id === empId);
    if (!exists) {
      credentials.credentials.push({
        employee_id: empId,
        password: empId, // Default: employee ID as password
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      });
    }
  });
  
  saveEmployeeCredentials(credentials);
}

/**
 * Initialize default passwords for tenant employees
 */
export function initializeTenantEmployeePasswords(tenantId: string, employeeIds: string[]): void {
  const credentials = getTenantEmployeeCredentials(tenantId);
  
  employeeIds.forEach(empId => {
    const exists = credentials.credentials.find(c => c.employee_id === empId);
    if (!exists) {
      credentials.credentials.push({
        employee_id: empId,
        password: empId, // Default: employee ID as password
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      });
    }
  });
  
  saveTenantEmployeeCredentials(tenantId, credentials);
}

/**
 * Generate a password reset token for an employee
 */
export function generatePasswordResetToken(tenantId: string | null, employeeId: string, email: string): string {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
  
  if (tenantId) {
    const credentials = getTenantEmployeeCredentials(tenantId);
    const existingIndex = credentials.credentials.findIndex(c => c.employee_id === employeeId);
    
    if (existingIndex >= 0) {
      credentials.credentials[existingIndex] = {
        ...credentials.credentials[existingIndex],
        email,
        reset_token: token,
        reset_token_expires: expiresAt
      };
    } else {
      credentials.credentials.push({
        employee_id: employeeId,
        password: employeeId, // Default password until they set their own
        email,
        reset_token: token,
        reset_token_expires: expiresAt,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      });
    }
    
    saveTenantEmployeeCredentials(tenantId, credentials);
  } else {
    // Legacy support
    const credentials = getEmployeeCredentials();
    const existingIndex = credentials.credentials.findIndex(c => c.employee_id === employeeId);
    
    if (existingIndex >= 0) {
      credentials.credentials[existingIndex] = {
        ...credentials.credentials[existingIndex],
        email,
        reset_token: token,
        reset_token_expires: expiresAt
      };
    } else {
      credentials.credentials.push({
        employee_id: employeeId,
        password: employeeId,
        email,
        reset_token: token,
        reset_token_expires: expiresAt,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      });
    }
    
    saveEmployeeCredentials(credentials);
  }
  
  return token;
}

/**
 * Verify and use password reset token
 */
export function verifyResetToken(tenantId: string | null, token: string): { valid: boolean; employeeId?: string } {
  const credentials = tenantId ? getTenantEmployeeCredentials(tenantId) : getEmployeeCredentials();
  const credential = credentials.credentials.find(c => c.reset_token === token);
  
  if (!credential || !credential.reset_token_expires) {
    return { valid: false };
  }
  
  const now = new Date();
  const expires = new Date(credential.reset_token_expires);
  
  if (now > expires) {
    return { valid: false };
  }
  
  return { valid: true, employeeId: credential.employee_id };
}

/**
 * Set password using reset token
 */
export function setPasswordWithToken(tenantId: string | null, token: string, newPassword: string): boolean {
  const verification = verifyResetToken(tenantId, token);
  
  if (!verification.valid || !verification.employeeId) {
    return false;
  }
  
  const credentials = tenantId ? getTenantEmployeeCredentials(tenantId) : getEmployeeCredentials();
  const credential = credentials.credentials.find(c => c.employee_id === verification.employeeId);
  
  if (!credential) {
    return false;
  }
  
  // Update password and clear reset token
  credential.password = newPassword;
  credential.reset_token = undefined;
  credential.reset_token_expires = undefined;
  credential.last_updated = new Date().toISOString();
  
  if (tenantId) {
    saveTenantEmployeeCredentials(tenantId, credentials);
  } else {
    saveEmployeeCredentials(credentials);
  }
  
  return true;
}

/**
 * Get employee email
 */
export function getEmployeeEmail(tenantId: string | null, employeeId: string): string | null {
  const credentials = tenantId ? getTenantEmployeeCredentials(tenantId) : getEmployeeCredentials();
  const credential = credentials.credentials.find(c => c.employee_id === employeeId);
  return credential?.email || null;
}

/**
 * Set employee email
 */
export function setEmployeeEmail(tenantId: string | null, employeeId: string, email: string): void {
  const credentials = tenantId ? getTenantEmployeeCredentials(tenantId) : getEmployeeCredentials();
  const existingIndex = credentials.credentials.findIndex(c => c.employee_id === employeeId);
  
  if (existingIndex >= 0) {
    credentials.credentials[existingIndex].email = email;
    credentials.credentials[existingIndex].last_updated = new Date().toISOString();
  } else {
    credentials.credentials.push({
      employee_id: employeeId,
      password: employeeId,
      email,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    });
  }
  
  if (tenantId) {
    saveTenantEmployeeCredentials(tenantId, credentials);
  } else {
    saveEmployeeCredentials(credentials);
  }
}

/**
 * Find which tenant an employee belongs to by searching through all active tenants
 * Returns the tenant ID if found, or null if not found
 */
export function findEmployeeTenant(employeeId: string): string | null {
  // Import getTenants dynamically to avoid circular dependencies
  const { getTenants } = require('./tenants');
  const { getDisplayForTenant, loadAllForTenant } = require('./dataStore.tenant');
  
  const tenantsData = getTenants();
  console.log(`[AUTH] findEmployeeTenant searching for: ${employeeId}`);
  console.log(`[AUTH] Total tenants: ${tenantsData.tenants.length}, Active: ${tenantsData.tenants.filter((t: any) => t.is_active).length}`);
  
  // Search through all active tenants
  for (const tenant of tenantsData.tenants) {
    if (!tenant.is_active) continue;
    
    try {
      // Load tenant data first
      loadAllForTenant(tenant.id);
      const displayData = getDisplayForTenant(tenant.id);
      console.log(`[AUTH] Checking tenant ${tenant.name} (${tenant.id}): ${displayData.allEmployees.length} employees`);
      const employee = displayData.allEmployees.find(
        (emp: any) => emp.id.toLowerCase() === employeeId.toLowerCase()
      );
      
      if (employee) {
        console.log(`[AUTH] Found employee ${employeeId} in tenant ${tenant.name}`);
        return tenant.id;
      }
    } catch (err) {
      // Tenant data might not exist yet, continue searching
      console.log(`[AUTH] Error loading tenant ${tenant.name}:`, err);
      continue;
    }
  }
  
  return null;
}
