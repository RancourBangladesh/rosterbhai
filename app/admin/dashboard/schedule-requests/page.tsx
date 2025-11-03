import AdminPageWrapper from '@/components/AdminPageWrapper';
import ScheduleRequestsTab from '@/components/AdminTabs/ScheduleRequestsTab';
import { getSessionUser, getSessionUserData, getSessionTenantId } from '@/lib/auth';
import { loadAllForTenant } from '@/lib/dataStore';
import { redirect } from 'next/navigation';

export default function ScheduleRequestsPage() {
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
      <ScheduleRequestsTab id="schedule-requests" />
    </AdminPageWrapper>
  );
}
