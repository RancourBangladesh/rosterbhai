import { NextRequest, NextResponse } from 'next/server';
import { validateAdminLogin, createSession } from '@/lib/auth';
import { findAdminTenant } from '@/lib/adminLookup';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  
  // First, find which tenant this admin belongs to
  const tenantId = findAdminTenant(username);
  
  // Validate credentials with tenant context
  if (validateAdminLogin(username, password, tenantId || undefined)) {
    // Create session with tenant context
    createSession(username, tenantId || undefined);
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}