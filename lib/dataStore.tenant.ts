import {
  getTenantGoogleDataFile, getTenantAdminDataFile, getTenantModifiedShiftsFile,
  getTenantGoogleLinksFile, getTenantScheduleRequestsFile, getTenantSettingsFile, 
  getTenantDataDir, getTenantEmployeeCredentialsFile
} from './constants';
import {
  RosterData, ModifiedShiftsData, ScheduleRequestsFile, GoogleLinks
} from './types';
import { readJSON, writeJSON, deepCopy, getMonthYearNow } from './utils';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Tenant-aware data store
 * All operations require a tenant ID for data isolation
 */

// In-memory cache per tenant
const tenantCaches: Map<string, {
  googleData: RosterData;
  adminData: RosterData;
  modifiedShifts: ModifiedShiftsData;
  googleLinks: GoogleLinks;
  scheduleRequests: ScheduleRequestsFile;
  displayData: RosterData;
  settings: {
    autoSyncEnabled: boolean;
    shiftDefinitions?: Record<string, string>;
  };
}> = new Map();

function ensureTenantDataDir(tenantId: string) {
  const dir = getTenantDataDir(tenantId);
  // @ts-ignore - Dynamic path required for multi-tenant architecture
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Ensure roster_templates subdirectory exists
  const templatesDir = path.join(dir, 'roster_templates');
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
}

function getTenantCache(tenantId: string) {
  if (!tenantCaches.has(tenantId)) {
    tenantCaches.set(tenantId, {
      googleData: {teams:{}, headers:[], allEmployees:[]},
      adminData: {teams:{}, headers:[], allEmployees:[]},
      modifiedShifts: {modifications:[], monthly_stats:{}},
      googleLinks: {},
      scheduleRequests: {
        shift_change_requests: [],
        swap_requests: [],
        approved_count: 0,
        pending_count: 0
      },
      displayData: {teams:{}, headers:[], allEmployees:[]},
      settings: {autoSyncEnabled: false}
    });
  }
  return tenantCaches.get(tenantId)!;
}

/**
 * Deduplicate employees that appear in multiple teams due to team changes
 */
function deduplicateEmployeeTeamChanges(data: RosterData) {
  const employeeTeamMap = new Map<string, string>();
  
  // First pass: map employee IDs to their current team
  Object.entries(data.teams).forEach(([teamName, employees]) => {
    employees.forEach(emp => {
      if (emp.currentTeam) {
        employeeTeamMap.set(emp.id, emp.currentTeam);
      } else {
        employeeTeamMap.set(emp.id, teamName);
      }
    });
  });
  
  // Second pass: remove employees from wrong teams
  Object.entries(data.teams).forEach(([teamName, employees]) => {
    data.teams[teamName] = employees.filter(emp => {
      const correctTeam = employeeTeamMap.get(emp.id);
      return correctTeam === teamName;
    });
  });
  
  // Rebuild allEmployees
  data.allEmployees = [];
  Object.values(data.teams).forEach(employees => {
    data.allEmployees.push(...employees);
  });
}

function mergeDisplay(tenantId: string) {
  const cache = getTenantCache(tenantId);
  const { googleData, adminData, modifiedShifts } = cache;
  
  const merged: RosterData = deepCopy(googleData);
  
  // Apply admin modifications
  Object.entries(adminData.teams).forEach(([teamName, adminEmps]) => {
    if (!merged.teams[teamName]) {
      merged.teams[teamName] = [];
    }
    
    adminEmps.forEach(adminEmp => {
      const idx = merged.teams[teamName].findIndex(e => e.id === adminEmp.id);
      if (idx >= 0) {
        merged.teams[teamName][idx] = deepCopy(adminEmp);
      } else {
        merged.teams[teamName].push(deepCopy(adminEmp));
      }
    });
  });
  
  // Rebuild allEmployees
  merged.allEmployees = [];
  Object.values(merged.teams).forEach(emps => {
    merged.allEmployees.push(...emps);
  });
  
  cache.displayData = merged;
}

// ===== LOAD/RELOAD FUNCTIONS =====

