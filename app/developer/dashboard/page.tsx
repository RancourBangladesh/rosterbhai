"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  UserCog, 
  Activity, 
  Plus, 
  Power, 
  PowerOff, 
  Settings, 
  LogOut,
  Copy,
  CheckCircle,
  Calendar,
  Shield
} from 'lucide-react';

interface Tenant {
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

interface TenantStats {
  users: number;
  employees: number;
}

export default function DeveloperDashboard() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<Record<string, TenantStats>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [createdTenantInfo, setCreatedTenantInfo] = useState<any>(null);
  const [newTenant, setNewTenant] = useState({ 
    name: '', 
    slug: '', 
    max_users: '', 
    max_employees: '',
    adminUsername: '',
    adminPassword: '',
    adminFullName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    try {
      const res = await fetch('/api/developer/tenants');
      const data = await res.json();
      if (data.success) {
        setTenants(data.tenants);
        setStats(data.stats || {});
      }
    } catch (e) {
      console.error('Failed to load tenants', e);
    } finally {
      setLoading(false);
    }
  }

  async function createTenant() {
    setError('');
    setSuccess('');
    
    if (!newTenant.name || !newTenant.slug) {
      setError('Name and slug are required');
      return;
    }

    if (!newTenant.adminUsername || !newTenant.adminPassword || !newTenant.adminFullName) {
      setError('Admin credentials are required');
      return;
    }

    try {
      const res = await fetch('/api/developer/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTenant.name,
          slug: newTenant.slug,
          max_users: newTenant.max_users ? parseInt(newTenant.max_users) : undefined,
          max_employees: newTenant.max_employees ? parseInt(newTenant.max_employees) : undefined,
          adminUser: {
            username: newTenant.adminUsername,
            password: newTenant.adminPassword,
            full_name: newTenant.adminFullName,
            role: 'admin'
          }
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setCreatedTenantInfo({
          tenant: data.tenant,
          adminUsername: newTenant.adminUsername,
          adminPassword: newTenant.adminPassword,
          adminFullName: newTenant.adminFullName
        });
        setShowCreateModal(false);
        setShowCredentialsModal(true);
        setNewTenant({ 
          name: '', 
          slug: '', 
          max_users: '', 
          max_employees: '',
          adminUsername: '',
          adminPassword: '',
          adminFullName: ''
        });
        loadTenants();
      } else {
        setError(data.error || 'Failed to create tenant');
      }
    } catch (e) {
      setError('Failed to create tenant');
    }
  }

  async function toggleTenantStatus(tenantId: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/developer/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      
      const data = await res.json();
      if (data.success) {
        loadTenants();
      }
    } catch (e) {
      console.error('Failed to toggle tenant status', e);
    }
  }

  async function logout() {
    await fetch('/api/developer/logout', { method: 'POST' });
    router.push('/developer/login');
  }

  if (loading) {
    return <div className="admin-shell"><div style={{padding:'2rem', textAlign:'center'}}>Loading...</div></div>;
  }

  const activeTenants = tenants.filter(t => t.is_active).length;
  const monthlyTenants = tenants.filter(t => t.subscription?.plan==='monthly').length;
  const yearlyTenants = tenants.filter(t => t.subscription?.plan==='yearly').length;
  const totalUsers = Object.values(stats).reduce((sum, s) => sum + s.users, 0);
  const totalEmployees = Object.values(stats).reduce((sum, s) => sum + s.employees, 0);

