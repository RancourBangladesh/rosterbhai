import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { getSessionUser, getSessionTenantId } from '@/lib/auth';
import { getAllRequestsSorted, getAllRequestsSortedForTenant } from '@/lib/dataStore';

export async function GET() {
  if (!getSessionUser()) return NextResponse.json({error:'Unauthorized'},{status:401});
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    // Merge tenant and legacy requests during migration to ensure visibility
    const tenantReq = getAllRequestsSortedForTenant(tenantId);
    const legacyReq = getAllRequestsSorted();
    const merged = [...tenantReq, ...legacyReq];
    const getTime = (r:any) => r?.created_at || r?.approved_at || '';
    const pending = merged.filter((r:any)=> r.status === 'pending')
      .sort((a:any,b:any)=> getTime(b).localeCompare(getTime(a)));
    const completed = merged.filter((r:any)=> r.status !== 'pending')
      .sort((a:any,b:any)=> getTime(b).localeCompare(getTime(a)));
    return NextResponse.json({success:true, all_requests:[...pending, ...completed]});
  }
  
  // Legacy fallback
  return NextResponse.json({success:true, all_requests:getAllRequestsSorted()});
}