export function loadAllForTenant(tenantId: string) {
  ensureTenantDataDir(tenantId);
  const cache = getTenantCache(tenantId);
  
  cache.googleData = readJSON(getTenantGoogleDataFile(tenantId), cache.googleData);
  cache.adminData = readJSON(getTenantAdminDataFile(tenantId), cache.adminData);
  cache.modifiedShifts = readJSON(getTenantModifiedShiftsFile(tenantId), cache.modifiedShifts);
  cache.googleLinks = readJSON(getTenantGoogleLinksFile(tenantId), cache.googleLinks);
  cache.scheduleRequests = readJSON(getTenantScheduleRequestsFile(tenantId), cache.scheduleRequests);
  cache.settings = readJSON(getTenantSettingsFile(tenantId), cache.settings);
  
  // Apply deduplication
  deduplicateEmployeeTeamChanges(cache.googleData);
  deduplicateEmployeeTeamChanges(cache.adminData);
  saveGoogleForTenant(tenantId);
  saveAdminForTenant(tenantId);
  
  mergeDisplay(tenantId);
}

export function reloadAllForTenant(tenantId: string) {
  ensureTenantDataDir(tenantId);
  
  const defaultGoogle: RosterData = {teams:{}, headers:[], allEmployees:[]};
  const defaultAdmin: RosterData = {teams:{}, headers:[], allEmployees:[]};
  const defaultModified: ModifiedShiftsData = {modifications:[], monthly_stats:{}};
  const defaultLinks: GoogleLinks = {};
  const defaultRequests: ScheduleRequestsFile = {
    shift_change_requests: [],
    swap_requests: [],
    approved_count: 0,
    pending_count: 0
  };
  const defaultSettings = {autoSyncEnabled: false};
  
  const cache = getTenantCache(tenantId);
  cache.googleData = readJSON(getTenantGoogleDataFile(tenantId), defaultGoogle);
  cache.adminData = readJSON(getTenantAdminDataFile(tenantId), defaultAdmin);
  cache.modifiedShifts = readJSON(getTenantModifiedShiftsFile(tenantId), defaultModified);
  cache.googleLinks = readJSON(getTenantGoogleLinksFile(tenantId), defaultLinks);
  cache.scheduleRequests = readJSON(getTenantScheduleRequestsFile(tenantId), defaultRequests);
  cache.settings = readJSON(getTenantSettingsFile(tenantId), defaultSettings);
  
  mergeDisplay(tenantId);
}

// ===== SAVE FUNCTIONS =====

export function saveGoogleForTenant(tenantId: string) { 
  const cache = getTenantCache(tenantId);
  writeJSON(getTenantGoogleDataFile(tenantId), cache.googleData); 
}

export function saveAdminForTenant(tenantId: string) { 
  const cache = getTenantCache(tenantId);
  writeJSON(getTenantAdminDataFile(tenantId), cache.adminData); 
}

export function saveModifiedForTenant(tenantId: string) { 
  const cache = getTenantCache(tenantId);
  writeJSON(getTenantModifiedShiftsFile(tenantId), cache.modifiedShifts); 
}

export function saveLinksForTenant(tenantId: string) { 
  const cache = getTenantCache(tenantId);
  writeJSON(getTenantGoogleLinksFile(tenantId), cache.googleLinks); 
}

export function saveRequestsForTenant(tenantId: string) { 
  const cache = getTenantCache(tenantId);
  writeJSON(getTenantScheduleRequestsFile(tenantId), cache.scheduleRequests); 
}

export function saveSettingsForTenant(tenantId: string) { 
  const cache = getTenantCache(tenantId);
  writeJSON(getTenantSettingsFile(tenantId), cache.settings); 
}

// ===== GET FUNCTIONS =====

export function getGoogleForTenant(tenantId: string): RosterData { 
  return getTenantCache(tenantId).googleData; 
}

export function getAdminForTenant(tenantId: string): RosterData { 
  return getTenantCache(tenantId).adminData; 
}

export function getDisplayForTenant(tenantId: string): RosterData { 
  return getTenantCache(tenantId).displayData; 
}

export function getModifiedShiftsForTenant(tenantId: string) { 
  return getTenantCache(tenantId).modifiedShifts; 
}

export function getGoogleLinksForTenant(tenantId: string) { 
  return getTenantCache(tenantId).googleLinks; 
}

export function getScheduleRequestsForTenant(tenantId: string) { 
  return getTenantCache(tenantId).scheduleRequests; 
}

export function getSettingsForTenant(tenantId: string) { 
  return getTenantCache(tenantId).settings; 
}

// ===== SET FUNCTIONS =====

