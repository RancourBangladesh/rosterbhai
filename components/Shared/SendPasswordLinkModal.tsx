"use client";
import { useState } from 'react';
import { Mail, Copy, CheckCircle, X } from 'lucide-react';

interface Props {
  employee: {
    id: string;
    name: string;
  };
  onClose: () => void;
}

export default function SendPasswordLinkModal({ employee, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateLink = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/send-employee-password-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employee.id,
          employee_name: employee.name,
          email: email
        })
      });

      const data = await res.json();

      if (data.success) {
        setResetLink(data.reset_link);
      } else {
        setError(data.error || 'Failed to generate password link');
      }
    } catch (err) {
      setError('Failed to generate password link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={24} />
            Send Password Setup Link
          </h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--panel-alt)', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>
              <strong>Employee:</strong> {employee.name} ({employee.id})
            </p>
          </div>

          {!resetLink ? (
            <>
              <p style={{ marginBottom: '20px', color: 'var(--text-dim)' }}>
                Enter the employee&apos;s email address to generate a password setup link. 
                The link will be valid for 24 hours.
              </p>

              <div className="form-grid">
                <div>
                  <label htmlFor="employee-email">Employee Email Address</label>
                  <input
                    id="employee-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="employee@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {error && (
                <div style={{ 
                  marginTop: '15px', 
                  padding: '12px', 
                  background: 'var(--danger-light)', 
                  border: '1px solid var(--danger)', 
                  borderRadius: '8px',
                  color: 'var(--danger)'
                }}>
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ 
                marginBottom: '20px', 
                padding: '16px', 
                background: 'var(--success-light)', 
                border: '1px solid var(--success)', 
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                  <strong style={{ color: 'var(--success)' }}>Password Link Generated!</strong>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-dim)' }}>
                  Copy the link below and send it to {employee.name} via email.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                  Password Setup Link (Valid for 24 hours)
                </label>
                <div style={{ 
                  display: 'flex', 
                  gap: '8px',
                  padding: '12px',
                  background: 'var(--panel-alt)',
                  borderRadius: '8px',
                  border: '1px solid var(--border)'
                }}>
                  <input
                    type="text"
                    value={resetLink}
                    readOnly
                    style={{ 
                      flex: 1,
                      padding: '8px',
                      fontSize: '13px',
                      background: 'white',
                      border: '1px solid var(--border)'
                    }}
                  />
                  <button
                    onClick={handleCopyLink}
                    className="btn secondary small"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {copied ? (
                      <>
                        <CheckCircle size={16} style={{ display: 'inline', marginRight: '6px' }} />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={16} style={{ display: 'inline', marginRight: '6px' }} />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div style={{ 
                padding: '12px', 
                background: 'var(--primary-light)', 
                borderRadius: '8px',
                fontSize: '14px',
                color: 'var(--text-dim)'
              }}>
                <strong>📧 Email Template:</strong>
                <p style={{ marginTop: '8px', marginBottom: '0' }}>
                  Hi {employee.name},<br /><br />
                  Your account has been created. Please click the link below to set up your password:<br />
                  <span style={{ wordBreak: 'break-all', color: 'var(--primary)' }}>{resetLink}</span><br /><br />
                  This link will expire in 24 hours. After setting your password, you can login with your Employee ID ({employee.id}) and your new password.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          {!resetLink ? (
            <>
              <button 
                className="btn primary" 
                onClick={handleGenerateLink}
                disabled={loading || !email}
              >
                {loading ? 'Generating...' : 'Generate Password Link'}
              </button>
              <button className="btn" onClick={onClose}>
                Cancel
              </button>
            </>
          ) : (
            <button className="btn primary" onClick={onClose}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
