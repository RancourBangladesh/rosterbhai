export interface Employee {
  name: string;
  id: string;
  currentTeam?: string;
  team?: string;
  schedule: string[];
  allTeams?: string[];
  status?: 'active' | 'inactive'; // Employee status for soft deletion
  deleted_at?: string; // Timestamp when employee was deactivated
}
export interface RosterData {
  teams: Record<string, Employee[]>;
  headers: string[];
  allEmployees: Employee[];
}
export interface Modification {
  employee_id: string;
  employee_name: string;
  team_name: string;
  date_index: number;
  date_header: string;
  old_shift: string;
  new_shift: string;
  modified_by: string;
  timestamp: string;
  month_year: string;
}
export interface ModifiedShiftsData {
  modifications: Modification[];
  monthly_stats: {
    [monthYear: string]: {
      total_modifications: number;
      employees_modified: string[];
      modifications_by_user: Record<string, number>;
    };
  };
}
export interface ScheduleRequestChange {
  id: string;
  employee_id: string;
  employee_name: string;
  team: string;
  date: string;
  current_shift: string;
  requested_shift: string;
  reason: string;
  status: "pending"|"approved"|"rejected";
  type: "shift_change";
  created_at: string;
  updated_at?: string;
  approved_at: string|null;
  approved_by: string|null;
  admin_message?: string;
}
export interface ScheduleRequestSwap {
  id: string;
  requester_id: string;
  requester_name: string;
  target_employee_id: string;
  target_employee_name: string;
  team: string;
  date: string;
  requester_shift: string;
  target_shift: string;
  reason: string;
  status: "pending"|"approved"|"rejected";
  type: "swap";
  created_at: string;
  updated_at?: string;
  approved_at: string|null;
  approved_by: string|null;
  admin_message?: string;
}
export interface ScheduleRequestsFile {
  shift_change_requests: ScheduleRequestChange[];
  swap_requests: ScheduleRequestSwap[];
  approved_count: number;
  pending_count: number;
}
export interface GoogleLinks { [monthYear: string]: string; }

export interface LoginPayload { username: string; password: string; }

export interface AdminUser {
  username: string;
  password: string;
  role: string;
  full_name: string;
  created_at: string;
  tenant_id?: string; // For tenant-scoped admin users
}

export interface AdminUsersFile {
  users: AdminUser[];
}

// Multi-tenant types
export interface Tenant {
  id: string;
  name: string;
  slug: string; // URL-friendly identifier
  created_at: string;
  is_active: boolean;
  settings: {
    max_users?: number;
    max_employees?: number;
    organization_name?: string; // Display name for the organization
    logo_url?: string; // URL or base64 data for organization logo
  };
  // Optional subscription info for self-serve tenants
  subscription?: {
    plan: 'monthly' | 'yearly';
    status: 'pending' | 'active';
    created_at: string; // when the signup happened
    started_at?: string; // when activated by developer
    expires_at?: string; // computed from started_at + duration
  };
  // Optional contact info provided during signup
  contact_email?: string;
  contact_phone?: string;
}

export interface TenantsFile {
  tenants: Tenant[];
}

export interface DeveloperUser {
  username: string;
  password: string;
  full_name: string;
  created_at: string;
  role: 'developer';
}

export interface DevelopersFile {
  developers: DeveloperUser[];
}

// Employee credentials for login
export interface EmployeeCredential {
  employee_id: string;
  password: string; // In production, this should be hashed
  created_at: string;
  last_updated: string;
  email?: string; // Employee email for password reset
  reset_token?: string; // Token for password reset
  reset_token_expires?: string; // Expiration time for reset token
  status?: 'active' | 'inactive'; // Credential status for soft deletion
  deleted_at?: string; // Timestamp when credential was deactivated
}

export interface EmployeeCredentialsFile {
  credentials: EmployeeCredential[];
}