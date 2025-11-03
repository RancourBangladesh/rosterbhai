"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import '../../../styles/auth-clean.css';

export default function DeveloperLoginPage() {
  const [u,setU]=useState('');
  const [p,setP]=useState('');
  const [msg,setMsg]=useState('');
  const [loading,setLoading]=useState(false);
  const formRef = useRef<HTMLFormElement|null>(null);

  async function submit(e:React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true); 
    setMsg('');
    const res = await fetch('/api/developer/login',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({username:u.trim(),password:p})
    });
    const j = await res.json();
    setLoading(false);
    if (j.success) {
      window.location.href='/developer/dashboard';
    } else {
      setMsg(j.error || 'Invalid credentials');
      if (formRef.current) {
        formRef.current.classList.remove('shake');
        void formRef.current.offsetWidth;
        formRef.current.classList.add('shake');
      }
    }
  }

  useEffect(()=>{
    const handler = (e:KeyboardEvent)=>{
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        formRef.current?.dispatchEvent(new Event('submit', {cancelable:true,bubbles:true}));
      }
    };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  },[]);

  return (
    <div className="admin-auth-shell">
      <div className="admin-auth-wrapper">
        <div className="admin-auth-header">
          <div className="brand-icon"><Logo size={50} /></div>
          <div className="brand-text">
            <h1>RosterBhai <span>Developer</span></h1>
            <p className="tagline">Multi-Tenant Management System</p>
          </div>
        </div>
        
        <form ref={formRef} onSubmit={submit} className="admin-auth-form">
          <div className="admin-auth-input-group">
            <label htmlFor="username" className="admin-auth-label">Username</label>
            <input 
              id="username"
              type="text" 
              className="admin-auth-input"
              value={u} 
              onChange={e=>setU(e.target.value)}
              placeholder="Enter developer username"
              autoFocus
              required
            />
          </div>
          <div className="admin-auth-input-group">
            <label htmlFor="password" className="admin-auth-label">Password</label>
            <input 
              id="password"
              type="password" 
              className="admin-auth-input"
              value={p} 
              onChange={e=>setP(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          {msg && <div className="admin-auth-error">{msg}</div>}
          <button 
            type="submit" 
            className="admin-auth-btn"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In to Developer Portal'}
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
