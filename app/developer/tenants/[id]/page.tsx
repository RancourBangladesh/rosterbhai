"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Users, 
  UserCog, 
  Calendar,
  Settings,
  Database,
  FileText,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Upload,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

function calcDaysLeft(expires_at?: string) {
  if (!expires_at) return null;
  const now = new Date();
  const until = new Date(expires_at);
  return Math.ceil((until.getTime() - now.getTime()) / (1000*60*60*24));
}

function daysBadgeColor(days: number|null) {
  if (days === null) return { bg:'#e5e7eb', color:'#374151', label:'pending' };
  if (days <= 2) return { bg:'#fee2e2', color:'#991b1b', label:`${days}d` };
  if (days <= 5) return { bg:'#fee2e2', color:'#b91c1c', label:`${days}d` };
  if (days <= 15) return { bg:'#fef3c7', color:'#b45309', label:`${days}d` };
  return { bg:'#dcfce7', color:'#15803d', label:`${days}d` };
}

function DaysLeftBadge({ expires_at, status }: { expires_at?: string; status: 'pending'|'active' }) {
  const d = calcDaysLeft(expires_at);
  const colors = daysBadgeColor(d);
  return (
    <span style={{padding:'0.25rem 0.5rem',borderRadius:8,fontSize:12,fontWeight:700, background: colors.bg, color: colors.color}}>
      {status === 'pending' && d === null ? 'awaiting activation' : colors.label}
    </span>
  );
}

interface TenantDetail {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  is_active: boolean;
  settings: {
    max_users?: number;
    max_employees?: number;
    organization_name?: string;
    logo_url?: string;
  };
  subscription?: {
    plan: 'monthly'|'yearly';
    status: 'pending'|'active';
    created_at: string;
    started_at?: string;
    expires_at?: string;
  };
  contact_email?: string;
  contact_phone?: string;
}

interface AdminUser {
  username: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface Employee {
  id: string;
  name: string;
  team: string;
  is_active: boolean;
}

export default function TenantManagementPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = params.id as string;

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'employees' | 'data' | 'settings'>('overview');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [editedTenant, setEditedTenant] = useState<Partial<TenantDetail>>({});
  
