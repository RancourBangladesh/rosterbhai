import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { getGoogle, setGoogle, getGoogleForTenant, setGoogleForTenant } from '@/lib/dataStore';
import { parseCsv, deepCopy } from '@/lib/utils';
import { mergeCsvIntoGoogle } from '@/lib/rosterMerge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  // Use raw body (Expect client to send plain text or use FormData with file)
  const formData = await req.formData();
  const file = formData.get('csv_file') as File | null;
  if (!file) return NextResponse.json({success:false,error:'No file uploaded'});
  const text = await file.text();
  const rows = parseCsv(text);
  
  const tenantId = getSessionTenantId();
  try {
    if (tenantId) {
      const google = getGoogleForTenant(tenantId);
      const {detectedMonth} = mergeCsvIntoGoogle(google, rows);
      setGoogleForTenant(tenantId, google);
      return NextResponse.json({success:true, message:`CSV imported successfully for ${detectedMonth || 'Month'}!`});
    } else {
      const google = getGoogle();
      const {detectedMonth} = mergeCsvIntoGoogle(google, rows);
      setGoogle(google);
      return NextResponse.json({success:true, message:`CSV imported successfully for ${detectedMonth || 'Month'}!`});
    }
  } catch (e:any) {
    return NextResponse.json({success:false, error:e.message});
  }
}