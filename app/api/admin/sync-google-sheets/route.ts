import { NextResponse, NextRequest } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { syncGoogleSheetsForTenant } from '@/lib/googleSync';

export async function POST(req: NextRequest) {
  const session = getSessionUser();
  if (!session) return NextResponse.json({error:'Unauthorized'},{status:401});
  
  const tenantId = session.tenantId;
  if (!tenantId) {
    return NextResponse.json({error:'No tenant ID in session'},{status:400});
  }
  
  try {
    const res = await syncGoogleSheetsForTenant(tenantId);
    return NextResponse.json({success:true, message:`Google Sheets synced: ${res.employees} employees from ${res.sheets} sheet(s).`});
  } catch (e:any) {
    return NextResponse.json({success:false, error:e.message});
  }
}