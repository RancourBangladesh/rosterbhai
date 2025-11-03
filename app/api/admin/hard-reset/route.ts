import { NextResponse, NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { deleteFile } from '@/lib/utils';
import { getTenantDataDir, getTenantGoogleDataFile, getTenantAdminDataFile, getTenantModifiedShiftsFile, getTenantScheduleRequestsFile, getTenantGoogleLinksFile, getTenantSettingsFile, getTenantEmployeeCredentialsFile } from '@/lib/constants';
import { reloadAllForTenant } from '@/lib/dataStore.tenant';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = getSessionUser();
  if (!session) return NextResponse.json({error:'Unauthorized'},{status:401});
  
  const tenantId = session.tenantId;
  if (!tenantId) {
    return NextResponse.json({error:'No tenant ID in session'},{status:400});
  }
  
  try {
    // Delete all tenant-specific data files
    deleteFile(getTenantGoogleDataFile(tenantId));
    deleteFile(getTenantAdminDataFile(tenantId));
    deleteFile(getTenantModifiedShiftsFile(tenantId));
    deleteFile(getTenantScheduleRequestsFile(tenantId));
    deleteFile(getTenantGoogleLinksFile(tenantId));
    deleteFile(getTenantSettingsFile(tenantId));
    deleteFile(getTenantEmployeeCredentialsFile(tenantId));
    
    // Delete roster templates directory if it exists
    const templatesDir = `${getTenantDataDir(tenantId)}/roster_templates`;
    try {
      if (fs.existsSync(templatesDir)) {
        fs.rmSync(templatesDir, { recursive: true, force: true });
      }
    } catch (e) {
      console.error('Failed to delete templates directory:', e);
    }
    
    // Reload all data from disk to refresh in-memory cache for this tenant
    reloadAllForTenant(tenantId);
    
    return NextResponse.json({
      success: true,
      message: 'All roster data for this tenant has been reset. Deleted: employees, schedules, shift modifications, and schedule requests.'
    });
  } catch (e: any) {
    console.error('Hard reset error:', e);
    return NextResponse.json({
      success: false,
      error: e.message || 'Failed to reset data'
    }, {status: 500});
  }
}
