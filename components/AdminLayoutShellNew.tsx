"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Lock,
  User,
  RefreshCw,
  Menu,
  X,
  Edit,
  LogOut,
  BarChart3,
  FileUp,
  Clock
} from 'lucide-react';

// Bottom tabs (main navigation)
const bottomTabs = [
  { id: 'overview',           label: 'Dashboard',          icon: LayoutDashboard, href: '/admin/dashboard/overview' },
  { id: 'schedule-requests',  label: 'Schedule Requests',  icon: Calendar, href: '/admin/dashboard/schedule-requests' },
  { id: 'template-creator',   label: 'Template Creator',   icon: Edit, href: '/admin/dashboard/template-creator' },
  { id: 'roster-sync',        label: 'Roster Sync',        icon: RefreshCw, href: '/admin/dashboard/roster-sync' },
  { id: 'roster-data',        label: 'Roster Data',        icon: BarChart3, href: '/admin/dashboard/roster-data' },
  { id: 'csv-import',         label: 'CSV Import',         icon: FileUp, href: '/admin/dashboard/csv-import' }
];

// Management / profile tabs (shown in header on mobile)
const topTabs = [
  { id: 'profile',             label: 'My Profile',         icon: User, href: '/admin/dashboard/profile' },
  { id: 'employee-management', label: 'Employee Registry',  icon: Users, href: '/admin/dashboard/employee-management' },
  { id: 'team-management',     label: 'Team Management',    icon: Users, href: '/admin/dashboard/team-management' },
  { id: 'user-management',     label: 'User Management',    icon: Lock, href: '/admin/dashboard/user-management' },
  { id: 'shift-management',    label: 'Shift Management',   icon: Clock, href: '/admin/dashboard/shift-management' }
];

const tabs = [...bottomTabs, ...topTabs];

