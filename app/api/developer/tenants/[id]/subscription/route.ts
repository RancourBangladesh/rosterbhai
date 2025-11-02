import { NextRequest, NextResponse } from 'next/server';
import { requireDeveloper } from '@/lib/auth';
import { updateTenant, getTenantById } from '@/lib/tenants';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    requireDeveloper();
    const { plan } = await req.json();
    if (plan !== 'monthly' && plan !== 'yearly') {
      return NextResponse.json({ success: false, error: 'Invalid plan' }, { status: 400 });
    }

    const tenant = getTenantById(params.id);
    if (!tenant) {
      return NextResponse.json({ success: false, error: 'Tenant not found' }, { status: 404 });
    }

    const updated = updateTenant(params.id, {
      subscription: {
        plan,
        status: tenant.is_active ? 'active' : 'pending'
      }
    });

    return NextResponse.json({ success: true, tenant: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to set subscription' }, { status: 500 });
  }
}
