import AdminPageWrapper from '@/components/AdminPageWrapper';
import CsvImportTab from '@/components/AdminTabs/CsvImportTab';
import { getSessionUser, getSessionUserData, getSessionTenantId } from '@/lib/auth';
import { loadAllForTenant } from '@/lib/dataStore';
import { redirect } from 'next/navigation';

export default function CsvImportPage() {
  const user = getSessionUser();
  if (!user) redirect('/admin/login');
  
  const userData = getSessionUserData();
  const userRole = userData?.role || 'admin';
  
  const tenantId = getSessionTenantId();
  if (tenantId) {
    loadAllForTenant(tenantId);
  }

  return (
    <AdminPageWrapper adminUser={user} userRole={userRole}>
      <CsvImportTab id="csv-import" />
    </AdminPageWrapper>
  );
}
