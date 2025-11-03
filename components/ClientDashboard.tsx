"use client";
import { useEffect, useState, useRef } from 'react';
import { ShiftChangeModal, SwapRequestModal } from './ShiftRequestsModals';
import StatCard from './Shared/StatCard';
import EmployeeSearch from './Shared/EmployeeSearch';
import MiniScheduleCalendar from './Shared/MiniScheduleCalendar';
import ShiftView from './ShiftView';
import NotificationPanel from './Shared/NotificationPanel';
import { LogOut, RefreshCw, Calendar as CalendarIcon, Edit3, ArrowLeftRight, Eye, Search as SearchIcon, CalendarDays, Umbrella, CheckCircle2 } from 'lucide-react';

/**
 * This is your backup ClientDashboard with ONLY the required additions:
 * 1. teamMembers state derived from the logged-in user's team (excluding self).
 * 2. Pass teamMembers into SwapRequestModal so the swap modal can list/select them.
 * 3. Provide headers & mySchedule to both modals (already present for ShiftChange; kept for Swap).
 * 4. No other layout / behavioral changes (stat cards remain for logged-in user only).
 */

interface ScheduleData {
  employee: { name:string; id:string; team:string };
  today: { date:string; shift:string };
  tomorrow: { date:string; shift:string };
  upcoming_work_days: any[];
  planned_time_off: any[];
  shift_changes: any[];
  summary: { next_work_days_count:number; planned_time_off_count:number; shift_changes_count:number };
  success: boolean;
}

interface RequestHistory {
  id:string;
  type:'shift_change'|'swap';
  status:string;
  date:string;
  created_at:string;
  reason:string;
  requested_shift?:string;
  current_shift?:string;
  requester_shift?:string;
  target_shift?:string;
  requester_name?:string;
  target_employee_name?:string;
}

interface TeamMember {
  id: string;
  name: string;
  schedule: string[];
}

interface Props {
  employeeId: string;
  fullName: string;
  onLogout: ()=>void;
}

type ViewMode = 'self' | 'other';