export function setGoogleForTenant(tenantId: string, data: RosterData) {
  const cache = getTenantCache(tenantId);
  cache.googleData = deepCopy(data);
  deduplicateEmployeeTeamChanges(cache.googleData);
  saveGoogleForTenant(tenantId);
  
  if (!cache.adminData || !cache.adminData.headers.length) {
    cache.adminData = deepCopy(data);
    deduplicateEmployeeTeamChanges(cache.adminData);
    saveAdminForTenant(tenantId);
  } else {
    // Add newly discovered employees
    Object.entries(data.teams).forEach(([teamName, emps])=>{
      if (!cache.adminData.teams[teamName]) cache.adminData.teams[teamName] = [];
      emps.forEach(gEmp=>{
        const exists = cache.adminData.teams[teamName].some(aEmp=>aEmp.id===gEmp.id);
        if (!exists) {
          cache.adminData.teams[teamName].push(deepCopy(gEmp));
        }
      });
    });
    // Sync headers
    if (data.headers && data.headers.length > 0) {
      cache.adminData.headers = [...data.headers];
    }
    deduplicateEmployeeTeamChanges(cache.adminData);
    saveAdminForTenant(tenantId);
  }
  mergeDisplay(tenantId);
}

export function setAdminForTenant(tenantId: string, data: RosterData) {
  const cache = getTenantCache(tenantId);
  cache.adminData = deepCopy(data);
  deduplicateEmployeeTeamChanges(cache.adminData);
  saveAdminForTenant(tenantId);
  mergeDisplay(tenantId);
}

export function setModifiedShiftsForTenant(tenantId: string, data: ModifiedShiftsData) {
  const cache = getTenantCache(tenantId);
  cache.modifiedShifts = data;
  saveModifiedForTenant(tenantId);
}

export function setGoogleLinksForTenant(tenantId: string, data: GoogleLinks) {
  const cache = getTenantCache(tenantId);
  cache.googleLinks = data;
  saveLinksForTenant(tenantId);
}

export function setScheduleRequestsForTenant(tenantId: string, data: ScheduleRequestsFile) {
  const cache = getTenantCache(tenantId);
  cache.scheduleRequests = data;
  saveRequestsForTenant(tenantId);
}

export function setSettingsForTenant(tenantId: string, data: {autoSyncEnabled: boolean}) {
  const cache = getTenantCache(tenantId);
  cache.settings = data;
  saveSettingsForTenant(tenantId);
}

// ===== HELPER FUNCTIONS =====

export function getPendingRequestsForTenant(tenantId: string) {
  const file = getScheduleRequestsForTenant(tenantId);
  return [
    ...file.shift_change_requests.filter(r=>r.status==='pending'),
    ...file.swap_requests.filter(r=>r.status==='pending')
  ];
}

export function getAllRequestsSortedForTenant(tenantId: string) {
  const file = getScheduleRequestsForTenant(tenantId);
  const all = [
    ...file.shift_change_requests,
    ...file.swap_requests
  ];
  // Sort: pending first (by created_at desc), then non-pending (by created_at desc)
  const getTime = (r:any) => r?.created_at || r?.approved_at || '';
  const pending = all.filter((r:any)=> r.status === 'pending')
    .sort((a:any,b:any)=> getTime(b).localeCompare(getTime(a)));
  const completed = all.filter((r:any)=> r.status !== 'pending')
    .sort((a:any,b:any)=> getTime(b).localeCompare(getTime(a)));
  return [...pending, ...completed];
}

function updateCountsForTenant(tenantId: string) {
  const file = getScheduleRequestsForTenant(tenantId);
  file.pending_count =
    file.shift_change_requests.filter(r=>r.status==='pending').length +
    file.swap_requests.filter(r=>r.status==='pending').length;
}

export function addScheduleChangeRequestForTenant(
  tenantId: string,
  r: Omit<import('./types').ScheduleRequestChange,'id'|'status'|'type'|'created_at'|'approved_at'|'approved_by'>
) {
  const file = getScheduleRequestsForTenant(tenantId);
  const newReq = {
    ...r,
    id: `shift_change_${file.shift_change_requests.length+1}`,
    status: 'pending' as const,
    type: 'shift_change' as const,
    created_at: new Date().toISOString(),
    approved_at: null,
    approved_by: null
  };
  file.shift_change_requests.push(newReq);
  updateCountsForTenant(tenantId);
  saveRequestsForTenant(tenantId);
  return newReq;
}

export function addSwapRequestForTenant(
  tenantId: string,
  r: Omit<import('./types').ScheduleRequestSwap,'id'|'status'|'type'|'created_at'|'approved_at'|'approved_by'>
) {
  const file = getScheduleRequestsForTenant(tenantId);
  const newReq = {
    ...r,
    id: `swap_${file.swap_requests.length+1}`,
    status: 'pending' as const,
    type: 'swap' as const,
    created_at: new Date().toISOString(),
    approved_at: null,
    approved_by: null
  };
  file.swap_requests.push(newReq);
  updateCountsForTenant(tenantId);
  saveRequestsForTenant(tenantId);
  return newReq;
}

