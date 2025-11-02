import { v4 as uuidv4 } from 'uuid';
import { Tenant, TenantsFile, AdminUsersFile, AdminUser } from './types';
import { readJSON, writeJSON } from './utils';
import { TENANTS_FILE, getTenantAdminUsersFile } from './constants';
import { addDays, isoNow } from './utils';

/**
 * Get all tenants
 */
export function getTenants(): TenantsFile {
  return readJSON(TENANTS_FILE, { tenants: [] });
}

/**
 * Save tenants to file
 */
export function saveTenants(data: TenantsFile) {
  writeJSON(TENANTS_FILE, data);
}

/**
 * Get a specific tenant by ID
 */
export function getTenantById(tenantId: string): Tenant | null {
  const tenantsData = getTenants();
  return tenantsData.tenants.find(t => t.id === tenantId) || null;
}

/**
 * Get a specific tenant by slug
 */
export function getTenantBySlug(slug: string): Tenant | null {
  const tenantsData = getTenants();
  return tenantsData.tenants.find(t => t.slug === slug) || null;
}

/**
 * Create a new tenant
 */
export function createTenant(data: {
  name: string;
  slug: string;
  max_users?: number;
  max_employees?: number;
}): Tenant {
  const tenantsData = getTenants();
  
  // Check if slug already exists
  if (tenantsData.tenants.find(t => t.slug === data.slug)) {
    throw new Error('Tenant with this slug already exists');
  }
  
  const newTenant: Tenant = {
    id: uuidv4(),
    name: data.name,
    slug: data.slug,
    created_at: new Date().toISOString(),
    is_active: true,
    settings: {
      max_users: data.max_users,
      max_employees: data.max_employees
    }
  };
  
  tenantsData.tenants.push(newTenant);
  saveTenants(tenantsData);
  
  // Initialize tenant's admin users file
  const tenantAdminUsers: AdminUsersFile = { users: [] };
  writeJSON(getTenantAdminUsersFile(newTenant.id), tenantAdminUsers);
  
  return newTenant;
}

/**
 * Public signup: creates an INACTIVE tenant with subscription plan and contact info
 */
export function createTenantPublic(data: {
  name: string;
  slug: string;
  plan: 'monthly'|'yearly';
  contact_email?: string;
  contact_phone?: string;
}): Tenant {
  const tenantsData = getTenants();

  if (tenantsData.tenants.find(t => t.slug === data.slug)) {
    throw new Error('Tenant with this slug already exists');
  }

  const now = isoNow();
  const newTenant: Tenant = {
    id: uuidv4(),
    name: data.name,
    slug: data.slug,
    created_at: now,
    is_active: false, // pending verification
    settings: {},
    subscription: {
      plan: data.plan,
      status: 'pending',
      created_at: now
    },
    contact_email: data.contact_email,
    contact_phone: data.contact_phone
  };

  tenantsData.tenants.push(newTenant);
  saveTenants(tenantsData);

  // Initialize admin users file for later
  const tenantAdminUsers: AdminUsersFile = { users: [] };
  writeJSON(getTenantAdminUsersFile(newTenant.id), tenantAdminUsers);

  return newTenant;
}

/**
 * Update a tenant
 */
