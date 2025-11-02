"use client";
import { useState, useEffect, useMemo } from 'react';
import { Edit, BarChart3 } from 'lucide-react';
import MonthCompactCalendar from '../Shared/MonthCompactCalendar';
import GoogleSheetsRosterModal from '../Shared/GoogleSheetsRosterModal';
import AdminRosterDataModal from '../Shared/AdminRosterDataModal';
import { SHIFT_MAP } from '@/lib/constants';

interface Props { id: string; }

export default function RosterDataTab({id}:Props) {
  const [adminData,setAdminData]=useState<any>(null);
  const [googleData,setGoogleData]=useState<any>(null);
  const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [shiftDefinitions, setShiftDefinitions] = useState<Record<string, string>>(SHIFT_MAP);
  
  // Shift view states (inline, not modal)
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  
  // Edit state
  const [editingShift, setEditingShift] = useState<{empId: string; empName: string; dateIndex: number} | null>(null);
  const [editShiftValue, setEditShiftValue] = useState('');
  
  // Google Sheets Roster Modal state
  const [showGoogleSheetsModal, setShowGoogleSheetsModal] = useState(false);
  
  // Admin Roster Data Modal state
  const [showAdminRosterModal, setShowAdminRosterModal] = useState(false);

  async function load() {
    setLoading(true);
    // Also reload shift definitions when loading data
    await loadShiftDefinitions();
    
    const aRes = await fetch('/api/admin/get-admin-data');
    const gRes = await fetch('/api/admin/get-google-data');
    if (aRes.ok) {
      const adminJson = await aRes.json();
      console.log('[RosterDataTab] Admin data loaded:', {
        hasTeams: !!adminJson.teams,
        teamCount: adminJson.teams ? Object.keys(adminJson.teams).length : 0,
        hasHeaders: !!adminJson.headers,
        headerCount: adminJson.headers ? adminJson.headers.length : 0,
        headers: adminJson.headers
      });
      setAdminData(adminJson);
    } else {
      console.error('[RosterDataTab] Failed to load admin data:', aRes.status);
    }
    if (gRes.ok) {
      const googleJson = await gRes.json();
      console.log('[RosterDataTab] Google data loaded:', {
        hasTeams: !!googleJson.teams,
        teamCount: googleJson.teams ? Object.keys(googleJson.teams).length : 0,
        hasHeaders: !!googleJson.headers,
        headerCount: googleJson.headers ? googleJson.headers.length : 0
      });
      setGoogleData(googleJson);
    } else {
      console.error('[RosterDataTab] Failed to load Google data:', gRes.status);
    }
    setLoading(false);
  }
  
  async function loadShiftDefinitions() {
    try {
      const res = await fetch('/api/admin/shift-definitions');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.shiftDefinitions) {
          setShiftDefinitions(data.shiftDefinitions);
        }
      }
    } catch (error) {
      console.error('Failed to load shift definitions:', error);
    }
  }
  
  useEffect(() => { 
    load();
    loadShiftDefinitions();
    
    // Reload shift definitions when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadShiftDefinitions();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also reload when window gets focus (switching back to browser)
    window.addEventListener('focus', loadShiftDefinitions);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', loadShiftDefinitions);
    };
  }, []);

  // Choose a safe initial header so the page never shows empty
  function pickInitialHeader(headers: string[]): string {
    if (!headers || headers.length === 0) return '';
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const now = new Date();
    const todayHeader = `${now.getDate()}${monthNames[now.getMonth()]}`; // matches MonthCompactCalendar keys

    // Prefer today's date if present
    if (headers.includes(todayHeader)) return todayHeader;

    // Otherwise any date in the current month
    const monthKey = monthNames[now.getMonth()].toLowerCase();
    const sameMonth = headers.find(h => h.toLowerCase().endsWith(monthKey));
    if (sameMonth) return sameMonth;

    // Fallback: the first header
    return headers[0];
  }

  // Initialize selectedDate when data arrives (prevents "all data gone" state)
  useEffect(() => {
    if (adminData?.headers?.length && !selectedDate) {
      setSelectedDate(pickInitialHeader(adminData.headers));
    }
  }, [adminData, selectedDate]);

  async function updateShift(employeeId:string,dateIndex:number,newShift:string) {
    setSaving(true);
    const original = findGoogleShift(employeeId,dateIndex);
    const res = await fetch('/api/admin/update-shift',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({employeeId,dateIndex,newShift,googleShift:original})
    }).then(r=>r.json());
    setSaving(false);
    if (!res.success) alert(res.error||'Update failed');
    else {
      // Close edit mode and reload
      setEditingShift(null);
      setEditShiftValue('');
    }
    load();
  }

  function findGoogleShift(employeeId:string, dateIndex:number) {
    if (!googleData?.teams) return '';
    for (const t of Object.keys(googleData.teams)) {
      const emp = googleData.teams[t].find((e:any)=>e.id===employeeId);
      if (emp) return emp.schedule[dateIndex] || '';
    }
    return '';
  }

  // Shift view constants and helpers - use tenant shift definitions
  const allShiftCodes = useMemo(() => {
    return Object.keys(shiftDefinitions).filter(code => code !== '');
  }, [shiftDefinitions]);
  
  const baseShiftCodes = useMemo(() => {
    // Default morning shifts or first 3 from tenant definitions
    const defaults = ['M2','M3','M4'];
    return defaults.filter(code => allShiftCodes.includes(code)).length > 0 
      ? defaults.filter(code => allShiftCodes.includes(code))
      : allShiftCodes.slice(0, 3);
  }, [allShiftCodes]);
  
  const eveningGroup = useMemo(() => {
    const defaults = ['D1','D2'];
    return defaults.filter(code => allShiftCodes.includes(code));
  }, [allShiftCodes]);
  
  const offGroup = useMemo(() => {
    const defaults = ['DO','SL','CL','EL','HL'];
    return defaults.filter(code => allShiftCodes.includes(code));
  }, [allShiftCodes]);

  const teamList: string[] = useMemo(
    () => (adminData?.teams ? Object.keys(adminData.teams) : []),
    [adminData]
  );

  function displayShift(code: string): string {
    if (!code || code === 'N/A' || code === 'Empty') return 'N/A';
    // If shift is not defined, show as deprecated/unknown
    if (!shiftDefinitions[code]) {
      console.log(`[displayShift] Code "${code}" not found in definitions:`, Object.keys(shiftDefinitions));
      return `${code} (Deleted Shift)`;
    }
    return shiftDefinitions[code] || code;
  }

  function codeMatchesFilters(rawShift:string) {
    if (!selectedShifts.length) return true;
    if (selectedShifts.includes(rawShift)) return true;
    if (selectedShifts.includes('EVENING') && eveningGroup.includes(rawShift)) return true;
    if (selectedShifts.includes('OFF') && offGroup.includes(rawShift)) return true;
    return false;
  }

  const toggle = (arr:string[], val:string, setter:(v:string[])=>void) => {
    setter(arr.includes(val) ? arr.filter(v=>v!==val) : [...arr,val]);
  };

  function toggleShift(val:string) {
    toggle(selectedShifts, val, setSelectedShifts);
  }

  function toggleTeam(team:string) {
    toggle(selectedTeams, team, setSelectedTeams);
  }

  const filteredEmployees = useMemo(()=>{
    if (!selectedDate || !adminData?.teams) return [];
    const dateIndex = adminData.headers.indexOf(selectedDate);
    if (dateIndex === -1) return [];
    const out:any[] = [];
    Object.entries(adminData.teams).forEach(([teamName, emps]:[string, any])=>{
      if (selectedTeams.length && !selectedTeams.includes(teamName)) return;
      (emps as any[]).forEach(emp=>{
        const rawShift = emp.schedule[dateIndex] || '';
        if (!codeMatchesFilters(rawShift)) return;
        out.push({
          name: emp.name,
          id: emp.id,
          team: teamName,
          shift: rawShift || 'N/A',
          dateIndex
        });
      });
    });
    return out;
  },[selectedDate, adminData, selectedShifts, selectedTeams]);

  const shiftStats = useMemo(()=>{
    const counts: Record<string,number> = {};
    filteredEmployees.forEach(emp=>{
      const k = !emp.shift || emp.shift === 'N/A' ? 'Empty' : emp.shift;
      counts[k] = (counts[k]||0)+1;
    });
    return counts;
  },[filteredEmployees]);

  function handleEmployeeShiftClick(emp: any) {
    // Start editing this employee's shift
    setEditingShift({
      empId: emp.id,
      empName: emp.name,
      dateIndex: emp.dateIndex
    });
    setEditShiftValue(emp.shift === 'N/A' ? '' : emp.shift);
  }

  function cancelEdit() {
    setEditingShift(null);
    setEditShiftValue('');
  }

  function saveEdit() {
    if (editingShift) {
      updateShift(editingShift.empId, editingShift.dateIndex, editShiftValue.toUpperCase().trim());
    }
  }

  return (
    <div id={id} className="roster-data-root">
      <h2 className="rd-title">Roster Data</h2>
      <p className="rd-sub">
        View and manage roster data. Click on any employee shift to edit it.
      </p>

      <div className="rd-bar">
        <div className="rd-bar-actions">
          <button className="rd-btn refresh" onClick={load} disabled={loading || saving}>
            {loading ? 'Loading…' : saving ? 'Saving…' : 'Refresh'}
          </button>
          <button 
            className="rd-btn google-sheets" 
            onClick={() => setShowGoogleSheetsModal(true)} 
            disabled={loading || !googleData}
          >
            <BarChart3 size={16} style={{display:'inline', marginRight:6}} />
            Google Sheets Roster
          </button>
                    <button 
            className="roster-data-main-btn" 
            onClick={() => setShowAdminRosterModal(true)} 
            disabled={loading || !adminData}
            style={{display:'flex', alignItems:'center', gap:8, justifyContent:'center'}}
          >
            <Edit size={18} />
            Admin Roster Data
          </button>
        </div>
      </div>

      {(loading) && <div className="loading-box">Loading data…</div>}

      {!loading && adminData && (!adminData.headers || adminData.headers.length === 0) && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: '#fef3c7',
          border: '2px solid #fcd34d',
          borderRadius: '12px',
          margin: '20px 0'
        }}>
          <h3 style={{fontSize: '20px', fontWeight: 600, color: '#92400e', marginBottom: '12px'}}>
            📋 No Roster Data Yet
          </h3>
          <p style={{color: '#78350f', marginBottom: '16px', fontSize: '15px'}}>
            Your tenant doesn&apos;t have any roster data. Create a template to get started!
          </p>
          <div style={{display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px'}}>
            <a href="#template-creator" style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 500
            }}>
              Go to Template Creator
            </a>
            <a href="#csv-import" style={{
              padding: '12px 24px',
              background: '#10b981',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 500
            }}>
              Import CSV Instead
            </a>
          </div>
        </div>
      )}

      {!loading && adminData && adminData.headers && adminData.headers.length > 0 && (
        <div className="rd-shift-view-container">
          <div className="sv-body-inline">
            <div className="sv-calendar-col">
              <div className="sv-section-label">Select Date from Calendar (5 Years Range)</div>
              <MonthCompactCalendar
                headers={adminData.headers || []}
                selectedDate={selectedDate}
                onSelect={(d)=> setSelectedDate(d)}
                showWeekdays
                showNavigation
                allowDynamicDates={true}
              />
            </div>
            
            <div className="sv-content-col">
              {/* SHIFT FILTERS */}
              <div className="sv-filter-block">
                <div className="sv-filter-title">SHIFT FILTERS (MULTI-SELECT)</div>
                <div className="sv-chip-row">
                  {baseShiftCodes.map(code=>(
                    <button
                      key={code}
                      className={`sv-chip ${selectedShifts.includes(code)?'active':''}`}
                      onClick={()=>toggleShift(code)}
                      title={`${code} = ${displayShift(code)}`}
                    >
                      {code} ({displayShift(code)})
                    </button>
                  ))}
                  <button
                    className={`sv-chip ${selectedShifts.includes('EVENING')?'active':''}`}
                    onClick={()=>toggleShift('EVENING')}
                    title={`Evening includes: ${eveningGroup.join(', ')}`}
                  >
                    Evening (D1/D2)
                  </button>
                  <button
                    className={`sv-chip ${selectedShifts.includes('OFF')?'active':''}`}
                    onClick={()=>toggleShift('OFF')}
                    title={`Off includes: ${offGroup.join(', ')}`}
                  >
                    Off
                  </button>
                  <button
                    className="sv-chip clear"
                    onClick={()=>setSelectedShifts([])}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* TEAM FILTERS */}
              <div className="sv-filter-block">
                <div className="sv-filter-title">TEAM FILTERS (MULTI-SELECT)</div>
                <div className="sv-chip-row">
                  {teamList.map(team=>(
                    <button
                      key={team}
                      className={`sv-chip ${selectedTeams.includes(team)?'active':''}`}
                      onClick={()=>toggleTeam(team)}
                    >{team}</button>
                  ))}
                  <button
                    className="sv-chip clear"
                    onClick={()=>setSelectedTeams([])}
                  >Clear</button>
                </div>
              </div>

              <div style={{marginTop:6}}>
                <button
                  className="btn"
                  style={{fontSize:'.85rem', padding:'9px 22px'}}
                  onClick={()=>{
                    // Keep selectedDate as-is so the page doesn't go blank
                    setSelectedShifts([]);
                    setSelectedTeams([]);
                  }}
                >Reset Filters (keep date)</button>
              </div>

              <div className="sv-results">
                <h4 className="sv-subtitle">
                  {selectedDate ? `Employees for ${selectedDate}` : 'Select a date to view employees'}
                </h4>
                {selectedDate && filteredEmployees.length === 0 && (
                  <div className="sv-empty">No employees match the current filters.</div>
                )}
                {selectedDate && filteredEmployees.length > 0 && (
                  <div className="sv-employee-grid">
                    {filteredEmployees.map(emp => {
                      const isDeletedShift = emp.shift && emp.shift !== 'N/A' && emp.shift !== 'Empty' && !shiftDefinitions[emp.shift];
                      return (
                        <div
                          key={emp.id}
                          className={`sv-emp-card ${isDeletedShift ? 'deleted-shift' : ''}`}
                          onClick={() => handleEmployeeShiftClick(emp)}
                          title={isDeletedShift ? "Shift code deleted - click to update" : "Click to edit shift"}
                        >
                          <div className="sv-emp-name">{emp.name}</div>
                          <div className="sv-emp-meta">{emp.id} • {emp.team}</div>
                          <div className="sv-emp-shift">
                            {displayShift(emp.shift)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedDate && Object.keys(shiftStats).length > 0 && (
                <div className="sv-stats">
                  <h4 className="sv-subtitle">Shift Stats</h4>
                  <div className="sv-stats-row">
                    {Object.entries(shiftStats).map(([code,count])=>{
                      const label = code === 'Empty' ? 'N/A' : displayShift(code);
                      return (
                        <div
                          key={code}
                          className="sv-stat-pill"
                          title={code === 'Empty' ? 'No Shift Code' : `${code} → ${label}`}
                        >
                          <span className="sv-stat-key">
                            {label}
                          </span>
                          <span className="sv-stat-val">{count}</span>
                        </div>
                      );
                    })}
                    <div className="sv-stat-pill total">
                      <span className="sv-stat-key">Total</span>
                      <span className="sv-stat-val">{filteredEmployees.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Shift Modal */}
      {editingShift && (
        <div className="edit-modal-overlay" onClick={cancelEdit}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Edit Shift</h3>
              <button className="close-btn" onClick={cancelEdit}>✕</button>
            </div>
            <div className="edit-modal-body">
              <div className="edit-info">
                <p><strong>Employee:</strong> {editingShift.empName} ({editingShift.empId})</p>
                <p><strong>Date:</strong> {adminData.headers[editingShift.dateIndex]}</p>
              </div>
              <div className="edit-form-group">
                <label>Select Shift</label>
                <select 
                  value={editShiftValue} 
                  onChange={(e) => setEditShiftValue(e.target.value)}
                  autoFocus
                >
                  <option value="">(blank)</option>
                  {allShiftCodes.map(c => (
                    <option key={c} value={c}>{c} ({displayShift(c)})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="edit-modal-footer">
              <button 
                className="btn primary" 
                onClick={saveEdit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button 
                className="btn" 
                onClick={cancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Roster Modal */}
      {googleData && (
        <GoogleSheetsRosterModal
          open={showGoogleSheetsModal}
          onClose={() => setShowGoogleSheetsModal(false)}
          headers={googleData.headers || []}
          teams={googleData.teams || {}}
          shiftDefinitions={shiftDefinitions}
        />
      )}

      {/* Admin Roster Data Modal — pass selectedDate so it opens on the same month */}
      {adminData && (
        <AdminRosterDataModal
          open={showAdminRosterModal}
          onClose={() => {
            setShowAdminRosterModal(false);
            load(); // Reload data when modal closes
          }}
          headers={adminData.headers || []}
          teams={adminData.teams || {}}
          selectedDate={selectedDate}
          shiftDefinitions={shiftDefinitions}
          onUpdateShift={async (employeeId, dateIndex, newShift) => {
            const original = findGoogleShift(employeeId, dateIndex);
            const res = await fetch('/api/admin/update-shift',{
              method:'POST',
              headers:{'Content-Type':'application/json'},
              body:JSON.stringify({employeeId, dateIndex, newShift, googleShift:original})
            }).then(r=>r.json());
            if (!res.success) {
              throw new Error(res.error || 'Update failed');
            }
          }}
        />
      )}

      <style jsx>{`
        .roster-data-root {
          --panel:#FFFFFF;
          --panel-alt:#F4F6F8;
          --border:#E5E7EB;
          --accent:#4F46E5;
          --accent-hover:#4338CA;
          --green:#10B981;
          --green-hover:#059669;
          --danger:#EF4444;
          --text:#000000;
          --text-dim:#374151;
          color:var(--text);
        }
        .rd-title { margin:0 0 6px; font-size:1.35rem; font-weight:600; letter-spacing:.4px; }
        .rd-sub { margin:0 0 18px; font-size:.72rem; letter-spacing:.3px; color:var(--text-dim); }

        .rd-bar {
          background:var(--panel);
          border:1px solid var(--border);
          padding:12px 16px;
          border-radius:12px;
          display:flex;
          align-items:center;
          justify-content:flex-end;
          gap:18px;
          margin-bottom:14px;
        }
        .rd-bar-actions { display:flex; gap:10px; }

        .rd-btn {
          background:var(--accent);
          border:1px solid var(--primary);
          color:var(--text);
          padding:8px 15px;
          font-size:.65rem;
          border-radius:7px;
          cursor:pointer;
          font-weight:600;
          letter-spacing:.5px;
          transition:.18s;
        }
        .rd-btn:hover { background:var(--accent-hover); }
        .rd-btn.nav { background:var(--primary); border-color:var(--primary); }
        .rd-btn.nav:hover { background:var(--primary-hover); }
        .rd-btn.refresh { background:var(--green); border-color:var(--green); }
        .rd-btn.refresh:hover { background:var(--green-hover); }
        .rd-btn.google-sheets { background:var(--primary); border-color:var(--primary); }
        .rd-btn.google-sheets:hover { background:var(--accent-hover); }
        .rd-btn.reset { background:var(--danger); border-color:var(--danger); }
        .rd-btn.reset:hover { background:var(--danger); }
        .rd-btn:disabled { opacity:.55; cursor:not-allowed; }

        .loading-box {
          background:var(--panel);
          border:1px solid var(--border);
          padding:12px 14px;
          border-radius:10px;
          font-size:.7rem;
          color:var(--text-dim);
        }

        .rd-shift-view-container {
          background:var(--panel);
          border:1px solid var(--border);
          border-radius:14px;
          padding:20px;
        }

        .sv-body-inline {
          display:flex;
          gap:40px;
        }

        .sv-calendar-col {
          flex:0 0 300px;
          display:flex;
          flex-direction:column;
          gap:16px;
        }

        .sv-section-label {
          font-size:.8rem;
          letter-spacing:1px;
          color:var(--text-dim);
          font-weight:600;
        }

        .sv-content-col {
          flex:1;
          min-width:0;
          display:flex;
          flex-direction:column;
        }

        .sv-filter-block { margin-bottom:20px; }
        .sv-filter-title {
          font-size:.72rem;
          letter-spacing:1px;
          color:var(--text-dim);
          margin-bottom:10px;
          font-weight:700;
        }
        .sv-chip-row { display:flex; flex-wrap:wrap; gap:10px; }
        .sv-chip {
          padding:8px 16px;
          font-size:.75rem;
          border-radius:24px;
          background:var(--panel-alt);
          border:1px solid var(--border);
          color:var(--text);
          cursor:pointer;
          transition:.18s;
          font-weight:500;
        }
        .sv-chip.active {
          background:var(--primary);
          border-color:var(--primary);
          color:#fff;
          box-shadow:0 0 0 2px rgba(94,148,209,.28);
        }
        .sv-chip.clear {
          background:transparent;
          border:1px dashed var(--border);
          color:var(--text-dim);
        }
        .sv-chip.clear:hover { border-color:var(--primary); color:var(--text); }

        .sv-results { margin-top:4px; }
        .sv-subtitle {
          margin:0 0 14px 0;
          font-size:1rem;
          letter-spacing:.6px;
          color:var(--text);
          font-weight:600;
        }
        .sv-empty {
          background:var(--panel-alt);
          border:1px solid var(--border);
          padding:18px;
          border-radius:12px;
          font-size:.8rem;
          color:var(--text-dim);
        }
        .sv-employee-grid {
          display:grid;
          gap:18px 20px;
          grid-template-columns:repeat(auto-fill,minmax(250px,1fr));
        }
        .sv-emp-card {
          background:var(--panel);
          border:1px solid var(--border);
          border-radius:14px;
          padding:14px 16px 16px;
          display:flex;
          flex-direction:column;
          gap:8px;
          transition:.18s;
          cursor:pointer;
        }
        .sv-emp-card:hover {
          background:var(--panel-alt);
          border-color:var(--border);
          box-shadow:0 2px 8px rgba(0,0,0,.3);
        }
        .sv-emp-card.deleted-shift {
          background:#fef3c7;
          border:2px solid #fbbf24;
        }
        .sv-emp-card.deleted-shift:hover {
          background:#fde68a;
          border-color:#f59e0b;
        }
        .sv-emp-card.deleted-shift .sv-emp-shift {
          background:#b45309;
        }
        .sv-emp-name { font-size:.95rem; font-weight:600; color:var(--text); }
        .sv-emp-meta { font-size:.7rem; color:var(--text-dim); letter-spacing:.3px; }
        .sv-emp-shift {
          align-self:flex-start;
          background:var(--primary);
          padding:5px 12px;
          font-size:.7rem;
          border-radius:18px;
          letter-spacing:.6px;
          font-weight:600;
          color:#fff;
        }

        .sv-stats { margin-top:26px; }
        .sv-stats-row { display:flex; flex-wrap:wrap; gap:12px; }
        .sv-stat-pill {
          background:var(--panel-alt);
          border:1px solid var(--border);
          border-radius:12px;
          padding:10px 14px;
          display:flex;
          align-items:center;
          gap:12px;
          font-size:.75rem;
        }
        .sv-stat-pill.total {
          background:var(--panel-alt);
          border:1px dashed var(--border);
        }
        .sv-stat-key {
          background:var(--primary);
          padding:4px 10px;
          border-radius:14px;
          font-size:.65rem;
          letter-spacing:.5px;
          color:#fff;
          font-weight:600;
        }
        .sv-stat-val { font-weight:700; font-size:.85rem; color:var(--text); }

        /* Edit Modal Styles */
        .edit-modal-overlay {
          position:fixed;
          inset:0;
          background:rgba(0,0,0,.6);
          backdrop-filter:blur(4px);
          display:flex;
          align-items:center;
          justify-content:center;
          z-index:9999;
        }
        .edit-modal {
          background:var(--panel);
          border:1px solid var(--border);
          border-radius:12px;
          width:90%;
          max-width:500px;
          box-shadow:0 8px 32px rgba(0,0,0,.7);
        }
        .edit-modal-header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:16px 20px;
          border-bottom:1px solid var(--border);
        }
        .edit-modal-header h3 {
          margin:0;
          font-size:1.1rem;
          color:var(--text);
          font-weight:600;
        }
        .close-btn {
          background:var(--panel-alt);
          border:1px solid var(--border);
          color:var(--text);
          padding:4px 10px;
          font-size:.9rem;
          border-radius:6px;
          cursor:pointer;
        }
        .close-btn:hover { background:var(--panel-alt); }
        
        .edit-modal-body {
          padding:20px;
        }
        .edit-info {
          margin-bottom:16px;
          font-size:.85rem;
          color:var(--text);
        }
        .edit-info p {
          margin:6px 0;
        }
        .edit-form-group {
          display:flex;
          flex-direction:column;
          gap:8px;
        }
        .edit-form-group label {
          font-size:.75rem;
          letter-spacing:.5px;
          color:var(--text-dim);
          font-weight:600;
        }
        .edit-form-group select {
          background:var(--bg);
          border:1px solid var(--border);
          color:var(--text);
          border-radius:8px;
          padding:10px 12px;
          font-size:.85rem;
          outline:none;
          cursor:pointer;
        }
        .edit-form-group select:focus {
          border-color:var(--primary);
          box-shadow:0 0 0 2px rgba(75,136,195,.35);
        }
        
        .edit-modal-footer {
          padding:16px 20px;
          border-top:1px solid var(--border);
          display:flex;
          gap:10px;
          justify-content:flex-end;
        }

        @media (max-width: 1000px) {
          .sv-body-inline { flex-direction:column; }
          .sv-calendar-col { flex:0 0 auto; }
        }

        @media (max-width: 768px) {
          .rd-bar { 
            flex-direction: column;
            gap: 12px;
          }
          .rd-bar-actions {
            width: 100%;
            flex-direction: column;
            gap: 8px;
          }
          .rd-btn {
            width: 100%;
            text-align: center;
          }
          .sv-employee-grid {
            grid-template-columns: 1fr;
          }
          .sv-chip-row {
            gap: 6px;
          }
          .sv-chip {
            padding: 6px 12px;
            font-size: 0.7rem;
          }
        }

        @media (max-width: 480px) {
          .roster-data-root {
            padding: 0;
          }
          .rd-title {
            font-size: 1.1rem;
          }
          .rd-sub {
            font-size: 0.68rem;
          }
          .rd-shift-view-container {
            padding: 12px;
          }
          .sv-section-label {
            font-size: 0.75rem;
          }
          .sv-filter-title {
            font-size: 0.68rem;
          }
          .sv-subtitle {
            font-size: 0.9rem;
          }
          .sv-emp-card {
            padding: 10px 12px;
          }
          .edit-modal {
            width: 95% !important;
            max-width: 95% !important;
          }
        }
      `}</style>
    </div>
  );
}