  return (
    <div className="dev-portal">
      {/* Modern Header */}
      <header className="dev-header">
        <div className="dev-header-left">
          <div className="dev-logo">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="dev-title">Developer Portal</h1>
            <p className="dev-subtitle">Multi-Tenant Management Dashboard</p>
          </div>
        </div>
        <div className="dev-header-actions">
          <button onClick={() => router.push('/developer/landing-cms')} className="btn-secondary-action">
            <Settings size={18} />
            Landing CMS
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-create">
            <Plus size={18} />
            Create Tenant
          </button>
          <button onClick={logout} className="btn-logout">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="dev-content">
        {/* Stats Cards */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>
              <Building2 size={24} style={{ color: '#1e40af' }} />
            </div>
            <div className="stat-info">
              <h3>{tenants.length}</h3>
              <p>Total Tenants</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7' }}>
              <Activity size={24} style={{ color: '#15803d' }} />
            </div>
            <div className="stat-info">
              <h3>{activeTenants}</h3>
              <p>Active Tenants</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f3e8ff' }}>
              <span style={{fontWeight:800,color:'#7e22ce'}}>Y</span>
            </div>
            <div className="stat-info">
              <h3>{yearlyTenants}</h3>
              <p>Yearly Clients</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fee2e2' }}>
              <span style={{fontWeight:800,color:'#b91c1c'}}>M</span>
            </div>
            <div className="stat-info">
              <h3>{monthlyTenants}</h3>
              <p>Monthly Clients</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>
              <UserCog size={24} style={{ color: '#b45309' }} />
            </div>
            <div className="stat-info">
              <h3>{totalUsers}</h3>
              <p>Total Admin Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#e0e7ff' }}>
              <Users size={24} style={{ color: '#4338ca' }} />
            </div>
            <div className="stat-info">
              <h3>{totalEmployees}</h3>
              <p>Total Employees</p>
            </div>
          </div>
        </div>

        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Tenants Section */}
        <div className="tenants-section">
          <div className="section-header">
            <h2>Tenant Organizations</h2>
            <p>{tenants.length} total tenants</p>
          </div>

          {tenants.length === 0 ? (
            <div className="empty-state">
              <Building2 size={48} style={{ color: '#cbd5e1' }} />
              <h3>No Tenants Yet</h3>
              <p>Create your first tenant organization to get started</p>
              <button onClick={() => setShowCreateModal(true)} className="btn-create">
                <Plus size={18} />
                Create First Tenant
              </button>
            </div>
          ) : (
            <div className="tenants-grid">
              {tenants.map(tenant => (
                <div key={tenant.id} className={`tenant-card ${!tenant.is_active ? 'inactive-tenant' : ''}`}>
                  <div className="tenant-card-header">
                    <div className="tenant-icon">
                      {tenant.settings.logo_url ? (
                        <img 
                          src={tenant.settings.logo_url} 
                          alt={tenant.name}
                          className="tenant-logo-img"
                        />
                      ) : (
                        <Building2 size={24} />
                      )}
                    </div>
                    <div className="tenant-status" style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
                      {tenant.subscription && (
                        <span className="badge-plan" style={{padding:'0.25rem 0.5rem',borderRadius:12,fontSize:'0.75rem',fontWeight:700, background: tenant.subscription.plan==='yearly' ? '#ede9fe' : '#fee2e2', color: tenant.subscription.plan==='yearly' ? '#6d28d9' : '#b91c1c'}}>
                          {tenant.subscription.plan === 'yearly' ? 'Yearly' : 'Monthly'}
                        </span>
                      )}
                      {tenant.is_active ? (
                        <span className="badge-active">
                          <Power size={12} /> Active
                        </span>
                      ) : (
                        <span className="badge-inactive">
                          <PowerOff size={12} /> Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="tenant-info">
                    <h3 className="tenant-name">
                      {tenant.settings.organization_name || tenant.name}
                    </h3>
                    <div className="tenant-meta">
                      <span className="tenant-slug">@{tenant.slug}</span>
                      <span className="tenant-date">
                        <Calendar size={14} />
                        {new Date(tenant.created_at).toLocaleDateString()}
                      </span>
                      {tenant.subscription && (
                        <SubscriptionBadge sub={tenant.subscription} />
                      )}
                    </div>
                  </div>

                  {stats[tenant.id] && (
                    <div className="tenant-metrics">
                      <div className="metric">
                        <UserCog size={16} />
                        <span>{stats[tenant.id].users} users</span>
                        {tenant.settings.max_users && (
                          <span className="limit">/ {tenant.settings.max_users}</span>
                        )}
                      </div>
                      <div className="metric">
                        <Users size={16} />
                        <span>{stats[tenant.id].employees} employees</span>
                        {tenant.settings.max_employees && (
                          <span className="limit">/ {tenant.settings.max_employees}</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="tenant-actions">
                    <button 
                      onClick={() => router.push(`/developer/tenants/${tenant.id}`)}
                      className="btn-manage"
                    >
                      <Settings size={16} />
                      Manage
                    </button>
                    <button 
                      onClick={() => toggleTenantStatus(tenant.id, tenant.is_active)}
                      className={tenant.is_active ? 'btn-deactivate' : 'btn-activate'}
                    >
                      {tenant.is_active ? (
                        <><PowerOff size={16} /> Deactivate</>
                      ) : (
                        <><Power size={16} /> Activate</>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Tenant</h2>
            <div className="form-group">
              <label>Tenant Name</label>
              <input 
                type="text"
                value={newTenant.name}
                onChange={e => setNewTenant({...newTenant, name: e.target.value})}
                placeholder="e.g., Acme Corporation"
              />
            </div>
            <div className="form-group">
              <label>Slug (URL identifier)</label>
              <input 
                type="text"
                value={newTenant.slug}
                onChange={e => setNewTenant({...newTenant, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                placeholder="e.g., acme-corp"
              />
            </div>
            <div className="form-group">
              <label>Max Users (optional)</label>
              <input 
                type="number"
                value={newTenant.max_users}
                onChange={e => setNewTenant({...newTenant, max_users: e.target.value})}
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div className="form-group">
              <label>Max Employees (optional)</label>
              <input 
                type="number"
                value={newTenant.max_employees}
                onChange={e => setNewTenant({...newTenant, max_employees: e.target.value})}
                placeholder="Leave empty for unlimited"
              />
            </div>
            
            <h3 style={{marginTop: '1.5rem', marginBottom: '1rem'}}>Admin User Credentials</h3>
            
            <div className="form-group">
              <label>Admin Username *</label>
              <input 
                type="text"
                value={newTenant.adminUsername}
                onChange={e => setNewTenant({...newTenant, adminUsername: e.target.value})}
                placeholder="admin"
                required
              />
            </div>
            <div className="form-group">
              <label>Admin Password *</label>
              <input 
                type="password"
                value={newTenant.adminPassword}
                onChange={e => setNewTenant({...newTenant, adminPassword: e.target.value})}
                placeholder="Enter secure password"
                required
              />
            </div>
            <div className="form-group">
              <label>Admin Full Name *</label>
              <input 
                type="text"
                value={newTenant.adminFullName}
                onChange={e => setNewTenant({...newTenant, adminFullName: e.target.value})}
                placeholder="e.g., John Doe"
                required
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={createTenant} className="btn-primary">Create Tenant</button>
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCredentialsModal && createdTenantInfo && (
        <div className="modal-overlay" onClick={() => setShowCredentialsModal(false)}>
          <div className="modal-content credentials-modal" onClick={(e) => e.stopPropagation()}>
            <h2 style={{color: '#10b981'}}>✅ Tenant Created Successfully!</h2>
            
            <div className="credentials-box">
              <h3>Tenant Information</h3>
              <p><strong>Name:</strong> {createdTenantInfo.tenant.name}</p>
              <p><strong>Slug:</strong> {createdTenantInfo.tenant.slug}</p>
              <p><strong>Tenant ID:</strong> {createdTenantInfo.tenant.id}</p>
            </div>
            
            <div className="credentials-box admin-creds">
              <h3>Admin Login Credentials</h3>
              <p><strong>Username:</strong> {createdTenantInfo.adminUsername}</p>
              <p><strong>Password:</strong> {createdTenantInfo.adminPassword}</p>
              <p><strong>Full Name:</strong> {createdTenantInfo.adminFullName}</p>
              <p style={{marginTop: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: '4px', fontSize: '0.9rem'}}>
                <strong>Important:</strong> Save these credentials now! They won&apos;t be shown again.
              </p>
            </div>
            
            <div className="credentials-box">
              <h3>Admin Portal URL</h3>
              <p><a href="/admin/login" target="_blank" style={{color: '#3b82f6'}}>
                http://localhost:3000/admin/login
              </a></p>
            </div>
            
            <div className="modal-actions">
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`Username: ${createdTenantInfo.adminUsername}\nPassword: ${createdTenantInfo.adminPassword}`);
                  alert('Credentials copied to clipboard!');
                }}
                className="btn-secondary"
              >
                Copy Credentials
              </button>
              <button onClick={() => setShowCredentialsModal(false)} className="btn-primary">Got it!</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .dev-portal {
          min-height: 100vh;
          background: #f5f7fa;
        }
        .dev-header {
          background: white;
          padding: 1.5rem 2rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }
        .dev-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .dev-logo {
          width: 48px;
          height: 48px;
          background: #2563eb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .dev-title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }
        .dev-subtitle {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
        }
        .dev-header-actions {
          display: flex;
          gap: 1rem;
        }
        .btn-create {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-create:hover {
          background: #1d4ed8;
        }
        .btn-logout {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-logout:hover {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        .btn-secondary-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #f8fafc;
          color: #2563eb;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-secondary-action:hover {
          background: #e2e8f0;
          border-color: #2563eb;
        }
        .dev-content {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-info h3 {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
        }
        .stat-info p {
          margin: 0.25rem 0 0 0;
          font-size: 0.875rem;
          color: #6b7280;
        }
        .tenants-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .section-header {
          margin-bottom: 2rem;
        }
        .section-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }
        .section-header p {
          margin: 0;
          font-size: 0.875rem;
          color: #6b7280;
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
        .tenants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .tenant-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.2s;
        }
        .tenant-card:hover {
          border-color: #2563eb;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
          transform: translateY(-2px);
        }
        .tenant-card.inactive-tenant {
          opacity: 0.6;
          background: #f9fafb;
        }
        .tenant-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        .tenant-icon {
          width: 48px;
          height: 48px;
          background: #2563eb;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          overflow: hidden;
        }
        .tenant-logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          background: white;
          padding: 4px;
        }
        .tenant-status {
          display: flex;
          gap: 0.5rem;
        }
        .badge-active, .badge-inactive {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-active {
          background: #dcfce7;
          color: #15803d;
        }
        .badge-inactive {
          background: #fee2e2;
          color: #991b1b;
        }
        .tenant-info {
          margin: 1rem 0;
        }
        .tenant-name {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }
        .tenant-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .tenant-slug {
          font-size: 0.875rem;
          color: #2563eb;
          font-weight: 600;
        }
        .tenant-date {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }
        .tenant-metrics {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem 0;
          border-top: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 1rem;
        }
        .metric {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
        .metric .limit {
          color: #9ca3af;
        }
        .tenant-actions {
          display: flex;
          gap: 0.75rem;
        }
        .btn-manage, .btn-activate, .btn-deactivate {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .btn-manage {
          background: #f3f4f6;
          color: #374151;
        }
        .btn-manage:hover {
          background: #e5e7eb;
        }
        .btn-activate {
          background: #dcfce7;
          color: #15803d;
        }
        .btn-activate:hover {
          background: #bbf7d0;
        }
        .btn-deactivate {
          background: #fee2e2;
          color: #991b1b;
        }
        .btn-deactivate:hover {
          background: #fecaca;
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
          animation: fadeIn 0.2s;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          max-width: 540px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s;
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .modal-content h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          color: #1f2937;
        }
        .modal-content h3 {
          margin: 1.5rem 0 1rem 0;
          font-size: 1.125rem;
          color: #374151;
        }
        .credentials-modal {
          max-width: 640px;
        }
        .credentials-box {
          background: #f8fafc;
          padding: 1.25rem;
          border-radius: 12px;
          margin: 1rem 0;
          border: 2px solid #e2e8f0;
        }
        .credentials-box h3 {
          margin-top: 0;
          margin-bottom: 0.75rem;
          color: #334155;
          font-size: 1rem;
          font-weight: 700;
        }
        .credentials-box p {
          margin: 0.5rem 0;
          font-family: 'Courier New', monospace;
          font-size: 0.95rem;
          color: #1f2937;
        }
        .admin-creds {
          background: #ecfdf5;
          border-color: #10b981;
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
        .form-group input {
          width: 100%;
          padding: 0.875rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9375rem;
          transition: border-color 0.2s;
        }
        .form-group input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }
        .modal-actions button {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        .modal-actions .btn-primary {
          background: #2563eb;
          color: white;
        }
        .modal-actions .btn-primary:hover {
          background: #1d4ed8;
        }
        .modal-actions .btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }
        .modal-actions .btn-secondary:hover {
          background: #e5e7eb;
        }
        .alert {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
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
        @media (max-width: 768px) {
          .dev-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .dev-header-actions {
            flex-direction: column;
          }
          .stats-section {
            grid-template-columns: 1fr;
          }
          .tenants-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function daysLeft(expires_at?: string) {
  if (!expires_at) return null;
  const now = new Date();
  const until = new Date(expires_at);
  return Math.ceil((until.getTime() - now.getTime()) / (1000*60*60*24));
}

function badgeColor(days: number|null) {
  if (days === null) return { bg:'#e5e7eb', color:'#374151', label:'N/A' };
  if (days <= 2) return { bg:'#fee2e2', color:'#991b1b', label:`${days}d` };
  if (days <= 5) return { bg:'#fee2e2', color:'#b91c1c', label:`${days}d` };
  if (days <= 15) return { bg:'#fef3c7', color:'#b45309', label:`${days}d` };
  return { bg:'#dcfce7', color:'#15803d', label:`${days}d` };
}

function SubscriptionBadge({ sub }: { sub: NonNullable<Tenant['subscription']> }) {
  const d = daysLeft(sub.expires_at);
  const colors = badgeColor(d);
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
      <span style={{padding:'0.125rem 0.5rem',borderRadius:12,fontSize:12,fontWeight:700,background: colors.bg, color: colors.color}}>
        {d === null ? 'pending' : colors.label}
      </span>
      {sub.status === 'pending' && <span style={{fontSize:12,color:'#9ca3af'}}>(awaiting activation)</span>}
    </span>
  );
}