export function updateTenant(tenantId: string, updates: Partial<{
  name: string;
  slug: string;
  is_active: boolean;
  settings: Tenant['settings'];
  subscription: Partial<Tenant['subscription']>;
}>): Tenant {
  const tenantsData = getTenants();
  const tenantIndex = tenantsData.tenants.findIndex(t => t.id === tenantId);
  
  if (tenantIndex === -1) {
    throw new Error('Tenant not found');
  }
  
  // If updating slug, check for conflicts
  if (updates.slug && updates.slug !== tenantsData.tenants[tenantIndex].slug) {
    if (tenantsData.tenants.find(t => t.slug === updates.slug)) {
      throw new Error('Tenant with this slug already exists');
    }
  }
  
  const prev = tenantsData.tenants[tenantIndex];
  let next: Tenant = { ...prev } as Tenant;

  // Merge settings
  if (updates.name !== undefined) next.name = updates.name;
  if (updates.slug !== undefined) next.slug = updates.slug;
  if (updates.is_active !== undefined) next.is_active = updates.is_active;
  if (updates.settings !== undefined) next.settings = { ...prev.settings, ...updates.settings };

  // Handle subscription updates carefully
  if (updates.subscription) {
    const incoming = updates.subscription;
    const existing = prev.subscription || undefined;
    const nowIso = isoNow();

    // Start with baseline
    next.subscription = {
      plan: incoming.plan ?? existing?.plan ?? 'monthly',
      status: incoming.status ?? existing?.status ?? 'pending',
      created_at: existing?.created_at ?? nowIso,
      started_at: incoming.started_at ?? existing?.started_at,
      expires_at: incoming.expires_at ?? existing?.expires_at,
    };

    // If tenant is active, ensure started_at/expires_at reflect current plan
    if (next.is_active) {
      const planDays = next.subscription.plan === 'yearly' ? 365 : 30;
      // If plan changed or no expiry yet, reset start/expiry from now
      const planChanged = existing && incoming.plan && incoming.plan !== existing.plan;
      if (planChanged || !next.subscription.started_at || !next.subscription.expires_at) {
        next.subscription.started_at = nowIso;
        next.subscription.expires_at = addDays(nowIso, planDays);
      }
      next.subscription.status = 'active';
    } else {
      // If not active, subscription is pending and has no expiry
      next.subscription.status = 'pending';
      next.subscription.started_at = undefined;
      next.subscription.expires_at = undefined;
    }
  }

  // If activating and there is a subscription without start, start it now
  if (updates.is_active === true && prev.is_active === false && next.subscription) {
    const start = isoNow();
    const planDays = next.subscription.plan === 'yearly' ? 365 : 30;
    next.subscription.started_at = start;
    next.subscription.status = 'active';
    next.subscription.expires_at = addDays(start, planDays);
  }
  tenantsData.tenants[tenantIndex] = next;
  
  saveTenants(tenantsData);
  return tenantsData.tenants[tenantIndex];
}

/**
 * Delete a tenant (soft delete by setting is_active to false)
 */
export function deleteTenant(tenantId: string): void {
  updateTenant(tenantId, { is_active: false });
}

/**
 * Get all admin users for a specific tenant
 */
export function getTenantAdminUsers(tenantId: string): AdminUsersFile {
  return readJSON(getTenantAdminUsersFile(tenantId), { users: [] });
}

/**
 * Save admin users for a specific tenant
 */
export function saveTenantAdminUsers(tenantId: string, data: AdminUsersFile) {
  writeJSON(getTenantAdminUsersFile(tenantId), data);
}

/**
 * Add an admin user to a tenant
 */
export function addTenantAdminUser(tenantId: string, user: Omit<AdminUser, 'created_at' | 'tenant_id'>): AdminUser {
  const adminUsers = getTenantAdminUsers(tenantId);
  
  // Check if user already exists
  if (adminUsers.users.find(u => u.username === user.username)) {
    throw new Error('User with this username already exists in this tenant');
  }
  
  const newUser: AdminUser = {
    ...user,
    tenant_id: tenantId,
    created_at: new Date().toISOString()
  };
  
  adminUsers.users.push(newUser);
  saveTenantAdminUsers(tenantId, adminUsers);
  
  return newUser;
}

/**
 * Validate tenant context from subdomain or path
 */
export function getTenantFromRequest(hostname: string, pathname?: string): Tenant | null {
  // Try to extract tenant from subdomain (e.g., tenant1.domain.com)
  const parts = hostname.split('.');
  if (parts.length > 2) {
    const subdomain = parts[0];
    const tenant = getTenantBySlug(subdomain);
    if (tenant && tenant.is_active) {
      return tenant;
    }
  }
  
  // Try to extract from path (e.g., /tenant/tenant1/...)
  if (pathname) {
    const match = pathname.match(/^\/tenant\/([^\/]+)/);
    if (match) {
      const slug = match[1];
      const tenant = getTenantBySlug(slug);
      if (tenant && tenant.is_active) {
        return tenant;
      }
    }
  }
  
  return null;
}
