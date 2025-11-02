import AdminPageWrapper from '@/components/AdminPageWrapper';
import TeamManagementTab from '@/components/AdminTabs/TeamManagementTab';
import { getSessionUser, getSessionUserData, getSessionTenantId } from '@/lib/auth';
import { loadAllForTenant } from '@/lib/dataStore';
import { redirect } from 'next/navigation';

export default function TeamManagementPage() {
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
      <TeamManagementTab id="team-management" />
    </AdminPageWrapper>
  );
}
