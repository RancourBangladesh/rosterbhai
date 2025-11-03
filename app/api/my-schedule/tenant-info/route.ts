import { NextRequest, NextResponse } from 'next/server';
import { findEmployeeTenant } from '@/lib/employeeAuth';
import { getTenantById } from '@/lib/tenants';
import { getSubdomainFromHostname, getTenantFromRequest } from '@/lib/subdomain';
import { getTenantBySlug } from '@/lib/tenants';

export async function GET(req: NextRequest) {
  try {
    // Get hostname from request headers (more reliable than URL)
    const hostname = req.headers.get('host') || '';
    const subdomain = getSubdomainFromHostname(hostname);
    
    if (!subdomain) {
      return NextResponse.json({ 
        success: false,
        tenant: null,
        error: 'No subdomain detected'
      });
    }
    
    // Get tenant by slug
    const tenant = getTenantBySlug(subdomain);
    
    if (!tenant) {
      return NextResponse.json({ 
        success: false,
        tenant: null,
        error: 'No tenant found for this subdomain'
      });
    }

    return NextResponse.json({ 
      success: true,
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
        is_active: tenant.is_active,
        organization_name: tenant.settings?.organization_name || tenant.name,
        logo_url: tenant.settings?.logo_url
      }
    });
  } catch (err) {
    console.error('[TENANT-INFO] Error:', err);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch tenant info'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { employeeId } = await req.json();
    
    if (!employeeId) {
      return NextResponse.json({ 
        success: false,
        error: 'Employee ID required'
      }, { status: 400 });
    }

    // Find which tenant this employee belongs to
    const tenantId = findEmployeeTenant(employeeId);
    
    if (!tenantId) {
      return NextResponse.json({ 
        success: false,
        tenant: null
      });
    }

    const tenant = getTenantById(tenantId);
    
    if (!tenant) {
      return NextResponse.json({ 
        success: false,
        tenant: null
      });
    }

    return NextResponse.json({ 
      success: true,
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
        organization_name: tenant.settings?.organization_name || tenant.name,
        logo_url: tenant.settings?.logo_url
      }
    });
  } catch (err) {
    console.error('[TENANT-INFO] Error:', err);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch tenant info'
    }, { status: 500 });
  }
}
