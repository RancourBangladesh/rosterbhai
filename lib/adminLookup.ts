import { getTenants } from './tenants';
import { getTenantAdminUsers } from './tenants';

/**
 * Find which tenant an admin user belongs to
 * Returns tenant ID if found, null otherwise
 */
export function findAdminTenant(username: string): string | null {
  const tenantsData = getTenants();
  
  for (const tenant of tenantsData.tenants) {
    if (!tenant.is_active) continue;
    
    try {
      const adminUsers = getTenantAdminUsers(tenant.id);
      const found = adminUsers.users.find(u => u.username === username);
      if (found) {
        return tenant.id;
      }
    } catch (err) {
      // Tenant data might not be initialized yet
      continue;
    }
  }
  
  return null;
}

/**
 * Find admin user across all tenants
 */
export function findAdminUser(username: string): { tenantId: string; user: any } | null {
  const tenantsData = getTenants();
  
  for (const tenant of tenantsData.tenants) {
    if (!tenant.is_active) continue;
    
    try {
      const adminUsers = getTenantAdminUsers(tenant.id);
      const found = adminUsers.users.find(u => u.username === username);
      if (found) {
        return { tenantId: tenant.id, user: found };
      }
    } catch (err) {
      continue;
    }
  }
  
  return null;
}
