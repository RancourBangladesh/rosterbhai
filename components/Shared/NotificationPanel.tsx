"use client";
import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, AlertCircle, Info, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  adminMessage?: string;
  date?: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
}

interface Props {
  employeeId: string;
}

export default function NotificationPanel({ employeeId }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/my-schedule/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [employeeId]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'request_approved':
        return <CheckCircle2 size={18} />;
      case 'request_rejected':
        return <AlertCircle size={18} />;
      case 'shift_modified':
        return <Clock size={18} />;
      case 'swap_request_received':
        return <Info size={18} />;
      default:
        return <Bell size={18} />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'request_approved':
        return '#10b981'; // Green for approved
      case 'request_rejected':
        return '#ef4444'; // Red for rejected
      case 'shift_modified':
        return '#f59e0b'; // Orange for modified
      case 'swap_request_received':
        return '#3b82f6'; // Blue for swap requests
      default:
        return '#6b7280';
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'request_approved':
        return '#f0fdf4'; // Light green background
      case 'request_rejected':
        return '#fef2f2'; // Light red background
      case 'shift_modified':
        return '#fef3c7'; // Light orange background
      default:
        return '#fff';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: 'relative',
          background: showPanel ? '#3b82f6' : '#f3f4f6',
          color: showPanel ? '#fff' : '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div
          style={{
            position: 'absolute',
            top: '60px',
            right: 0,
            width: '360px',
            maxWidth: '90vw',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '500px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <button
              onClick={() => setShowPanel(false)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
                display: 'flex'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Notifications List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loading && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                Loading notifications...
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                <Bell size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <div>No new notifications</div>
              </div>
            )}

            {!loading && notifications.length > 0 && (
              <div>
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #f3f4f6',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'start',
                      background: getBackgroundColor(notif.type),
                      cursor: 'default'
                    }}
                  >
                    <div style={{ color: getColor(notif.type), flexShrink: 0 }}>
                      {getIcon(notif.type)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#111827',
                          marginBottom: '4px'
                        }}
                      >
                        {notif.title}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#4b5563',
                          lineHeight: '1.5',
                          marginBottom: '6px'
                        }}
                      >
                        {notif.message}
                      </div>
                      {notif.adminMessage && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            fontStyle: 'italic',
                            padding: '8px',
                            background: 'rgba(0,0,0,0.03)',
                            borderRadius: '6px',
                            marginBottom: '6px',
                            borderLeft: '3px solid ' + getColor(notif.type)
                          }}
                        >
                          💬 Admin: {notif.adminMessage}
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {formatTimestamp(notif.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center'
              }}
            >
              <button
                onClick={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
