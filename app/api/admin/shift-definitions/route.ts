import { NextRequest, NextResponse } from 'next/server';
import { getSessionTenantId } from '@/lib/auth';
import {
  loadAllForTenant,
  getShiftDefinitionsForTenant,
  setShiftDefinitionsForTenant,
  updateShiftDefinitionForTenant,
  deleteShiftDefinitionForTenant
} from '@/lib/dataStore';

// GET - Fetch shift definitions for tenant
export async function GET(req: NextRequest) {
  const tenantId = getSessionTenantId();
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'No tenant' }, { status: 400 });
  }

  await loadAllForTenant(tenantId);
  const shiftDefinitions = getShiftDefinitionsForTenant(tenantId);

  return NextResponse.json({ success: true, shiftDefinitions });
}

// POST - Update or create shift definition
export async function POST(req: NextRequest) {
  const tenantId = getSessionTenantId();
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'No tenant' }, { status: 400 });
  }

  const { code, description } = await req.json();
  
  if (!code || typeof code !== 'string' || code.trim() === '') {
    return NextResponse.json({ success: false, error: 'Invalid shift code' }, { status: 400 });
  }

  if (!description || typeof description !== 'string' || description.trim() === '') {
    return NextResponse.json({ success: false, error: 'Invalid shift description' }, { status: 400 });
  }

  await loadAllForTenant(tenantId);
  updateShiftDefinitionForTenant(tenantId, code.trim().toUpperCase(), description.trim());

  return NextResponse.json({ success: true });
}

// DELETE - Remove shift definition
export async function DELETE(req: NextRequest) {
  const tenantId = getSessionTenantId();
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'No tenant' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ success: false, error: 'Missing shift code' }, { status: 400 });
  }

  await loadAllForTenant(tenantId);
  deleteShiftDefinitionForTenant(tenantId, code);

  return NextResponse.json({ success: true });
}

// PUT - Replace all shift definitions (bulk update)
export async function PUT(req: NextRequest) {
  const tenantId = getSessionTenantId();
  if (!tenantId) {
    return NextResponse.json({ success: false, error: 'No tenant' }, { status: 400 });
  }

  const { shiftDefinitions } = await req.json();

  if (!shiftDefinitions || typeof shiftDefinitions !== 'object') {
    return NextResponse.json({ success: false, error: 'Invalid shift definitions' }, { status: 400 });
  }

  await loadAllForTenant(tenantId);
  setShiftDefinitionsForTenant(tenantId, shiftDefinitions);

  return NextResponse.json({ success: true });
}
