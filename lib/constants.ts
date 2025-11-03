export const DATA_DIR = "data";

// Multi-tenant system files
export const TENANTS_FILE = `${DATA_DIR}/tenants.json`;
export const DEVELOPERS_FILE = `${DATA_DIR}/developers.json`;

// Tenant-specific data paths
export function getTenantDataDir(tenantId: string) {
  return `${DATA_DIR}/tenants/${tenantId}`;
}

export function getTenantGoogleDataFile(tenantId: string) {
  return `${getTenantDataDir(tenantId)}/google_data.json`;
}

export function getTenantAdminDataFile(tenantId: string) {
  return `${getTenantDataDir(tenantId)}/admin_data.json`;
}

export function getTenantModifiedShiftsFile(tenantId: string) {
  return `${getTenantDataDir(tenantId)}/modified_shifts.json`;
}

export function getTenantGoogleLinksFile(tenantId: string) {
  return `${getTenantDataDir(tenantId)}/google_links.json`;
}

export function getTenantScheduleRequestsFile(tenantId: string) {
  return `${getTenantDataDir(tenantId)}/schedule_requests.json`;
}

export function getTenantAdminUsersFile(tenantId: string) {
  return `${getTenantDataDir(tenantId)}/admin_users.json`;
}

export function getTenantSettingsFile(tenantId: string) {
  return `${getTenantDataDir(tenantId)}/settings.json`;
}

export function getTenantRosterTemplatesDir(tenantId: string) {
  return `${getTenantDataDir(tenantId)}/roster_templates`;
}

export function getTenantEmployeeCredentialsFile(tenantId: string) {
  return `${getTenantDataDir(tenantId)}/employee_credentials.json`;
}

// Legacy file paths (kept for backward compatibility during migration)
export const GOOGLE_DATA_FILE = `${DATA_DIR}/google_data.json`;
export const ADMIN_DATA_FILE = `${DATA_DIR}/admin_data.json`;
export const MODIFIED_SHIFTS_FILE = `${DATA_DIR}/modified_shifts.json`;
export const GOOGLE_LINKS_FILE = `${DATA_DIR}/google_links.json`;
export const SCHEDULE_REQUESTS_FILE = `${DATA_DIR}/schedule_requests.json`;
export const ADMIN_USERS_FILE = `${DATA_DIR}/admin_users.json`;
export const SETTINGS_FILE = `${DATA_DIR}/settings.json`;
export const ROSTER_TEMPLATES_DIR = `${DATA_DIR}/roster_templates`;
export const EMPLOYEE_CREDENTIALS_FILE = `${DATA_DIR}/employee_credentials.json`;

export const SHIFT_MAP: Record<string,string> = {
  M2:"8 AM – 5 PM",
  M3:"9 AM – 6 PM",
  M4:"10 AM – 7 PM",
  D1:"12 PM – 9 PM",
  D2:"1 PM – 10 PM",
  DO:"OFF",
  SL:"Sick Leave",
  CL:"Casual Leave",
  EL:"Emergency Leave",
  HL:"Holiday Leave",
  "":"N/A"
};

export const VALID_SHIFT_CODES = ['M2', 'M3', 'M4', 'D1', 'D2', 'DO', 'SL', 'CL', 'EL', 'HL'];

export const ADMIN_SESSION_COOKIE = "admin_session_v1";
export const DEVELOPER_SESSION_COOKIE = "developer_session_v1";