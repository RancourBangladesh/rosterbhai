"use client";
import AdminLayoutShellNew from './AdminLayoutShellNew';

interface Props {
  adminUser: string;
  userRole: string;
  children: React.ReactNode;
}

export default function AdminPageWrapper({ adminUser, userRole, children }: Props) {
  return (
    <AdminLayoutShellNew adminUser={adminUser} userRole={userRole}>
      {children}
    </AdminLayoutShellNew>
  );
}
