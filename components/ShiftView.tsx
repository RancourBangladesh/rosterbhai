"use client";
import { useState, useMemo, useEffect, useCallback } from 'react';
import MonthCompactCalendar from './Shared/MonthCompactCalendar';
import { SHIFT_MAP } from '@/lib/constants'; // mapping code -> timing/label

interface Props {
  open: boolean;
  onClose: () => void;
  roster: any;
  headers: string[];
}

/**
 * GOOD FILE (Version8) WITH ONLY THE REQUESTED CHANGE:
 * - In SHIFT FILTERS (MULTI-SELECT):
 *    * Show base shift codes with their time schedules: M2 (8 AM – 5 PM), M3 (...), M4 (...)
 *    * Merge D1 + D2 into one chip: Evening (D1/D2)
 *    * Merge DO/SL/CL/EL/HL into one chip: Off
 * - Filtering logic updated so:
 *    * Selecting Evening filters employees whose shift is D1 or D2
 *    * Selecting Off filters employees whose shift is any of DO, SL, CL, EL, HL
 *    * Selecting a base code still filters by that exact code
 * - Employee cards & stats remain as they were (stats still by raw code).
 * - No other layout / styling changes were made.
 */
export default function ShiftView({ open, onClose, roster, headers }: Props) {
  const [selectedDate, setSelectedDate] = useState('');
  // This state now stores BOTH raw codes (M2/M3/M4) and aggregate tokens: 'EVENING', 'OFF'
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // Base (non-aggregated) codes we show individually
  const baseShiftCodes = ['M2','M3','M4'];
  const eveningGroup = ['D1','D2'];
  const offGroup = ['DO','SL','CL','EL','HL'];

  const teamList: string[] = useMemo(
    () => (roster?.teams ? Object.keys(roster.teams) : []),
    [roster]
  );

  useEffect(()=>{
    if (!open) {
      setSelectedDate('');
      setSelectedShifts([]);
      setSelectedTeams([]);
    }
  },[open]);

  const escHandler = useCallback((e:KeyboardEvent)=>{
    if (e.key === 'Escape' && open) onClose();
  },[open,onClose]);

  useEffect(()=>{
    window.addEventListener('keydown', escHandler);
    return ()=> window.removeEventListener('keydown', escHandler);
  },[escHandler]);

  const toggle = (arr:string[], val:string, setter:(v:string[])=>void) => {
    setter(arr.includes(val) ? arr.filter(v=>v!==val) : [...arr,val]);
  };

  function toggleShift(val:string) {
    toggle(selectedShifts, val, setSelectedShifts);
  }

  function toggleTeam(team:string) {
    toggle(selectedTeams, team, setSelectedTeams);
  }

  function displayShift(code: string): string {
    if (!code || code === 'N/A' || code === 'Empty') return 'N/A';
    return SHIFT_MAP[code] || code;
  }

  function codeMatchesFilters(rawShift:string) {
    if (!selectedShifts.length) return true;
    if (selectedShifts.includes(rawShift)) return true;                 // direct code
    if (selectedShifts.includes('EVENING') && eveningGroup.includes(rawShift)) return true;
    if (selectedShifts.includes('OFF') && offGroup.includes(rawShift)) return true;
    return false;
  }

  const filteredEmployees = useMemo(()=>{
    if (!selectedDate || !roster?.teams) return [];
    const dateIndex = headers.indexOf(selectedDate);
    if (dateIndex === -1) return [];
    const out:any[] = [];
    const seenIds = new Set<string>(); // Track unique employee IDs to avoid duplicates
    Object.entries(roster.teams).forEach(([teamName, emps]:[string, any])=>{
      if (selectedTeams.length && !selectedTeams.includes(teamName)) return;
      (emps as any[]).forEach(emp=>{
        // Skip if we've already processed this employee
        if (seenIds.has(emp.id)) return;
        
        const rawShift = emp.schedule[dateIndex] || '';
        if (!codeMatchesFilters(rawShift)) return;
        
        seenIds.add(emp.id); // Mark this employee as processed
        out.push({
          name: emp.name,
          id: emp.id,
          team: teamName,
          shift: rawShift || 'N/A'
        });
      });
    });
    return out;
  },[selectedDate, roster, headers, selectedShifts, selectedTeams]); // dependencies include new selectedShifts logic

  const shiftStats = useMemo(()=>{
    const counts: Record<string,number> = {};
    filteredEmployees.forEach(emp=>{
      const k = !emp.shift ? 'Empty' : emp.shift;
      counts[k] = (counts[k]||0)+1;
    });
    return counts;
  },[filteredEmployees]);

  if (!open) return null;

  return (
    <div className="modal-overlay sv-fullwidth">
      <div className="sv-dialog-wide">
        <div className="sv-header-wide">
          <h3>SHIFT VIEW</h3>
          <button className="sv-close" onClick={onClose} aria-label="Close">
            {/* Using a simple SVG X to avoid emoji usage without adding extra deps here */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className="sv-body-wide">
          <div className="sv-calendar-col-wide">
            <div className="sv-section-label-wide">Select Date from Calendar</div>
            <MonthCompactCalendar
              headers={headers}
              selectedDate={selectedDate}
              onSelect={(d)=> setSelectedDate(d)}
              showWeekdays
              showNavigation
            />
          </div>
          <div className="sv-content-col-wide">
            {/* SHIFT FILTERS */}
            <div className="sv-filter-block-wide">
              <div className="sv-filter-title-wide">SHIFT FILTERS (MULTI-SELECT)</div>
              <div className="sv-chip-row-wide">
                {baseShiftCodes.map(code=>(
                  <button
                    key={code}
                    className={`sv-chip-wide ${selectedShifts.includes(code)?'active':''}`}
                    onClick={()=>toggleShift(code)}
                    title={`${code} = ${displayShift(code)}`}
                  >
                    {code} ({displayShift(code)})
                  </button>
                ))}
                <button
                  className={`sv-chip-wide ${selectedShifts.includes('EVENING')?'active':''}`}
                  onClick={()=>toggleShift('EVENING')}
                  title={`Evening includes: ${eveningGroup.join(', ')} → ${eveningGroup.map(c=>displayShift(c)).join(' / ')}`}
                >
                  Evening (D1/D2)
                </button>
                <button
                  className={`sv-chip-wide ${selectedShifts.includes('OFF')?'active':''}`}
                  onClick={()=>toggleShift('OFF')}
                  title={`Off includes: ${offGroup.join(', ')}`}
                >
                  Off
                </button>
                <button
                  className="sv-chip-wide clear"
                  onClick={()=>setSelectedShifts([])}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* TEAM FILTERS */}
            <div className="sv-filter-block-wide">
              <div className="sv-filter-title-wide">TEAM FILTERS (MULTI-SELECT)</div>
              <div className="sv-chip-row-wide">
                {teamList.map(team=>(
                  <button
                    key={team}
                    className={`sv-chip-wide ${selectedTeams.includes(team)?'active':''}`}
                    onClick={()=>toggleTeam(team)}
                  >{team}</button>
                ))}
                <button
                  className="sv-chip-wide clear"
                  onClick={()=>setSelectedTeams([])}
                >Clear</button>
              </div>
            </div>

            <div style={{marginTop:6}}>
              <button
                className="btn"
                style={{fontSize:'.85rem', padding:'9px 22px'}}
                onClick={()=>{
                  setSelectedDate('');
                  setSelectedShifts([]);
                  setSelectedTeams([]);
                }}
              >Reset All</button>
            </div>

            <div className="sv-results-wide">
              <h4 className="sv-subtitle-wide">
                {selectedDate ? `Employees for ${selectedDate}` : 'Select a date to view employees'}
              </h4>
              {selectedDate && filteredEmployees.length === 0 && (
                <div className="sv-empty-wide">No employees match the current filters.</div>
              )}
              {selectedDate && filteredEmployees.length > 0 && (
                <div className="sv-employee-grid-wide">
                  {filteredEmployees.map(emp=>(
                    <div
                      key={emp.id}
                      className="sv-emp-card-wide"
                      title={emp.shift ? `${emp.shift} → ${displayShift(emp.shift)}` : 'N/A'}
                    >
                      <div className="sv-emp-name-wide">{emp.name}</div>
                      <div className="sv-emp-meta-wide">{emp.id} • {emp.team}</div>
                      <div className="sv-emp-shift-wide">
                        {displayShift(emp.shift)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedDate && Object.keys(shiftStats).length > 0 && (
              <div className="sv-stats-wide">
                <h4 className="sv-subtitle-wide">Shift Stats</h4>
                <div className="sv-stats-row-wide">
                  {Object.entries(shiftStats).map(([code,count])=>{
                    const label = code === 'Empty' ? 'N/A' : displayShift(code);
                    return (
                      <div
                        key={code}
                        className="sv-stat-pill-wide"
                        title={code === 'Empty' ? 'No Shift Code' : `${code} → ${label}`}
                      >
                        <span className="sv-stat-key-wide">
                          {label}
                        </span>
                        <span className="sv-stat-val-wide">{count}</span>
                      </div>
                    );
                  })}
                  <div className="sv-stat-pill-wide total">
                    <span className="sv-stat-key-wide">Total</span>
                    <span className="sv-stat-val-wide">{filteredEmployees.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="sv-footer-wide">
          <button className="btn primary" style={{fontSize:'.9rem', padding:'10px 34px'}} onClick={onClose}>Close</button>
        </div>
      </div>

      {/* Modern light theme to match employee portal */}
      <style jsx global>{`
        .modal-overlay.sv-fullwidth {
          position:fixed;
          inset:0;
          display:flex;
          align-items:center;
          justify-content:center;
          background:rgba(0,0,0,.6);
          backdrop-filter:blur(4px);
          z-index:3000;
          padding:10px;
        }
        .sv-dialog-wide {
          width:clamp(1200px,92vw,1720px);
          max-height:94vh;
          background:#fff;
          border:1px solid #e5e7eb;
          border-radius:12px;
          display:flex;
          flex-direction:column;
          box-shadow:0 20px 50px rgba(0,0,0,0.3);
          overflow:hidden;
          font-size:16px;
        }
        .sv-header-wide {
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:20px 28px;
          border-bottom:1px solid #e5e7eb;
          background:#fff;
        }
        .sv-header-wide h3 {
          margin:0;
          font-size:1.25rem;
          letter-spacing:0.5px;
          font-weight:700;
          color:#111827;
        }
        .sv-close {
          background:#f3f4f6;
          border:1px solid #d1d5db;
          color:#374151;
          padding:8px 14px;
          font-size:.85rem;
          border-radius:8px;
          cursor:pointer;
          transition:all 0.2s;
        }
        .sv-close:hover { 
          background:#e5e7eb;
          border-color:#9ca3af;
        }

        .sv-body-wide {
          display:flex;
          gap:40px;
          padding:28px 32px 14px;
          overflow-y:auto;
          background:#f9fafb;
        }
        .sv-calendar-col-wide {
          flex:0 0 300px;
          display:flex;
          flex-direction:column;
          gap:16px;
        }
        .sv-section-label-wide {
          font-size:.8rem;
          letter-spacing:0.5px;
          color:#6b7280;
          font-weight:600;
          text-transform:uppercase;
        }
        .sv-content-col-wide {
          flex:1;
          min-width:0;
          display:flex;
          flex-direction:column;
        }

        .sv-filter-block-wide { 
          margin-bottom:20px;
          background:#fff;
          padding:16px;
          border-radius:8px;
          border:1px solid #e5e7eb;
        }
        .sv-filter-title-wide {
          font-size:.75rem;
          letter-spacing:0.5px;
          color:#6b7280;
          margin-bottom:12px;
          font-weight:700;
          text-transform:uppercase;
        }
        .sv-chip-row-wide { display:flex; flex-wrap:wrap; gap:10px; }
        .sv-chip-wide {
          padding:8px 16px;
          font-size:.875rem;
          border-radius:8px;
          background:#f3f4f6;
          border:1px solid #d1d5db;
          color:#374151;
          cursor:pointer;
          transition:.2s;
          font-weight:500;
        }
        .sv-chip-wide:hover {
          background:#e5e7eb;
          border-color:#9ca3af;
        }
        .sv-chip-wide.active {
          background:#3b82f6;
          border-color:#2563eb;
          color:#fff;
          box-shadow:0 0 0 3px rgba(59,130,246,0.2);
        }
        .sv-chip-wide.clear {
          background:transparent;
          border:1px dashed #d1d5db;
          color:#6b7280;
        }
        .sv-chip-wide.clear:hover { 
          border-color:#3b82f6; 
          color:#3b82f6; 
        }

        .sv-results-wide { 
          margin-top:4px;
        }
        .sv-subtitle-wide {
          margin:0 0 16px 0;
          font-size:1.125rem;
          letter-spacing:0;
          color:#111827;
          font-weight:600;
        }
        .sv-empty-wide {
          background:#fff;
          border:1px solid #e5e7eb;
          padding:40px;
          border-radius:8px;
          font-size:.875rem;
          color:#6b7280;
          text-align:center;
        }
        .sv-employee-grid-wide {
          display:grid;
          gap:16px;
          grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
        }
        .sv-emp-card-wide {
          background:#fff;
          border:1px solid #e5e7eb;
          border-radius:12px;
          padding:16px;
          display:flex;
          flex-direction:column;
          gap:8px;
          transition:.2s;
          box-shadow:0 1px 3px rgba(0,0,0,0.05);
        }
        .sv-emp-card-wide:hover {
          box-shadow:0 4px 12px rgba(0,0,0,0.1);
          border-color:#d1d5db;
          transform:translateY(-2px);
        }
        .sv-emp-name-wide { 
          font-size:1rem; 
          font-weight:600; 
          color:#111827; 
        }
        .sv-emp-meta-wide { 
          font-size:.75rem; 
          color:#6b7280; 
          letter-spacing:0; 
        }
        .sv-emp-shift-wide {
          align-self:flex-start;
          background:#3b82f6;
          padding:6px 14px;
          font-size:.75rem;
          border-radius:6px;
          letter-spacing:0.3px;
          font-weight:600;
          color:#fff;
        }

        .sv-stats-wide { 
          margin-top:26px;
          background:#fff;
          padding:20px;
          border-radius:8px;
          border:1px solid #e5e7eb;
        }
        .sv-stats-row-wide { 
          display:flex; 
          flex-wrap:wrap; 
          gap:12px;
          margin-top:12px;
        }
        .sv-stat-pill-wide {
          background:#f9fafb;
          border:1px solid #e5e7eb;
          border-radius:8px;
          padding:12px 16px;
          display:flex;
          align-items:center;
          gap:12px;
          font-size:.875rem;
        }
        .sv-stat-pill-wide.total {
          background:#f3f4f6;
          border:2px solid #d1d5db;
        }
        .sv-stat-key-wide {
          background:#3b82f6;
          padding:4px 12px;
          border-radius:6px;
          font-size:.75rem;
          letter-spacing:0.3px;
          color:#fff;
          font-weight:600;
        }
        .sv-stat-val-wide { 
          font-weight:700; 
          font-size:1rem; 
          color:#111827; 
        }

        .sv-footer-wide {
          padding:16px 32px 20px;
          border-top:1px solid #e5e7eb;
          display:flex;
          justify-content:flex-end;
          background:#fff;
        }

        @media (min-width: 1500px) {
          .sv-body-wide { padding:32px 40px 16px; gap:48px; }
          .sv-calendar-col-wide { flex:0 0 320px; }
        }
        @media (max-width: 1250px) {
          .sv-dialog-wide { width:94vw; }
          .sv-body-wide { gap:32px; }
          .sv-calendar-col-wide { flex:0 0 280px; }
        }
        @media (max-width: 1000px) {
          .sv-body-wide { flex-direction:column; }
          .sv-calendar-col-wide { flex:0 0 auto; }
        }
        @media (max-width: 768px) {
          .sv-dialog-wide { 
            width:96vw;
            max-height:96vh;
          }
          .sv-header-wide {
            padding:16px 20px;
          }
          .sv-body-wide {
            padding:20px;
            gap:20px;
          }
          .sv-filter-block-wide {
            padding:12px;
          }
          .sv-employee-grid-wide {
            grid-template-columns:1fr;
          }
        }
      `}</style>
    </div>
  );
}