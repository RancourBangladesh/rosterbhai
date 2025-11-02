import { NextRequest, NextResponse } from 'next/server';
import { validateAdminLogin, createSession } from '@/lib/auth';
import { getTenantFromRequest } from '@/lib/subdomain';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  
  // Get tenant from subdomain
  const tenant = getTenantFromRequest(request);
  
  if (!tenant) {
    return NextResponse.json({ error: 'Invalid tenant subdomain' }, { status: 400 });
  }
  
  if (!tenant.is_active) {
    return NextResponse.json({ error: 'Tenant is not active' }, { status: 403 });
  }
  
  // Validate credentials with tenant context
  if (validateAdminLogin(username, password, tenant.id)) {
    // Create session with tenant context
    createSession(username, tenant.id);
    return NextResponse.json({ success: true, tenantId: tenant.id, tenantName: tenant.name });
  }
  
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}