  // New user modal
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'admin' });
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUser, setEditUser] = useState<{ username: string; full_name: string; role: string; password?: string } | null>(null);
  
  // Employee modals
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ id: '', name: '', team: '' });
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState<{ id: string; name: string; team: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log('[TenantManagement useEffect] Component mounted, tenantId:', tenantId);
    loadTenantData();
  }, [tenantId]);

  async function loadTenantData() {
    setLoading(true);
    try {
      console.log('[TenantManagement] Loading data for tenant:', tenantId);
      const res = await fetch(`/api/developer/tenants/${tenantId}`);
      const data = await res.json();
      console.log('[TenantManagement] Received data:', data);
      if (data.success) {
        console.log('[TenantManagement] Setting state:', {
          tenant: data.tenant,
          adminUsers: data.adminUsers?.length || 0,
          employees: data.employees?.length || 0
        });
        setTenant(data.tenant);
        setEditedTenant(data.tenant);
        setAdminUsers(data.adminUsers || []);
        setEmployees(data.employees || []);
      } else {
        console.error('[TenantManagement] Error:', data.error);
        setError(data.error || 'Failed to load tenant');
      }
    } catch (e) {
      console.error('[TenantManagement] Exception:', e);
      setError('Failed to load tenant data');
    } finally {
      setLoading(false);
    }
  }

  async function saveTenantChanges() {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/developer/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedTenant)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Tenant updated successfully');
        setEditMode(false);
        loadTenantData();
      } else {
        setError(data.error || 'Failed to update tenant');
      }
    } catch (e) {
      setError('Failed to update tenant');
    }
  }

  // Subscription helpers
  function daysLeft(expires_at?: string) {
    if (!expires_at) return null;
    const now = new Date();
    const until = new Date(expires_at);
    return Math.ceil((until.getTime() - now.getTime()) / (1000*60*60*24));
  }
  function badgeStyle(days: number|null) {
    if (days === null) return { bg:'#e5e7eb', color:'#374151', label:'pending' };
    if (days <= 2) return { bg:'#fee2e2', color:'#991b1b', label:`${days}d` };
    if (days <= 5) return { bg:'#fee2e2', color:'#b91c1c', label:`${days}d` };
    if (days <= 15) return { bg:'#fef3c7', color:'#b45309', label:`${days}d` };
    return { bg:'#dcfce7', color:'#15803d', label:`${days}d` };
  }

  async function setSubscription(plan: 'monthly'|'yearly') {
    setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/developer/tenants/${tenantId}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Subscription set to ${plan}`);
        setTenant(data.tenant);
        setEditedTenant(data.tenant);
      } else {
        setError(data.error || 'Failed to set subscription');
      }
    } catch (e) {
      setError('Failed to set subscription');
    }
  }

  async function activateTenant() {
    setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/developer/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: true })
      });
      const data = await res.json();
      if (data.success) {
        setTenant(data.tenant);
        setEditedTenant(data.tenant);
        setSuccess('Tenant activated');
      } else {
        setError(data.error || 'Failed to activate');
      }
    } catch (e) {
      setError('Failed to activate');
    }
  }

  async function createAdminUser() {
    setError('');
    setSuccess('');
    
    if (!newUser.username || !newUser.password || !newUser.full_name) {
      setError('All fields are required');
      return;
    }

    try {
      const res = await fetch(`/api/developer/tenants/${tenantId}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Admin user created successfully');
        setShowNewUserModal(false);
        setNewUser({ username: '', password: '', full_name: '', role: 'admin' });
        loadTenantData();
      } else {
        setError(data.error || 'Failed to create user');
      }
    } catch (e) {
      setError('Failed to create user');
    }
  }

  async function deleteAdminUser(username: string) {
    if (!confirm(`Delete user ${username}?`)) return;
    
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`/api/developer/tenants/${tenantId}/users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('User deleted successfully');
        loadTenantData();
      } else {
        setError(data.error || 'Failed to delete user');
      }
    } catch (e) {
      setError('Failed to delete user');
    }
  }

  async function updateAdminUser() {
    if (!editUser) return;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/developer/tenants/${tenantId}/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editUser.username,
          full_name: editUser.full_name,
          role: editUser.role,
          password: editUser.password
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Admin user updated');
        setShowEditUserModal(false);
        setEditUser(null);
        loadTenantData();
      } else {
        setError(data.error || 'Failed to update user');
      }
    } catch (e) {
      setError('Failed to update user');
    }
  }

  async function createEmployee() {
    if (!newEmployee.id || !newEmployee.name || !newEmployee.team) {
      setError('Employee id, name and team are required');
      return;
    }
    setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/developer/tenants/${tenantId}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Employee created');
        setShowNewEmployeeModal(false);
        setNewEmployee({ id: '', name: '', team: '' });
        loadTenantData();
      } else {
        setError(data.error || 'Failed to create employee');
      }
    } catch (e) {
      setError('Failed to create employee');
    }
  }

  async function updateEmployee() {
    if (!editEmployee) return;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/developer/tenants/${tenantId}/employees`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: editEmployee.id, name: editEmployee.name, team: editEmployee.team })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Employee updated');
        setShowEditEmployeeModal(false);
        setEditEmployee(null);
        loadTenantData();
      } else {
        setError(data.error || 'Failed to update employee');
      }
    } catch (e) {
      setError('Failed to update employee');
    }
  }

  async function deleteEmployee(employeeId: string) {
    if (!confirm('Delete this employee?')) return;
    setError(''); setSuccess('');
    try {
      const res = await fetch(`/api/developer/tenants/${tenantId}/employees`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Employee deleted');
        loadTenantData();
      } else {
        setError(data.error || 'Failed to delete employee');
      }
    } catch (e) {
      setError('Failed to delete employee');
    }
  }

  async function resetTenantData() {
    if (!confirm('⚠️ WARNING: This will reset ALL tenant data including employees, schedules, and requests. This action cannot be undone. Are you sure?')) {
      return;
    }
    
    const confirmText = prompt('Type "RESET" to confirm:');
    if (confirmText !== 'RESET') {
      alert('Reset cancelled');
      return;
    }
    
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`/api/developer/tenants/${tenantId}/reset`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Tenant data reset successfully');
        loadTenantData();
      } else {
        setError(data.error || 'Failed to reset tenant data');
      }
    } catch (e) {
      setError('Failed to reset tenant data');
    }
  }

  async function exportTenantData() {
    try {
      const res = await fetch(`/api/developer/tenants/${tenantId}/export`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tenant-${tenant?.slug}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Tenant data exported successfully');
    } catch (e) {
      setError('Failed to export tenant data');
    }
  }

  console.log('[TenantManagement RENDER] loading:', loading, 'tenant:', tenant ? 'exists' : 'null', 'adminUsers:', adminUsers.length, 'employees:', employees.length);

  if (loading) {
    return (
      <div className="dev-portal" style={{ minHeight: '100vh', background: '#f5f7fa' }}>
        <div style={{ padding: '2rem', textAlign: 'center', background: 'white', margin: '2rem', borderRadius: '12px' }}>
          <p>Loading tenant data...</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tenant ID: {tenantId}</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="dev-portal">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: '#ef4444' }} />
          <h2>Tenant Not Found</h2>
          <button onClick={() => router.push('/developer/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dev-portal tenant-management">
      {/* Header */}
      <header className="tenant-header">
        <button onClick={() => router.push('/developer/dashboard')} className="btn-back">
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <div className="tenant-title-section">
          <h1>{tenant.settings?.organization_name || tenant.name}</h1>
          <p className="tenant-slug">@{tenant.slug} • ID: {tenant.id}</p>
          {tenant.subscription && (
            <div style={{marginTop:'0.5rem', display:'flex', gap:'0.5rem', alignItems:'center'}}>
              <span style={{padding:'0.25rem 0.5rem',borderRadius:8, fontSize:12, fontWeight:700, background: tenant.subscription.plan==='yearly' ? '#ede9fe' : '#fee2e2', color: tenant.subscription.plan==='yearly' ? '#6d28d9' : '#b91c1c'}}>
                {tenant.subscription.plan === 'yearly' ? 'Yearly' : 'Monthly'}
              </span>
              <DaysLeftBadge expires_at={tenant.subscription.expires_at} status={tenant.subscription.status} />
            </div>
          )}
        </div>
        <div className="tenant-header-actions">
          {editMode ? (
            <>
              <button onClick={saveTenantChanges} className="btn-save">
                <Save size={18} />
                Save Changes
              </button>
              <button onClick={() => { setEditMode(false); setEditedTenant(tenant); }} className="btn-cancel">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="btn-edit">
              <Settings size={18} />
              Edit Tenant
            </button>
          )}
        </div>
      </header>

      {/* Alerts */}
      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          {success}
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          <Database size={18} />
          Overview
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          <UserCog size={18} />
          Admin Users ({adminUsers.length})
        </button>
        <button 
          className={activeTab === 'employees' ? 'active' : ''}
          onClick={() => setActiveTab('employees')}
        >
          <Users size={18} />
          Employees ({employees.length})
        </button>
        <button 
          className={activeTab === 'data' ? 'active' : ''}
          onClick={() => setActiveTab('data')}
        >
          <FileText size={18} />
          Data Management
        </button>
        <button 
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => { setActiveTab('settings'); setEditMode(true); }}
        >
          <Settings size={18} />
          Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="dev-tab-content" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', background: '#f5f7fa' }}>
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="stat-box" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e2e8f0', textAlign: 'center' }}>
                <UserCog size={32} style={{ color: '#3b82f6' }} />
                <h3 style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '2rem', color: '#1f2937' }}>{adminUsers.length}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Admin Users</p>
                {tenant.settings?.max_users && (
                  <span className="limit" style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>Limit: {tenant.settings?.max_users}</span>
                )}
              </div>
              <div className="stat-box" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e2e8f0', textAlign: 'center' }}>
                <Users size={32} style={{ color: '#10b981' }} />
                <h3 style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '2rem', color: '#1f2937' }}>{employees.length}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Total Employees</p>
                {tenant.settings?.max_employees && (
                  <span className="limit" style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>Limit: {tenant.settings?.max_employees}</span>
                )}
              </div>
              <div className="stat-box" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e2e8f0', textAlign: 'center' }}>
                <Users size={32} style={{ color: '#8b5cf6' }} />
                <h3 style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '2rem', color: '#1f2937' }}>{employees.filter(e => e.is_active).length}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Active Employees</p>
              </div>
              <div className="stat-box" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '2px solid #e2e8f0', textAlign: 'center' }}>
                <Calendar size={32} style={{ color: '#f59e0b' }} />
                <h3 style={{ margin: '0.75rem 0 0.25rem 0', fontSize: '2rem', color: '#1f2937' }}>{new Date(tenant.created_at).toLocaleDateString()}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>Created Date</p>
              </div>
            </div>

            {/* Subscription Section */}
            <div className="info-section" style={{ marginTop: '2rem' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#1f2937' }}>Subscription</h2>
              <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="info-item">
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Current Plan</label>
                  <p style={{ margin: 0 }}>
                    <span style={{
                      display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700,
                      background: tenant.subscription?.plan === 'yearly' ? '#ede9fe' : '#fee2e2',
                      color: tenant.subscription?.plan === 'yearly' ? '#6d28d9' : '#b91c1c'
                    }}>
                      {tenant.subscription?.plan ? tenant.subscription.plan.toUpperCase() : 'N/A'}
                    </span>
                  </p>
                </div>
                <div className="info-item">
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Status</label>
                  <p style={{ margin: 0 }}>{tenant.subscription?.status || (tenant.is_active ? 'active' : 'pending')}</p>
                </div>
                <div className="info-item">
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Dates</label>
                  <p style={{ margin: 0 }}>
                    {tenant.subscription?.started_at ? `Start: ${new Date(tenant.subscription.started_at).toLocaleDateString()}` : 'Start: —'}<br/>
                    {tenant.subscription?.expires_at ? `Expires: ${new Date(tenant.subscription.expires_at).toLocaleDateString()}` : 'Expires: —'}
                  </p>
                </div>
                <div className="info-item">
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Days Remaining</label>
                  <p style={{ margin: 0 }}>
                    <DaysLeftBadge 
                      expires_at={tenant.subscription?.expires_at}
                      status={(tenant.subscription?.status as any) || (tenant.is_active ? 'active' : 'pending')}
                    />
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={() => setSubscription('monthly')} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Set Monthly (৳3,000/mo)
                </button>
                <button onClick={() => setSubscription('yearly')} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  Set Yearly (৳30,000/yr) — Save 2 months
                </button>
                {!tenant.is_active && (
                  <button onClick={activateTenant} className="btn-save" style={{ padding: '0.5rem 1rem' }}>
                    Activate Tenant
                  </button>
                )}
              </div>
            </div>

            <div className="info-section" style={{ marginTop: '2rem' }}>
              <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: '#1f2937' }}>Tenant Information</h2>
              <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                <div className="info-item">
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Tenant Name</label>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#1f2937', fontWeight: 500 }}>{tenant.name}</p>
                </div>
                <div className="info-item">
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Slug</label>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#1f2937', fontWeight: 500 }}>@{tenant.slug}</p>
                </div>
                <div className="info-item">
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Organization Name</label>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#1f2937', fontWeight: 500 }}>{tenant.settings?.organization_name || 'Not set'}</p>
                </div>
                <div className="info-item">
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Status</label>
                  <p style={{ margin: 0, fontSize: '1rem', color: '#1f2937', fontWeight: 500 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: tenant.is_active ? '#dcfce7' : '#fee2e2',
                      color: tenant.is_active ? '#15803d' : '#991b1b'
                    }}>
                      {tenant.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-tab" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>Admin Users</h2>
              <button onClick={() => setShowNewUserModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                <UserCog size={18} />
                Add Admin User
              </button>
            </div>

            {adminUsers.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                <UserCog size={48} style={{ color: '#cbd5e1' }} />
                <h3 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1.25rem', color: '#64748b' }}>No Admin Users</h3>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>Create the first admin user for this tenant</p>
              </div>
            ) : (
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Full Name</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map(user => (
                      <tr key={user.username}>
                        <td><strong>{user.username}</strong></td>
                        <td>{user.full_name}</td>
                        <td>
                          <span className="role-badge">{user.role}</span>
                        </td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <button 
                            onClick={() => { setEditUser({ username: user.username, full_name: user.full_name, role: user.role }); setShowEditUserModal(true); }}
                            className="btn-secondary"
                            style={{ marginRight: '0.5rem' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteAdminUser(user.username)}
                            className="btn-danger-small"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="employees-tab" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid #e5e7eb' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>Employees</h2>
              <button onClick={() => setShowNewEmployeeModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                Add Employee
              </button>
            </div>

            {employees.length === 0 ? (
              <div className="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                <Users size={48} style={{ color: '#cbd5e1' }} />
                <h3 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1.25rem', color: '#64748b' }}>No Employees</h3>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>Tenant hasn&apos;t added any employees yet</p>
              </div>
            ) : (
              <div className="table-container" style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Team</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id}>
                        <td><strong>{emp.id}</strong></td>
                        <td>{emp.name}</td>
                        <td>{emp.team}</td>
                        <td>
                          <button onClick={() => { setEditEmployee({ id: emp.id, name: emp.name, team: emp.team }); setShowEditEmployeeModal(true); }} className="btn-secondary" style={{ marginRight: '0.5rem' }}>Edit</button>
                          <button onClick={() => deleteEmployee(emp.id)} className="btn-danger-small"><Trash2 size={14}/> Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <div className="data-tab" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#1f2937' }}>Data Management</h2>
            <p style={{ margin: '0 0 2rem 0', color: '#6b7280' }}>Manage tenant data, exports, and perform maintenance operations</p>

            <div className="action-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div className="action-card" style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '2px solid #e2e8f0', textAlign: 'center' }}>
                <Download size={32} style={{ color: '#3b82f6', margin: '0 auto 1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#1f2937' }}>Export Data</h3>
                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>Download complete tenant data backup in JSON format</p>
                <button onClick={exportTenantData} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  <Download size={16} />
                  Export All Data
                </button>
              </div>

              <div className="action-card" style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '2px solid #e2e8f0', textAlign: 'center' }}>
                <RefreshCw size={32} style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#1f2937' }}>Refresh Cache</h3>
                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#6b7280' }}>Clear and reload tenant data from storage</p>
                <button onClick={loadTenantData} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  <RefreshCw size={16} />
                  Refresh Data
                </button>
              </div>

              <div className="action-card danger" style={{ background: '#fef2f2', padding: '2rem', borderRadius: '12px', border: '2px solid #fecaca', textAlign: 'center' }}>
                <Trash2 size={32} style={{ color: '#ef4444', margin: '0 auto 1rem' }} />
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#1f2937' }}>Reset Tenant Data</h3>
                <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#991b1b' }}>⚠️ Permanently delete all tenant data. This cannot be undone!</p>
                <button onClick={resetTenantData} className="btn-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                  <Trash2 size={16} />
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-tab" style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 2rem 0', fontSize: '1.5rem', color: '#1f2937' }}>Tenant Settings</h2>
            
            <div className="settings-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label>Tenant Name</label>
                  <input 
                    type="text"
                    value={editedTenant.name || ''}
                    onChange={e => setEditedTenant({...editedTenant, name: e.target.value})}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Slug</label>
                  <input 
                    type="text"
                    value={editedTenant.slug || ''}
                    onChange={e => setEditedTenant({...editedTenant, slug: e.target.value})}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Organization Name</label>
                  <input 
                    type="text"
                    value={editedTenant.settings?.organization_name || ''}
                    onChange={e => setEditedTenant({
                      ...editedTenant, 
                      settings: {...editedTenant.settings, organization_name: e.target.value}
                    })}
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Limits</h3>
                <div className="form-group">
                  <label>Max Admin Users</label>
                  <input 
                    type="number"
                    value={editedTenant.settings?.max_users || ''}
                    onChange={e => setEditedTenant({
                      ...editedTenant, 
                      settings: {...editedTenant.settings, max_users: parseInt(e.target.value) || undefined}
                    })}
                    placeholder="Unlimited"
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Max Employees</label>
                  <input 
                    type="number"
                    value={editedTenant.settings?.max_employees || ''}
                    onChange={e => setEditedTenant({
                      ...editedTenant, 
                      settings: {...editedTenant.settings, max_employees: parseInt(e.target.value) || undefined}
                    })}
                    placeholder="Unlimited"
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Status</h3>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={editedTenant.is_active || false}
                      onChange={e => setEditedTenant({...editedTenant, is_active: e.target.checked})}
                      disabled={!editMode}
                    />
                    <span>Tenant is Active</span>
                  </label>
                  <p className="help-text">Inactive tenants cannot be accessed by their users</p>
                </div>
              </div>

              <div className="form-section">
                <h3>Subscription</h3>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:'1rem'}}>
                  <div style={{background:'#f8fafc', border:'2px solid #e5e7eb', borderRadius:12, padding:'1rem'}}>
                    <p style={{margin:0, color:'#6b7280'}}>Current Plan</p>
                    <h4 style={{margin:'0.25rem 0 0.5rem 0', color:'#1f2937'}}>{tenant.subscription?.plan ? (tenant.subscription.plan==='yearly'?'Yearly':'Monthly') : 'Not set'}</h4>
                    <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                      <span style={{fontSize:12, color:'#6b7280'}}>Status:</span>
                      <strong style={{fontSize:12}}>{tenant.subscription?.status || 'pending'}</strong>
                    </div>
                    <div style={{display:'flex', gap:'0.5rem', alignItems:'center', marginTop:'0.5rem'}}>
                      <span style={{fontSize:12, color:'#6b7280'}}>Remaining:</span>
                      {(() => {
                        const d = daysLeft(tenant.subscription?.expires_at);
                        const s = badgeStyle(d);
                        return <span style={{padding:'0.125rem 0.5rem', borderRadius:12, background:s.bg, color:s.color, fontSize:12, fontWeight:700}}>{s.label}</span>;
                      })()}
                    </div>
                    <div style={{marginTop:'0.5rem', fontSize:12, color:'#6b7280'}}>
                      {tenant.subscription?.started_at && <div>Started: {new Date(tenant.subscription.started_at).toLocaleDateString()}</div>}
                      {tenant.subscription?.expires_at && <div>Expires: {new Date(tenant.subscription.expires_at).toLocaleDateString()}</div>}
                    </div>
                  </div>
                  <div style={{background:'#f8fafc', border:'2px solid #e5e7eb', borderRadius:12, padding:'1rem'}}>
                    <p style={{margin:0, color:'#6b7280'}}>Actions</p>
                    <div style={{display:'flex', gap:'0.5rem', marginTop:'0.75rem', flexWrap:'wrap'}}>
                      <button onClick={() => setSubscription('monthly')} className="btn-primary" style={{padding:'0.5rem 1rem', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, cursor:'pointer'}}>Set Monthly</button>
                      <button onClick={() => setSubscription('yearly')} className="btn-primary" style={{padding:'0.5rem 1rem', background:'#7c3aed', color:'#fff', border:'none', borderRadius:8, cursor:'pointer'}}>Set Yearly</button>
                      {!tenant.is_active && (
                        <button onClick={activateTenant} className="btn-secondary" style={{padding:'0.5rem 1rem', background:'#10b981', color:'#fff', border:'none', borderRadius:8, cursor:'pointer'}}>Activate Tenant</button>
                      )}
                    </div>
                    <p style={{marginTop:'0.75rem', fontSize:12, color:'#6b7280'}}>Activation sets the start date and computes expiry (30d monthly, 365d yearly). Before activation, status remains pending.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New User Modal */}
      {showNewUserModal && (
        <div className="modal-overlay" onClick={() => setShowNewUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Admin User</h2>
            <div className="form-group">
              <label>Username *</label>
              <input 
                type="text"
                value={newUser.username}
                onChange={e => setNewUser({...newUser, username: e.target.value})}
                placeholder="admin"
              />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Enter secure password"
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#6b7280'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Full Name *</label>
              <input 
                type="text"
                value={newUser.full_name}
                onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select 
                value={newUser.role}
                onChange={e => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={createAdminUser} className="btn-primary">Create User</button>
              <button onClick={() => setShowNewUserModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && editUser && (
        <div className="modal-overlay" onClick={() => setShowEditUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Admin User</h2>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={editUser.username} disabled />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={editUser.full_name} onChange={e => setEditUser({ ...editUser, full_name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={editUser.role} onChange={e => setEditUser({ ...editUser, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label>New Password (optional)</label>
              <input type="password" value={editUser.password || ''} onChange={e => setEditUser({ ...editUser, password: e.target.value })} placeholder="Leave blank to keep unchanged" />
            </div>
            <div className="modal-actions">
              <button onClick={updateAdminUser} className="btn-primary">Save Changes</button>
              <button onClick={() => setShowEditUserModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* New Employee Modal */}
      {showNewEmployeeModal && (
        <div className="modal-overlay" onClick={() => setShowNewEmployeeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Employee</h2>
            <div className="form-group">
              <label>Employee ID *</label>
              <input type="text" value={newEmployee.id} onChange={e => setNewEmployee({ ...newEmployee, id: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Name *</label>
              <input type="text" value={newEmployee.name} onChange={e => setNewEmployee({ ...newEmployee, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Team *</label>
              <input type="text" value={newEmployee.team} onChange={e => setNewEmployee({ ...newEmployee, team: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button onClick={createEmployee} className="btn-primary">Create</button>
              <button onClick={() => setShowNewEmployeeModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditEmployeeModal && editEmployee && (
        <div className="modal-overlay" onClick={() => setShowEditEmployeeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Employee</h2>
            <div className="form-group">
              <label>Employee ID</label>
              <input type="text" value={editEmployee.id} disabled />
            </div>
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={editEmployee.name} onChange={e => setEditEmployee({ ...editEmployee, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Team</label>
              <input type="text" value={editEmployee.team} onChange={e => setEditEmployee({ ...editEmployee, team: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button onClick={updateEmployee} className="btn-primary">Save Changes</button>
              <button onClick={() => setShowEditEmployeeModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dev-portal {
          min-height: 100vh;
          background: #f5f7fa;
        }
        .tenant-management {
          padding-bottom: 3rem;
        }
        .tenant-header {
          background: white;
          padding: 1.5rem 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 2rem;
          border-bottom: 1px solid #e5e7eb;
        }
        .btn-back {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-back:hover {
          background: #e5e7eb;
        }
        .tenant-title-section {
          flex: 1;
        }
        .tenant-title-section h1 {
          margin: 0 0 0.25rem 0;
          font-size: 1.75rem;
          color: #1f2937;
        }
        .tenant-slug {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
          font-family: monospace;
        }
        .tenant-header-actions {
          display: flex;
          gap: 1rem;
        }
        .btn-edit, .btn-save, .btn-cancel {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .btn-edit {
          background: #3b82f6;
          color: white;
        }
        .btn-edit:hover {
          background: #2563eb;
        }
        .btn-save {
          background: #10b981;
          color: white;
        }
        .btn-save:hover {
          background: #059669;
        }
        .btn-cancel {
          background: #f3f4f6;
          color: #374151;
        }
        .btn-cancel:hover {
          background: #e5e7eb;
        }
        .alert {
          margin: 2rem 2rem 0 2rem;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }
        .alert-success {
          background: #dcfce7;
          color: #15803d;
          border: 2px solid #86efac;
        }
        .alert-error {
          background: #fee2e2;
          color: #991b1b;
          border: 2px solid #fecaca;
        }
        .tab-navigation {
          background: white;
          padding: 0 2rem;
          display: flex;
          gap: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
          overflow-x: auto;
        }
        .tab-navigation button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          color: #6b7280;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .tab-navigation button:hover {
          color: #3b82f6;
          background: #f3f4f6;
        }
        .tab-navigation button.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
        }
        .tab-content {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        .overview-tab, .users-tab, .employees-tab, .data-tab, .settings-tab {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-box {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          text-align: center;
        }
        .stat-box h3 {
          margin: 0.75rem 0 0.25rem 0;
          font-size: 2rem;
          color: #1f2937;
        }
        .stat-box p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }
        .stat-box .limit {
          display: block;
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .info-section {
          margin-top: 2rem;
        }
        .info-section h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          color: #1f2937;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .info-item label {
          display: block;
          font-size: 0.75rem;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }
        .info-item p {
          margin: 0;
          font-size: 1rem;
          color: #1f2937;
          font-weight: 500;
        }
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-badge.active {
          background: #dcfce7;
          color: #15803d;
        }
        .status-badge.inactive {
          background: #fee2e2;
          color: #991b1b;
        }
        .tab-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }
        .tab-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #1f2937;
        }
        .tab-header p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }
        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-primary:hover {
          background: #2563eb;
        }
        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-secondary:hover {
          background: #e5e7eb;
        }
        .btn-danger {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-danger:hover {
          background: #dc2626;
        }
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #9ca3af;
        }
        .empty-state h3 {
          margin: 1rem 0 0.5rem 0;
          color: #6b7280;
        }
        .empty-state p {
          margin: 0 0 2rem 0;
          color: #9ca3af;
        }
        .table-container {
          overflow-x: auto;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th {
          text-align: left;
          padding: 1rem;
          background: #f8fafc;
          color: #475569;
          font-weight: 600;
          font-size: 0.875rem;
          border-bottom: 2px solid #e2e8f0;
        }
        .data-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        .data-table tr:hover {
          background: #f8fafc;
        }
        .role-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .btn-danger-small, .btn-warning-small, .btn-success-small {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 0.75rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-danger-small {
          background: #fee2e2;
          color: #991b1b;
        }
        .btn-danger-small:hover {
          background: #fecaca;
        }
        .btn-warning-small {
          background: #fef3c7;
          color: #b45309;
        }
        .btn-warning-small:hover {
          background: #fde68a;
        }
        .btn-success-small {
          background: #dcfce7;
          color: #15803d;
        }
        .btn-success-small:hover {
          background: #bbf7d0;
        }
        .action-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .action-card {
          background: #f8fafc;
          padding: 2rem;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          text-align: center;
        }
        .action-card.danger {
          background: #fef2f2;
          border-color: #fecaca;
        }
        .action-card h3 {
          margin: 1rem 0 0.5rem 0;
          color: #1f2937;
        }
        .action-card p {
          margin: 0 0 1.5rem 0;
          color: #6b7280;
          font-size: 0.875rem;
        }
        .settings-form {
          max-width: 800px;
        }
        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid #e5e7eb;
        }
        .form-section:last-child {
          border-bottom: none;
        }
        .form-section h3 {
          margin: 0 0 1.5rem 0;
          color: #1f2937;
          font-size: 1.125rem;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }
        .form-group input, .form-group select {
          width: 100%;
          padding: 0.875rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9375rem;
          transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group select:focus {
          outline: none;
          border-color: #3b82f6;
        }
        .form-group input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        .checkbox-label input[type="checkbox"] {
          width: auto;
        }
        .help-text {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }
        .modal-content h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          color: #1f2937;
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        .modal-actions button {
          flex: 1;
        }
        @media (max-width: 768px) {
          .tenant-header {
            flex-direction: column;
            align-items: stretch;
          }
          .tenant-header-actions {
            flex-direction: column;
          }
          .tab-navigation {
            overflow-x: auto;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .action-cards {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
