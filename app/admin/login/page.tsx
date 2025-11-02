"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { User, Lock } from 'lucide-react';
import '../../../styles/auth-clean.css';

export default function AdminLoginPage() {
  const [u,setU]=useState('');
  const [p,setP]=useState('');
  const [msg,setMsg]=useState('');
  const [loading,setLoading]=useState(false);
  const [validatingTenant, setValidatingTenant] = useState(true);
  const [tenantValid, setTenantValid] = useState(false);
  const formRef = useRef<HTMLFormElement|null>(null);

  useEffect(() => {
    // Validate that the tenant exists
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

  async function submit(e:React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true); 
    setMsg('');
    const res = await fetch('/api/admin/login',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({username:u.trim(),password:p})
    });
    const j = await res.json();
    setLoading(false);
    if (j.success) {
      window.location.href='/admin/dashboard';
    } else {
      setMsg(j.error || 'Invalid credentials');
      // trigger a shake animation
      if (formRef.current) {
        formRef.current.classList.remove('shake');
        // force reflow
        void formRef.current.offsetWidth;
        formRef.current.classList.add('shake');
      }
    }
  }

  // Allow Enter on both inputs
  useEffect(()=>{
    const handler = (e:KeyboardEvent)=>{
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        formRef.current?.dispatchEvent(new Event('submit', {cancelable:true,bubbles:true}));
      }
    };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  },[]);

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
    <div className="admin-auth-shell">
      <div className="admin-auth-wrapper">
        <div className="admin-auth-header">
          <div className="brand-icon"><Logo size={50} /></div>
          <div className="brand-text">
            <h1>RosterBhai <span>Admin</span></h1>
            <p className="tagline">Team Lead & Administrator Access</p>
          </div>
        </div>

        <form ref={formRef} onSubmit={submit} className="admin-auth-form">
          <div className="form-field">
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              autoComplete="username"
              placeholder="Enter your username"
              value={u}
              onChange={e=>setU(e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={p}
              onChange={e=>setP(e.target.value)}
              required
            />
          </div>

          {msg && (
            <div className="auth-message error">
              {msg}
            </div>
          )}

          <button
            type="submit"
            className="admin-auth-btn"
            disabled={loading || !u || !p}
          >
            {loading ? 'Signing In...' : 'Sign In to Admin Panel'}
          </button>
        </form>

        <div className="admin-auth-footer">
          <Link href="/" className="admin-auth-link">
            ← Back to Employee Portal
          </Link>
        </div>
      </div>
    </div>
  );
}