export default function AdminLayoutShellNew({
  children,
  adminUser,
  userRole
}: {
  children: React.ReactNode;
  adminUser: string;
  userRole?: string;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const prevPendingRef = useRef<number>(0);

  const [panelTitle, setPanelTitle] = useState('RosterBhai');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');

  // Determine active tab from pathname
  const activeTab = tabs.find(t => pathname === t.href) || tabs[0];

  // Load organization name and logo from API
  useEffect(() => {
    async function loadOrgData() {
      try {
        const res = await fetch('/api/admin/get-organization-name');
        if (res.ok) {
          const data = await res.json();
          if (data.organization_name) {
            setPanelTitle(data.organization_name);
          }
          if (data.logo_url) {
            setLogoUrl(data.logo_url);
          }
        }
      } catch (err) {
        console.error('Failed to load organization data:', err);
      }
    }
    loadOrgData();
  }, []);

  // Poll pending schedule requests count for notification badge
  useEffect(() => {
    let mounted = true;
    let timer: any;
    async function loadPending() {
      try {
        const res = await fetch('/api/schedule-requests/get-pending', { cache: 'no-store' });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          if (data?.success && typeof data?.stats?.pending_count === 'number') {
            const next = data.stats.pending_count as number;
            prevPendingRef.current = pendingRequests;
            setPendingRequests(next);
          }
        }
      } catch {}
      if (!mounted) return;
      timer = setTimeout(loadPending, 7000); // poll every ~7s
    }
    loadPending();
    return () => { mounted = false; if (timer) clearTimeout(timer); };
  }, []);

  // Mobile header height compensation
  useEffect(() => {
    function applyOffset() {
      if (typeof window === 'undefined') return;
      if (window.innerWidth <= 480 && headerRef.current) {
        const h = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--mobile-header-offset', h + 'px');
      } else {
        document.documentElement.style.removeProperty('--mobile-header-offset');
      }
    }
    applyOffset();
    window.addEventListener('resize', applyOffset);
    const t1 = setTimeout(applyOffset, 150);
    const t2 = setTimeout(applyOffset, 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', applyOffset);
    };
  }, [panelTitle, isEditingTitle, pathname]);

  const handleSaveTitle = async () => {
    if (tempTitle.trim()) {
      const newTitle = tempTitle.trim();
      try {
        const res = await fetch('/api/admin/save-organization-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organization_name: newTitle })
        });
        if (res.ok) {
          setPanelTitle(newTitle);
        } else {
          alert('Failed to save organization name');
        }
      } catch (err) {
        console.error('Failed to save organization name:', err);
        alert('Failed to save organization name');
      }
    }
    setIsEditingTitle(false);
    setTempTitle('');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 500000) {
      alert('Logo file size must be less than 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      try {
        const res = await fetch('/api/admin/upload-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ logo_data: base64String })
        });
        
        if (res.ok) {
          const data = await res.json();
          setLogoUrl(data.logo_url);
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to upload logo');
        }
      } catch (err) {
        console.error('Failed to upload logo:', err);
        alert('Failed to upload logo');
      }
    };
    
    reader.readAsDataURL(file);
  };

  const handleLogoRemove = async () => {
    if (!confirm('Are you sure you want to remove the logo?')) return;
    
    try {
      const res = await fetch('/api/admin/delete-logo', {
        method: 'POST'
      });
      
      if (res.ok) {
        setLogoUrl(null);
      } else {
        alert('Failed to remove logo');
      }
    } catch (err) {
      console.error('Failed to remove logo:', err);
      alert('Failed to remove logo');
    }
  };

  return (
    <div className="admin-layout-modern">
      {/* Sidebar (desktop / tablet) */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          <div
            className="admin-logo"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', cursor: collapsed ? 'default' : 'pointer', flexDirection: collapsed ? 'column' : 'row' }}
          >
            {collapsed ? (
              logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '8px' }}
                />
              ) : (
                <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="28" width="60" height="52" rx="6" fill="#4F46E5" opacity="0.1"/>
                  <rect x="20" y="28" width="60" height="52" rx="6" stroke="#4F46E5" strokeWidth="2.5"/>
                  <rect x="20" y="28" width="60" height="12" fill="#4F46E5" rx="6" style={{clipPath: 'inset(0 0 50% 0)'}}/>
                  <rect x="32" y="22" width="4" height="10" rx="2" fill="#4F46E5"/>
                  <rect x="64" y="22" width="4" height="10" rx="2" fill="#4F46E5"/>
                  <circle cx="34" cy="52" r="2.5" fill="#4F46E5"/>
                  <circle cx="50" cy="52" r="2.5" fill="#4F46E5"/>
                  <circle cx="66" cy="52" r="2.5" fill="#4F46E5"/>
                  <circle cx="34" cy="64" r="2.5" fill="#4F46E5"/>
                  <circle cx="50" cy="64" r="2.5" fill="#4F46E5"/>
                  <circle cx="66" cy="64" r="2.5" fill="#4F46E5"/>
                </svg>
              )
            ) : (
              <>
                {logoUrl && (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      style={{ width: '42px', height: '42px', objectFit: 'contain', borderRadius: '8px' }}
                    />
                    {(userRole === 'super_admin' || userRole === 'admin') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLogoRemove();
                        }}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: 'var(--danger)',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '10px',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}
                        title="Remove logo"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                    autoFocus
                    style={{
                      background: 'var(--panel-alt)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '1.1rem',
                      width: '100%',
                      textAlign: 'center'
                    }}
                  />
                ) : (
                  <>
                    <span>{panelTitle}</span>
                    {(userRole === 'super_admin' || userRole === 'admin') && (
                      <button
                        onClick={() => {
                          setIsEditingTitle(true);
                          setTempTitle(panelTitle);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Edit panel title"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          {!collapsed && !isEditingTitle && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div className="admin-subtitle">Admin Panel</div>
              {(userRole === 'super_admin' || userRole === 'admin') && (
                <label
                  htmlFor="logo-upload"
                  style={{
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: 'var(--primary)',
                    textDecoration: 'underline',
                    padding: '4px 8px'
                  }}
                >
                  {logoUrl ? 'Change Logo' : '+ Add Logo'}
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          )}
        </div>

        <button
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>

        <nav className="admin-sidebar-nav">
          {tabs.map((t) => {
            if (t.id === 'user-management' && userRole !== 'super_admin' && userRole !== 'admin') {
              return null;
            }
            const Icon = t.icon;
            const isActive = pathname === t.href;
            return (
              <Link
                key={t.id}
                href={t.href}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? t.label : ''}
                style={{ position: 'relative' }}
              >
                <Icon size={20} />
                {!collapsed && <span>{t.label}</span>}
                {t.id === 'schedule-requests' && pendingRequests > 0 && (
                  <span
                    aria-label={`${pendingRequests} pending requests`}
                    title={`${pendingRequests} pending requests`}
                    style={{
                      position: 'absolute',
                      right: collapsed ? 6 : 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#ef4444',
                      color: '#fff',
                      borderRadius: 9999,
                      padding: '0 6px',
                      minWidth: 18,
                      height: 18,
                      lineHeight: '18px',
                      fontSize: 11,
                      fontWeight: 700,
                      textAlign: 'center',
                      boxShadow: '0 0 0 2px var(--panel, #0e141c)'
                    }}
                  >
                    {pendingRequests > 99 ? '99+' : pendingRequests}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="user-icon">
              <User size={20} />
            </div>
            {!collapsed && (
              <div className="user-details">
                <div className="user-name">{adminUser}</div>
                <div className="user-role">Administrator</div>
              </div>
            )}
          </div>
          <button
            className="logout-btn-sidebar"
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              window.location.href = '/admin/login';
            }}
            title={collapsed ? 'Logout' : ''}
            style={{display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'flex-start', gap:8}}
          >
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className={`admin-main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="admin-content-header" ref={headerRef}>
          <h1>{activeTab.label}</h1>
          <div className="header-actions">
            <span className="timestamp desktop-only">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </header>

        <div className="admin-content-body">
          {children}
        </div>
      </main>
    </div>
  );
}
