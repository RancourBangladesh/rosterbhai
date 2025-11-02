import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { 
  setGoogleForTenant, 
  setAdminForTenant, 
  loadAllForTenant,
  saveGoogleForTenant,
  saveAdminForTenant
} from '@/lib/dataStore';

export async function POST(req: NextRequest) {
  if (!getSessionUser()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const tenantId = getSessionTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant context' }, { status: 400 });
  }

  try {
    const { templateName, templateData, startDate, endDate } = await req.json();

    if (!templateName || !templateData || !startDate || !endDate) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }

    // Validate template data structure
    if (!templateData.teams || !templateData.headers || !Array.isArray(templateData.allEmployees)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid template data structure' 
      });
    }

    // Load current tenant data
    loadAllForTenant(tenantId);

    // Set both Google (base) and Admin data with the template
    setGoogleForTenant(tenantId, templateData);
    setAdminForTenant(tenantId, templateData);

    // Save to disk
    saveGoogleForTenant(tenantId);
    saveAdminForTenant(tenantId);

    console.log(`[create-roster-template] Created template "${templateName}" for tenant ${tenantId}`);
    console.log(`  - Teams: ${Object.keys(templateData.teams).length}`);
    console.log(`  - Employees: ${templateData.allEmployees.length}`);
    console.log(`  - Date range: ${startDate} to ${endDate}`);
    console.log(`  - Days: ${templateData.headers.length}`);

    return NextResponse.json({
      success: true,
      message: `Template "${templateName}" created successfully with ${templateData.allEmployees.length} employees and ${templateData.headers.length} days`
    });

  } catch (error: any) {
    console.error('[create-roster-template] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to create template'
    });
  }
}
