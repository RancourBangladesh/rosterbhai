import crypto from 'crypto';
import { cookies } from 'next/headers';
import { ADMIN_SESSION_COOKIE, DEVELOPER_SESSION_COOKIE, ADMIN_USERS_FILE, DEVELOPERS_FILE, getTenantAdminUsersFile } from './constants';
import { readJSON, writeJSON } from './utils';
import { AdminUsersFile, AdminUser, DevelopersFile, DeveloperUser } from './types';
import { getTenantAdminUsers, saveTenantAdminUsers } from './tenants';

interface SessionValue {
  username: string;
  ts: number;
  sig: string;
  tenantId?: string;
}

interface DeveloperSessionValue {
  username: string;
  ts: number;
  sig: string;
  role: 'developer';
}

function sign(value:string, secret: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

// ===== ADMIN SESSION MANAGEMENT =====

export function createSession(username: string, tenantId?: string) {
  const secret = process.env.APP_SECRET || 'dev_secret';
  const ts = Date.now();
  const payload = JSON.stringify({username, ts, tenantId});
  const sig = sign(payload, secret);
  cookies().set(ADMIN_SESSION_COOKIE, Buffer.from(JSON.stringify({username, ts, sig, tenantId})).toString('base64'), {
    httpOnly: true,
    path:'/',
    maxAge: 60*60*8
  });
}

export function destroySession() {
  cookies().set(ADMIN_SESSION_COOKIE, '', { path:'/', maxAge:0 });
}

// ===== DEVELOPER SESSION MANAGEMENT =====

export function createDeveloperSession(username: string) {
  const secret = process.env.APP_SECRET || 'dev_secret';
  const ts = Date.now();
  const payload = JSON.stringify({username, ts, role: 'developer'});
  const sig = sign(payload, secret);
  cookies().set(DEVELOPER_SESSION_COOKIE, Buffer.from(JSON.stringify({username, ts, sig, role: 'developer'})).toString('base64'), {
    httpOnly: true,
    path:'/',
    maxAge: 60*60*8
  });
}

export function destroyDeveloperSession() {
  cookies().set(DEVELOPER_SESSION_COOKIE, '', { path:'/', maxAge:0 });
}

export function getSessionUser(): string|null {
  const secret = process.env.APP_SECRET || 'dev_secret';
  const c = cookies().get(ADMIN_SESSION_COOKIE);
  if (!c) return null;
  try {
    const raw = JSON.parse(Buffer.from(c.value,'base64').toString());
    const sigCheck = sign(JSON.stringify({username:raw.username, ts:raw.ts, tenantId:raw.tenantId}), secret);
    if (sigCheck !== raw.sig) return null;
    return raw.username;
  } catch {
    return null;
  }
}

export function getSessionTenantId(): string|null {
  const c = cookies().get(ADMIN_SESSION_COOKIE);
  if (!c) return null;
  try {
    const raw = JSON.parse(Buffer.from(c.value,'base64').toString());
    return raw.tenantId || null;
  } catch {
    return null;
  }
}

export function getSessionUserData(): AdminUser | null {
  const username = getSessionUser();
  const tenantId = getSessionTenantId();
  if (!username) return null;
  
  try {
    if (tenantId) {
      const adminUsers = getTenantAdminUsers(tenantId);
      const user = adminUsers.users.find(u => u.username === username);
      return user || null;
    } else {
      // Legacy fallback
      const adminUsers = getAdminUsers();
      const user = adminUsers.users.find(u => u.username === username);
      return user || null;
    }
  } catch {
    return null;
  }
}

export function requireAdmin(): string {
  const u = getSessionUser();
  if (!u) throw new Error("Unauthorized");
  return u;
}

export function requireTenantAdmin(): { username: string; tenantId: string } {
  const username = getSessionUser();
  const tenantId = getSessionTenantId();
  if (!username || !tenantId) throw new Error("Unauthorized - Tenant context required");
  return { username, tenantId };
}

// ===== DEVELOPER SESSION =====

export function getDeveloperSessionUser(): string|null {
  const secret = process.env.APP_SECRET || 'dev_secret';
  const c = cookies().get(DEVELOPER_SESSION_COOKIE);
  if (!c) return null;
  try {
    const raw = JSON.parse(Buffer.from(c.value,'base64').toString());
    const sigCheck = sign(JSON.stringify({username:raw.username, ts:raw.ts, role: 'developer'}), secret);
    if (sigCheck !== raw.sig) return null;
    if (raw.role !== 'developer') return null;
    return raw.username;
  } catch {
    return null;
  }
}

export function getDeveloperSessionUserData(): DeveloperUser | null {
  const username = getDeveloperSessionUser();
  if (!username) return null;
  
  try {
    const developers = getDevelopers();
    const user = developers.developers.find(u => u.username === username);
    return user || null;
  } catch {
    return null;
  }
}

export function requireDeveloper(): string {
  const u = getDeveloperSessionUser();
  if (!u) throw new Error("Unauthorized - Developer access required");
  return u;
}

// ===== VALIDATION FUNCTIONS =====

export function validateAdminLogin(username: string, password: string, tenantId?: string): boolean {
  try {
    if (tenantId) {
      // Tenant-scoped login
      const adminUsers = getTenantAdminUsers(tenantId);
      const found = adminUsers.users.find((u: AdminUser) => 
        u.username === username && u.password === password
      );
      return !!found;
    } else {
      // Legacy login (for backward compatibility during migration)
      const adminUsers: AdminUsersFile = readJSON(ADMIN_USERS_FILE, { users: [] });
      const found = adminUsers.users.find((u: AdminUser) => 
        u.username === username && u.password === password
      );
      if (found) return true;
      
      // Fallback to environment variable
      const arr = JSON.parse(process.env.ADMIN_USERS_JSON || '[]');
      return !!arr.find((u:any)=>u.username===username && u.password===password);
    }
  } catch {
    return false;
  }
}

export function validateDeveloperLogin(username: string, password: string): boolean {
  try {
    const developers = getDevelopers();
    const found = developers.developers.find((u: DeveloperUser) => 
      u.username === username && u.password === password
    );
    return !!found;
  } catch {
    return false;
  }
}

export function getAdminUsers(): AdminUsersFile {
  return readJSON(ADMIN_USERS_FILE, { users: [] });
}

export function saveAdminUsers(data: AdminUsersFile) {
  writeJSON(ADMIN_USERS_FILE, data);
}

export function addAdminUser(user: Omit<AdminUser, 'created_at'>): AdminUser {
  const adminUsers = getAdminUsers();
  const newUser: AdminUser = {
    ...user,
    created_at: new Date().toISOString()
  };
  adminUsers.users.push(newUser);
  saveAdminUsers(adminUsers);
  return newUser;
}

export function updateAdminUser(username: string, updates: Partial<AdminUser>): boolean {
  const adminUsers = getAdminUsers();
  const userIndex = adminUsers.users.findIndex(u => u.username === username);
  if (userIndex === -1) return false;
  
  adminUsers.users[userIndex] = {
    ...adminUsers.users[userIndex],
    ...updates
  };
  saveAdminUsers(adminUsers);
  return true;
}

export function deleteAdminUser(username: string): boolean {
  const adminUsers = getAdminUsers();
  const initialLength = adminUsers.users.length;
  adminUsers.users = adminUsers.users.filter(u => u.username !== username);
  if (adminUsers.users.length < initialLength) {
    saveAdminUsers(adminUsers);
    return true;
  }
  return false;
}

// ===== DEVELOPER MANAGEMENT =====

export function getDevelopers(): DevelopersFile {
  return readJSON(DEVELOPERS_FILE, { developers: [] });
}

export function saveDevelopers(data: DevelopersFile) {
  writeJSON(DEVELOPERS_FILE, data);
}

export function addDeveloper(user: Omit<DeveloperUser, 'created_at' | 'role'>): DeveloperUser {
  const developers = getDevelopers();
  
  // Check if developer already exists
  if (developers.developers.find((u: DeveloperUser) => u.username === user.username)) {
    throw new Error('Developer with this username already exists');
  }
  
  const newUser: DeveloperUser = {
    ...user,
    role: 'developer',
    created_at: new Date().toISOString()
  };
  developers.developers.push(newUser);
  saveDevelopers(developers);
  return newUser;
}

export function updateDeveloper(username: string, updates: Partial<Omit<DeveloperUser, 'role'>>): boolean {
  const developers = getDevelopers();
  const userIndex = developers.developers.findIndex((u: DeveloperUser) => u.username === username);
  if (userIndex === -1) return false;
  
  developers.developers[userIndex] = {
    ...developers.developers[userIndex],
    ...updates,
    role: 'developer' // Ensure role stays as developer
  };
  saveDevelopers(developers);
  return true;
}

export function deleteDeveloper(username: string): boolean {
  const developers = getDevelopers();
  const initialLength = developers.developers.length;
  developers.developers = developers.developers.filter((u: DeveloperUser) => u.username !== username);
  if (developers.developers.length < initialLength) {
    saveDevelopers(developers);
    return true;
  }
  return false;
}