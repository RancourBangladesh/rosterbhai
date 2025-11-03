import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function AdminDashboardPage() {
  const user = getSessionUser();
  if (!user) redirect('/admin/login');
  
  // Redirect to the overview page (default landing)
  redirect('/admin/dashboard/overview');
}