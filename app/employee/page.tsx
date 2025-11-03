"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClientAuthGate from '@/components/ClientAuthGate';
import ClientDashboard from '@/components/ClientDashboard';

export default function EmployeePortalPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [validatingTenant, setValidatingTenant] = useState(true);
  const [tenantValid, setTenantValid] = useState(false);

  useEffect(() => {
    // Validate that the tenant exists by checking the tenant-info API
    fetch('/api/my-schedule/tenant-info')
      .then(res => res.json())
      .then(data => {
        if (data.tenant && data.tenant.is_active) {
          setTenantValid(true);
        } else {
          // Tenant doesn't exist or is inactive, redirect to main domain
          const protocol = window.location.protocol;
          const hostname = window.location.hostname;
          const port = window.location.port;
          
          // Build main domain URL
          const mainHostname = hostname.includes('localhost') 
            ? `localhost${port ? ':' + port : ''}` 
            : 'rosterbhai.me';
          
          window.location.href = `${protocol}//${mainHostname}/`;
        }
        setValidatingTenant(false);
      })
      .catch(() => {
        // Error checking tenant, redirect to main domain
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        const mainHostname = hostname.includes('localhost') 
          ? `localhost${port ? ':' + port : ''}` 
          : 'rosterbhai.me';
        
        window.location.href = `${protocol}//${mainHostname}/`;
      });
  }, []);

  if (validatingTenant) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Validating tenant...
      </div>
    );
  }

  if (!tenantValid) {
    return null; // Will redirect
  }

  return (
    <div>
      {!authed && (
        <ClientAuthGate
          onSuccess={(name, id) => {
            setFullName(name);
            setEmployeeId(id);
            setAuthed(true);
          }}
        />
      )}
      {authed && (
        <ClientDashboard
          employeeId={employeeId}
          fullName={fullName}
          onLogout={() => {
            setAuthed(false);
            setEmployeeId('');
            localStorage.removeItem('rosterViewerUser');
            localStorage.removeItem('rosterViewerAuth');
          }}
        />
      )}
    </div>
  );
}