export function updateRequestStatusForTenant(
  tenantId: string,
  id: string,
  status: 'approved'|'rejected',
  user: string,
  adminMessage?: string
) {
  const file = getScheduleRequestsForTenant(tenantId);
  const sc = file.shift_change_requests.find(r=>r.id===id);
  if (sc) {
    sc.status = status;
    sc.updated_at = new Date().toISOString();
    if (adminMessage) {
      sc.admin_message = adminMessage;
    }
    if (status==='approved') {
      sc.approved_at = new Date().toISOString();
      sc.approved_by = user;
      file.approved_count += 1;
    }
    updateCountsForTenant(tenantId);
    saveRequestsForTenant(tenantId);
    return sc;
  }
  const sw = file.swap_requests.find(r=>r.id===id);
  if (sw) {
    sw.status = status;
    sw.updated_at = new Date().toISOString();
    if (adminMessage) {
      sw.admin_message = adminMessage;
    }
    if (status==='approved') {
      sw.approved_at = new Date().toISOString();
      sw.approved_by = user;
      file.approved_count += 1;
    }
    updateCountsForTenant(tenantId);
    saveRequestsForTenant(tenantId);
    return sw;
  }
  return null;
}

export function addGoogleLinkForTenant(tenantId: string, monthYear: string, link: string) {
  const cache = getTenantCache(tenantId);
  cache.googleLinks[monthYear] = link;
  saveLinksForTenant(tenantId);
}

export function deleteGoogleLinkForTenant(tenantId: string, monthYear: string) {
  const cache = getTenantCache(tenantId);
  delete cache.googleLinks[monthYear];
  saveLinksForTenant(tenantId);
}

export function resetAdminToGoogleForTenant(tenantId: string) {
  const cache = getTenantCache(tenantId);
  cache.adminData = deepCopy(cache.googleData);
  deduplicateEmployeeTeamChanges(cache.adminData);
  saveAdminForTenant(tenantId);
  mergeDisplay(tenantId);
}

export function setAutoSyncEnabledForTenant(tenantId: string, enabled: boolean) {
  const cache = getTenantCache(tenantId);
  cache.settings.autoSyncEnabled = enabled;
  saveSettingsForTenant(tenantId);
}

export function getAutoSyncEnabledForTenant(tenantId: string) {
  const cache = getTenantCache(tenantId);
  return cache.settings.autoSyncEnabled;
}

export function trackModifiedShiftForTenant(
  tenantId: string,
  employee_id: string,
  date_index: number,
  old_shift: string,
  new_shift: string,
  employee_name: string,
  team_name: string,
  date_header: string,
  modified_by: string
) {
  const cache = getTenantCache(tenantId);
  const mod = {
    employee_id,
    date_index,
    old_shift,
    new_shift,
    employee_name,
    team_name,
    date_header,
    modified_by,
    timestamp: new Date().toISOString(),
    month_year: getMonthYearNow()
  };
  
  cache.modifiedShifts.modifications.push(mod);
  const month = mod.month_year;
  
  if (!cache.modifiedShifts.monthly_stats[month]) {
    cache.modifiedShifts.monthly_stats[month] = {
      total_modifications: 0,
      employees_modified: [],
      modifications_by_user: {}
    };
  }
  
  const stats = cache.modifiedShifts.monthly_stats[month];
  stats.total_modifications++;
  
  if (!stats.employees_modified.includes(employee_id)) {
    stats.employees_modified.push(employee_id);
  }
  
  if (!stats.modifications_by_user[modified_by]) {
    stats.modifications_by_user[modified_by] = 0;
  }
  stats.modifications_by_user[modified_by]++;
  
  saveModifiedForTenant(tenantId);
}

export function mergeDisplayForTenant(tenantId: string) {
  mergeDisplay(tenantId);
}

export function getShiftDefinitionsForTenant(tenantId: string): Record<string, string> {
  const cache = getTenantCache(tenantId);
  // Return tenant-specific shifts or default from constants
  if (cache.settings.shiftDefinitions && Object.keys(cache.settings.shiftDefinitions).length > 0) {
    return cache.settings.shiftDefinitions;
  }
  
  // Default shift definitions
  return {
    M2: "8 AM – 5 PM",
    M3: "9 AM – 6 PM",
    M4: "10 AM – 7 PM",
    D1: "12 PM – 9 PM",
    D2: "1 PM – 10 PM",
    DO: "OFF",
    SL: "Sick Leave",
    CL: "Casual Leave",
    EL: "Emergency Leave",
    HL: "Holiday Leave",
    "": "N/A"
  };
}

