/**
 * Multi-tenant Data Store
 * 
 * This file provides both tenant-aware and legacy data access methods.
 * For new code, use the *ForTenant() functions which require a tenant ID.
 * Legacy functions are provided for backward compatibility.
 */

// Export all tenant-aware functions
export {
  loadAllForTenant,
  reloadAllForTenant,
  saveGoogleForTenant,
  saveAdminForTenant,
  saveModifiedForTenant,
  saveLinksForTenant,
  saveRequestsForTenant,
  saveSettingsForTenant,
  getGoogleForTenant,
  getAdminForTenant,
  getDisplayForTenant,
  getModifiedShiftsForTenant,
  getGoogleLinksForTenant,
  getScheduleRequestsForTenant,
  getSettingsForTenant,
  setGoogleForTenant,
  setAdminForTenant,
  setModifiedShiftsForTenant,
  setGoogleLinksForTenant,
  setScheduleRequestsForTenant,
  setSettingsForTenant,
  getPendingRequestsForTenant,
  getAllRequestsSortedForTenant,
  addScheduleChangeRequestForTenant,
  addSwapRequestForTenant,
  updateRequestStatusForTenant,
  addGoogleLinkForTenant,
  deleteGoogleLinkForTenant,
  resetAdminToGoogleForTenant,
  setAutoSyncEnabledForTenant,
  getAutoSyncEnabledForTenant,
  trackModifiedShiftForTenant,
  mergeDisplayForTenant,
  getShiftDefinitionsForTenant,
  setShiftDefinitionsForTenant,
  updateShiftDefinitionForTenant,
  deleteShiftDefinitionForTenant,
  deleteEmployeeCredential,
  reactivateEmployeeCredential,
  deactivateEmployee,
  employeeIdExists
} from './dataStore.tenant';

// Export legacy functions for backward compatibility
export {
  loadAll,
  reloadAll,
  saveGoogle,
  saveAdmin,
  saveModified,
  saveLinks,
  saveRequests,
  saveSettings,
  getGoogle,
  getAdmin,
  getDisplay,
  getModifiedShifts,
  getGoogleLinks,
  getScheduleRequests,
  getSettings,
  setGoogle,
  setAdmin,
  updateAdminTeamStructure,
  mergeDisplay,
  trackModifiedShift,
  setGoogleLinks,
  addGoogleLink,
  deleteGoogleLink,
  resetAdminToGoogle,
  addScheduleChangeRequest,
  addSwapRequest,
  updateRequestStatus,
  getPendingRequests,
  getAllRequestsSorted,
  findEmployeeInAdmin,
  findEmployeeInGoogle,
  setAutoSyncEnabled,
  getAutoSyncEnabled
} from './dataStore.legacy';
