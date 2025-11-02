import { NextRequest, NextResponse } from 'next/server';
import { createTenantPublic } from '@/lib/tenants';

export async function POST(req: NextRequest) {
  try {
    const { name, slug, plan, contact_email, contact_phone } = await req.json();

    if (!name || !slug || !plan || !['monthly','yearly'].includes(plan)) {
      return NextResponse.json({ success:false, error:'name, slug and plan (monthly|yearly) are required' }, { status: 400 });
    }

    const tenant = createTenantPublic({ name, slug: String(slug).toLowerCase().replace(/[^a-z0-9-]/g,''), plan, contact_email, contact_phone });

    return NextResponse.json({ success:true, tenant });
  } catch (err: any) {
    return NextResponse.json({ success:false, error: err.message || 'Failed to signup' }, { status: 500 });
  }
}