export function setShiftDefinitionsForTenant(tenantId: string, shiftDefinitions: Record<string, string>) {
  const cache = getTenantCache(tenantId);
  cache.settings.shiftDefinitions = shiftDefinitions;
  saveSettingsForTenant(tenantId);
}

export function updateShiftDefinitionForTenant(tenantId: string, code: string, description: string) {
  const cache = getTenantCache(tenantId);
  if (!cache.settings.shiftDefinitions) {
    cache.settings.shiftDefinitions = getShiftDefinitionsForTenant(tenantId);
  }
  cache.settings.shiftDefinitions[code] = description;
  saveSettingsForTenant(tenantId);
}

export function deleteShiftDefinitionForTenant(tenantId: string, code: string) {
  const cache = getTenantCache(tenantId);
  if (!cache.settings.shiftDefinitions) {
    cache.settings.shiftDefinitions = {};
  }
  if (cache.settings.shiftDefinitions[code]) {
    delete cache.settings.shiftDefinitions[code];
    saveSettingsForTenant(tenantId);
    // Reload settings from disk to ensure cache is fresh
    cache.settings = readJSON(getTenantSettingsFile(tenantId), cache.settings);
  } else {
    console.warn(`Shift code "${code}" not found in shift definitions. Available codes:`, Object.keys(cache.settings.shiftDefinitions));
  }
}

/**
 * Mark an employee as inactive (soft delete)
 * Keeps credentials and all data but prevents login and ID reuse
 */
export function deactivateEmployee(tenantId: string, employeeId: string) {
  const credFile = getTenantEmployeeCredentialsFile(tenantId);
  try {
    const credentials: { credentials: any[] } = readJSON(credFile, { credentials: [] });
    const cred = credentials.credentials.find((c: any) => c.employee_id === employeeId);
    if (cred) {
      cred.status = 'inactive';
      cred.deleted_at = new Date().toISOString();
    }
    writeJSON(credFile, credentials);
  } catch (error) {
    console.error('Failed to deactivate employee:', error);
  }
}

/**
 * Delete an employee's login credentials (kept for backward compatibility)
 */
export function deleteEmployeeCredential(tenantId: string, employeeId: string) {
  const credFile = getTenantEmployeeCredentialsFile(tenantId);
  try {
    const credentials = readJSON(credFile, { credentials: [] });
    credentials.credentials = credentials.credentials.filter((c: any) => c.employee_id !== employeeId);
    writeJSON(credFile, credentials);
  } catch (error) {
    console.error('Failed to delete employee credential:', error);
  }
}

/**
 * Reactivate an employee's login credentials
 * Clears deleted_at and marks credential as active
 */
export function reactivateEmployeeCredential(tenantId: string, employeeId: string) {
  const credFile = getTenantEmployeeCredentialsFile(tenantId);
  try {
    const credentials: { credentials: any[] } = readJSON(credFile, { credentials: [] });
    const cred = credentials.credentials.find((c: any) => c.employee_id === employeeId);
    if (cred) {
      cred.status = 'active';
      if (cred.deleted_at) delete cred.deleted_at;
    }
    writeJSON(credFile, credentials);
  } catch (error) {
    console.error('Failed to reactivate employee credential:', error);
  }
}

/**
 * Check if an employee ID already exists in the system
 * Searches across all teams in both admin and google data, plus credentials
 */
export function employeeIdExists(tenantId: string, employeeId: string): boolean {
  const cache = getTenantCache(tenantId);
  
  // Check in admin data (all teams)
  for (const team of Object.values(cache.adminData.teams)) {
    if (team.some(emp => emp.id === employeeId)) {
      return true;
    }
  }
  
  // Check in google data (all teams)
  for (const team of Object.values(cache.googleData.teams)) {
    if (team.some(emp => emp.id === employeeId)) {
      return true;
    }
  }
  
  // Check in employee credentials
  try {
    const credFile = getTenantEmployeeCredentialsFile(tenantId);
    const credentials: { credentials: any[] } = readJSON(credFile, { credentials: [] });
    if (credentials.credentials.some(cred => cred.employee_id === employeeId)) {
      return true;
    }
  } catch (error) {
    console.log('No employee credentials file yet');
  }
  
  return false;
}