export default function ClientDashboard({employeeId, fullName, onLogout}:Props) {
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [baseData,setBaseData]=useState<ScheduleData|null>(null);
  const [roster,setRoster]=useState<any>(null);
  const [requests,setRequests]=useState<RequestHistory[]>([]);
  const [selectedDate,setSelectedDate]=useState<string>('');
  const [selectedShift,setSelectedShift]=useState<string>('');
  const [showChange,setShowChange]=useState(false);
  const [showSwap,setShowSwap]=useState(false);
  const [showShiftView,setShowShiftView]=useState(false);
  const [headers,setHeaders]=useState<string[]>([]);
  const [mySchedule,setMySchedule]=useState<string[]>([]);
  const [refreshing,setRefreshing]=useState(false);

  const [mode,setMode]=useState<ViewMode>('self');
  const [otherData,setOtherData]=useState<ScheduleData|null>(null);
  const [otherSchedule,setOtherSchedule]=useState<string[]>([]);
  const [approvedRequests,setApprovedRequests]=useState<RequestHistory[]>([]);
  const [showCalendar,setShowCalendar]=useState(false);
  const [rerenderKey,setRerenderKey]=useState(0);
  const lastActionRef = useRef<string>('');

  // NEW: team members (same team, excluding current user) for swap modal
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tenantInfo, setTenantInfo] = useState<{name: string; organization_name: string; logo_url?: string} | null>(null);

  async function loadTenantInfo() {
    try {
      const res = await fetch('/api/my-schedule/tenant-info');
      const data = await res.json();
      if (data.success && data.tenant) {
        setTenantInfo(data.tenant);
      }
    } catch(e) {
      console.error('[TenantInfo] load error', e);
    }
  }

  async function loadBaseSchedule() {
    console.debug('[Load] Base schedule for', employeeId);
    setLoading(true); setError('');
    try {
  const res = await fetch(`/api/my-schedule/${employeeId}`, { cache: 'no-store' });
      const j = await res.json();
      if (!res.ok || !j.success) {
        setError(j.error||'Error loading schedule'); 
        setLoading(false); 
        return;
      }
      setBaseData(j);
    } catch(e:any) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function loadRoster() {
    try {
      const res = await fetch('/api/admin/get-display-data', { cache: 'no-store' }).then(r=>r.json());
      setRoster(res);
      setHeaders(res.headers||[]);
      const teamEntry = Object.entries(res.teams||{}).find(([,list]:any)=> list.some((e:any)=> e.id===employeeId));
      if (teamEntry) {
        const employees = teamEntry[1] as any[];
        const mine = employees.find((e:any)=>e.id===employeeId);
        if (mine) {
          setMySchedule(mine.schedule);
        }
        // Populate team members for swap (exclude self)
        const tm: TeamMember[] = employees
          .filter((e:any)=> e.id !== employeeId)
          .map((e:any)=> ({
            id: e.id,
            name: e.name,
            schedule: Array.isArray(e.schedule) ? e.schedule : []
          }));
        setTeamMembers(tm);
      } else {
        setTeamMembers([]);
      }
    } catch(e) {
      console.error('[Roster] load error', e);
      setTeamMembers([]);
    }
  }

  async function loadRequests() {
    try {
      const res = await fetch('/api/schedule-requests/get-employee-requests',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({employeeId})
      }).then(r=>r.json());

      if (res.success) {
        const sorted = res.requests.sort((a:any,b:any)=> (b.created_at || '').localeCompare(a.created_at||''));
        setRequests(sorted);
        const approved = sorted.filter((r: RequestHistory) => r.status === 'approved');
        setApprovedRequests(approved);
      }
    } catch(e) {
      console.error('[Requests] load error', e);
    }
  }

  async function refreshAll() {
    console.debug('[RefreshAll] start');
    setRefreshing(true);
    await loadTenantInfo();
    await Promise.all([loadBaseSchedule(), loadRoster(), loadRequests()]);
    setRefreshing(false);
    console.debug('[RefreshAll] done');
  }

  useEffect(()=>{ refreshAll(); },[employeeId]);

  function onCalendarSelect(date:string, shift:string) {
    setSelectedDate(date);
    setSelectedShift(shift);
  }

  function myShiftForDate(date:string) {
    const idx = headers.indexOf(date);
    if (idx === -1) return '';
    return mySchedule[idx] || '';
  }

  const handleEmployeeSearch = async (employee: any) => {
    if (!employee) return;
    if (employee.id === employeeId) {
      console.debug('[Search] Selected self -> resetting.');
      resetToMySchedule();
      return;
    }
    lastActionRef.current = `search:${employee.id}`;
    console.debug('[Search] Loading other employee:', employee.id);
    try {
      const res = await fetch(`/api/my-schedule/${employee.id}`);
      const j = await res.json();
      if (j.success) {
        setOtherData(j);
        setMode('other');
        if (roster?.teams) {
          for (const [, group] of Object.entries(roster.teams)) {
            const emp = (group as any[]).find(e=>e.id===employee.id);
            if (emp) {
              setOtherSchedule(emp.schedule);
              break;
            }
          }
        }
        setSelectedDate('');
        setSelectedShift('');
        setShowCalendar(false);
        console.debug('[Search] Now in OTHER mode');
      }
    } catch(e) {
      console.error('[Search] error loading other employee', e);
    }
  };

  const resetToMySchedule = () => {
    console.debug('[Reset] Back to MY schedule (mode self)');
    lastActionRef.current = 'reset';
    setMode('self');
    setOtherData(null);
    setOtherSchedule([]);
    setSelectedDate('');
    setSelectedShift('');
    setShowCalendar(false);
    setRerenderKey(k=>k+1);
    refreshAll();
  };

  useEffect(()=>{
    if (mode === 'other' && !otherData) {
      console.debug('[Guard] mode other but no otherData -> switching to self');
      setMode('self');
    }
  },[mode, otherData]);

  const isOther = mode === 'other' && !!otherData;
  const activeData = isOther && otherData ? otherData : baseData;
  const activeToday = isOther && otherData ? otherData.today : baseData?.today;
  const activeTomorrow = isOther && otherData ? otherData.tomorrow : baseData?.tomorrow;
  const activeScheduleArray = isOther ? otherSchedule : mySchedule;

  // Format date string to be more readable (e.g., "1November" -> "1 Nov")
  const formatDate = (dateStr: string) => {
    const match = dateStr.match(/^(\d+)([A-Za-z]+)$/);
    if (match) {
      const day = match[1];
      const month = match[2];
      const monthAbbr = month.substring(0, 3);
      return `${day} ${monthAbbr}`;
    }
    return dateStr;
  };

  const getShiftChangeForDate = (date: string) => {
    if (!approvedRequests.length) return null;
    return approvedRequests.find(r => r.date === date && r.status === 'approved') || null;
  };

  const getAllEmployees = () => {
    if (!roster?.teams) return [];
    const employees: any[] = [];
    Object.entries(roster.teams).forEach(([teamName, teamEmployees]: [string, any]) => {
      (teamEmployees as any[]).forEach((emp: any) => {
        employees.push({ id: emp.id, name: emp.name, team: teamName });
      });
    });
    return employees;
  };

  return (
    <div className="container" data-view-mode={mode} style={{background: '#f5f7fa', minHeight: '100vh'}}>
      {/* Static Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            {tenantInfo?.logo_url && (
              <img src={tenantInfo.logo_url} alt={tenantInfo.organization_name} style={{width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px'}} />
            )}
            <div>
              <h1 style={{margin: 0, fontSize: '20px', fontWeight: 700, color: '#111827'}}>
                {tenantInfo?.organization_name || 'Employee Portal'}
              </h1>
              <p style={{margin: 0, fontSize: '13px', color: '#6b7280'}}>Schedule Management</p>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{textAlign: 'right', marginRight: '8px'}}>
              <div style={{fontSize: '14px', fontWeight: 600, color: '#111827'}}>{fullName}</div>
              <div style={{fontSize: '12px', color: '#6b7280'}}>ID: {employeeId}</div>
            </div>
            <NotificationPanel employeeId={employeeId} />
            <button onClick={refreshAll} disabled={refreshing} style={{padding: '8px 12px', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: refreshing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#374151'}}>
              <RefreshCw size={16} style={{animation: refreshing ? 'spin 1s linear infinite' : 'none'}} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={onLogout} style={{padding: '8px 16px', background: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#fff', fontWeight: 500}}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>
      <div className="app-container" style={{maxWidth: '1400px', margin: '0 auto', padding: '24px', position: 'relative', zIndex: 1}} key={rerenderKey}>
        <div className="app-header" style={{display: 'none'}}>
          <div>
            <h2>Shift Dashboard</h2>
            <div className="user-info" style={{display:'flex', flexDirection:'column', gap:6}}>
              <span>Welcome, <strong>{fullName}</strong> ({employeeId})</span>
              <div className="user-actions" style={{display:'flex', gap:10, flexWrap:'wrap'}}>
                <button className="logout-btn" onClick={onLogout} style={{display: 'none'}}>Logout</button>
                <button className="btn small" onClick={refreshAll} disabled={refreshing} style={{display:'inline-flex', alignItems:'center', gap:6}}>
                  {refreshing ? 'Refreshing...' : (<><RefreshCw size={14} /> Refresh</>)}
                </button>
                {isOther && (
                  <button
                    className="btn small"
                    onClick={resetToMySchedule}
                    style={{background:'#0d3d74'}}
                  >
                    ← Back to My Schedule
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="sync-controls">
            <div className="sync-status">
              {loading? 'Loading schedule...' : 'Schedule Loaded'}
            </div>
            <div style={{fontSize:'.55rem', letterSpacing:'.8px', textTransform:'uppercase', color:'#6E8298'}}>
              Select a date below to request a change or swap
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {!loading && activeData &&
          <>
            {/* Today & Tomorrow Cards - Side by Side */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px'}}>
              {/* Today's Shift Card */}
              <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{fontSize: '13px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px'}}>
                  Today&apos;s Shift
                </div>
                <div style={{fontSize: '12px', color: '#9ca3af', marginBottom: '8px'}}>
                  {activeToday?.date || 'N/A'}
                </div>
                <div style={{fontSize: '32px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em'}}>
                  {(() => {
                    const todayDate = activeToday?.date;
                    const todayShift = activeToday?.shift;
                    const change = !isOther && todayDate ? getShiftChangeForDate(todayDate) : null;
                    if (change) {
                      return (
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                          <span style={{textDecoration: 'line-through', color: '#9ca3af', fontSize: '24px'}}>{change.current_shift || change.requester_shift}</span>
                          <span>→</span>
                          <span style={{color: '#10b981'}}>{todayShift}</span>
                        </div>
                      );
                    }
                    return todayShift || 'N/A';
                  })()}
                </div>
              </div>

              {/* Tomorrow's Shift Card */}
              <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}>
                <div style={{fontSize: '13px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px'}}>
                  Tomorrow&apos;s Shift
                </div>
                <div style={{fontSize: '12px', color: '#9ca3af', marginBottom: '8px'}}>
                  {activeTomorrow?.date || 'N/A'}
                </div>
                <div style={{fontSize: '32px', fontWeight: 700, color: '#111827', letterSpacing: '-0.02em'}}>
                  {(() => {
                    const tomorrowDate = activeTomorrow?.date;
                    const tomorrowShift = activeTomorrow?.shift;
                    const change = !isOther && tomorrowDate ? getShiftChangeForDate(tomorrowDate) : null;
                    if (change) {
                      return (
                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                          <span style={{textDecoration: 'line-through', color: '#9ca3af', fontSize: '24px'}}>{change.current_shift || change.requester_shift}</span>
                          <span>→</span>
                          <span style={{color: '#10b981'}}>{tomorrowShift}</span>
                        </div>
                      );
                    }
                    return tomorrowShift || 'N/A';
                  })()}
                </div>
              </div>
            </div>

            {/* Calendar and Actions Section */}
            <div style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              marginBottom: '24px'
            }}>
              {selectedDate && (
                <div style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '6px'}}>Selected Date</div>
                  <div style={{fontSize: '18px', fontWeight: 600, color: '#111827'}}>{formatDate(selectedDate)}</div>
                  <div style={{fontSize: '24px', fontWeight: 700, color: '#3b82f6', marginTop: '4px'}}>{selectedShift || 'N/A'}</div>
                  
                  {mode === 'self' && (
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '12px'
                    }}>
                      <button
                        onClick={() => setShowChange(true)}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: '#10b981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Edit3 size={14} /> Request Change
                      </button>
                      <button
                        onClick={() => setShowSwap(true)}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: '#3b82f6',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <ArrowLeftRight size={14} /> Request Swap
                      </button>
                    </div>
                  )}
                </div>
              )}

              {headers.length > 0 && (
                <div>
                  <div>
                    <button 
                      onClick={() => setShowCalendar(!showCalendar)}
                      style={{
                        padding: '10px 20px',
                        background: showCalendar ? '#3b82f6' : '#f3f4f6',
                        color: showCalendar ? '#fff' : '#374151',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        width: '100%'
                      }}
                    >
                      <CalendarIcon size={16} /> {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
                    </button>
                  </div>
                  {showCalendar && activeScheduleArray.length > 0 && (
                    <div style={{marginTop: '16px'}}>
                      <MiniScheduleCalendar 
                        headers={headers}
                        schedule={activeScheduleArray}
                        selectedDate={selectedDate}
                        onSelect={(d,s)=>onCalendarSelect(d,s)}
                      />
                    </div>
                  )}
                  {showCalendar && activeScheduleArray.length === 0 && (
                    <div style={{
                      padding: '20px',
                      textAlign: 'center',
                      color: '#6b7280',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      marginTop: '16px'
                    }}>
                      No schedule data available. Please contact your administrator.
                    </div>
                  )}
                </div>
              )}

              {mode === 'self' && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  <button 
                    onClick={()=>setShowShiftView(true)}
                    style={{
                      padding: '12px 20px',
                      background: '#6b7280',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Eye size={16} /> View All Shifts
                  </button>
                </div>
              )}
            </div>

            {/* Employee Search Section */}
            {roster && getAllEmployees().length > 0 && (
              <div style={{
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                marginBottom: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#111827',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <SearchIcon size={18} /> Search Other Employees
                </h3>
                <EmployeeSearch 
                  employees={getAllEmployees()}
                  onSelect={handleEmployeeSearch}
                  placeholder="Search employees by name, ID, or team..."
                />
              </div>
            )}

            {/* Stats Section */}
            {baseData && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <StatCard
                  icon={<CalendarDays size={18} />}
                  value={baseData.summary.next_work_days_count}
                  label="Upcoming Days"
                  subtitle="Next 7 view"
                  details={baseData.upcoming_work_days}
                  detailsType="workdays"
                />
                <StatCard
                  icon={<Umbrella size={18} />}
                  value={baseData.summary.planned_time_off_count}
                  label="Planned Time Off"
                  subtitle="30 days span"
                  details={baseData.planned_time_off}
                  detailsType="timeoff"
                />
                <StatCard
                  icon={<RefreshCw size={18} />}
                  value={baseData.summary.shift_changes_count}
                  label="Shift Changes"
                  subtitle="Vs original"
                  details={baseData.shift_changes}
                  detailsType="changes"
                />
                {approvedRequests.length > 0 && (
                  <StatCard
                    icon={<CheckCircle2 size={18} />}
                    value={approvedRequests.length}
                    label="Approved Shifts"
                    subtitle="Approved requests"
                    details={approvedRequests.map(r => ({
                      date: r.date,
                      type: r.type,
                      original_shift: r.current_shift || r.requester_shift || 'N/A',
                      current_shift: r.requested_shift || r.target_shift || 'N/A'
                    }))}
                    detailsType="changes"
                  />
                )}
              </div>
            )}
          </>
        }
      </div>

      {baseData &&
        <ShiftChangeModal
          open={showChange}
          onClose={()=>setShowChange(false)}
          employeeId={employeeId}
          employeeName={baseData.employee.name}
          team={baseData.employee.team}
          date={selectedDate}
          currentShift={myShiftForDate(selectedDate)}
          headers={headers}
          mySchedule={mySchedule}
          onSubmitted={()=>{ loadRequests(); }}
        />
      }

      {baseData &&
        <SwapRequestModal
          open={showSwap}
          onClose={()=>setShowSwap(false)}
          requesterId={employeeId}
          requesterName={baseData.employee.name}
          team={baseData.employee.team}
          date={selectedDate}
          requesterShift={myShiftForDate(selectedDate)}
          headers={headers}
          mySchedule={mySchedule}
          teamMembers={teamMembers}   // NEW: populated list
          onSubmitted={()=>{ loadRequests(); }}
        />
      }

      {roster && (
        <ShiftView
          open={showShiftView}
          onClose={()=>setShowShiftView(false)}
          roster={roster}
          headers={headers}
        />
      )}
      
      <div style={{position: 'fixed', bottom: '12px', left: '12px', fontSize: '0.75rem', color: '#9ca3af', zIndex: 1}}>
        Developed by Aether Bangladesh
      </div>
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}