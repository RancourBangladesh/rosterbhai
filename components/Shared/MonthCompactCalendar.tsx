"use client";
import { useMemo, useState, useEffect } from 'react';

interface Props {
  headers: string[];
  selectedDate?: string;
  onSelect?: (date: string) => void;
  yearHint?: number;
  showWeekdays?: boolean;
  showNavigation?: boolean;
  allowDynamicDates?: boolean; // Allow clicking dates not in headers (for 5-year CRUD)
  minYear?: number; // Minimum year allowed (default: currentYear - 5)
  maxYear?: number; // Maximum year allowed (default: currentYear + 5)
}

const MONTH_MAP: Record<string, number> = {
  jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,
  january:0,february:1,march:2,april:3,june:5,july:6,august:7,september:8,october:9,november:10,december:11
};
const MONTH_NAME: Record<number,string> = {
  0:"Jan",1:"Feb",2:"Mar",3:"Apr",4:"May",5:"Jun",6:"Jul",7:"Aug",8:"Sep",9:"Oct",10:"Nov",11:"Dec"
};
const MONTH_NAME_FULL: Record<number,string> = {
  0:"January",1:"February",2:"March",3:"April",4:"May",5:"June",6:"July",7:"August",8:"September",9:"October",10:"November",11:"December"
};

function detectMonth(headers: string[]): {monthIndex:number, name:string, usesFullName: boolean}|null {
  for (const h of headers) {
    const m = h.match(/[A-Za-z]+$/);
    if (m) {
      const monthStr = m[0].toLowerCase();
      // Check if it's a full month name first
      if (MONTH_MAP[monthStr] !== undefined) {
        const idx = MONTH_MAP[monthStr];
        return {monthIndex: idx, name: MONTH_NAME[idx], usesFullName: monthStr.length > 3};
      }
      // Fallback to 3-letter abbreviation
      const key = monthStr.slice(0,3);
      if (MONTH_MAP[key] !== undefined) {
        const idx = MONTH_MAP[key];
        return {monthIndex: idx, name: MONTH_NAME[idx], usesFullName: false};
      }
    }
  }
  return null;
}
function detectAvailableMonths(headers: string[]): Set<string> {
  const s = new Set<string>();
  headers.forEach(h=>{
    const m = h.match(/[A-Za-z]+$/);
    if (m) s.add(m[0].slice(0,3).toLowerCase());
  });
  return s;
}

export default function MonthCompactCalendar({
  headers,
  selectedDate,
  onSelect,
  yearHint,
  showWeekdays = true,
  showNavigation = false,
  allowDynamicDates = false,
  minYear,
  maxYear
}: Props) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const effectiveMinYear = minYear ?? (currentYear - 5);
  const effectiveMaxYear = maxYear ?? (currentYear + 5);

  // 1) Auto-select today's date on first render if nothing is selected
  useEffect(() => {
    if (!hasAutoSelected && headers.length > 0 && !selectedDate && onSelect) {
      const now = new Date();
      const currentMonth = now.getMonth();
      const day = now.getDate();
      const monthName = MONTH_NAME[currentMonth];
      const todayHeader = `${day}${monthName}`;
      if (headers.includes(todayHeader)) {
        onSelect(todayHeader);
        setHasAutoSelected(true);
        const det = detectMonth(headers);
        if (det && det.monthIndex !== currentMonth) {
          setMonthOffset(currentMonth - det.monthIndex);
        }
      }
    }
  }, [headers, selectedDate, onSelect, hasAutoSelected]);

  // 2) Sync displayed month to the selectedDate’s month (FIX for jumping back)
  useEffect(() => {
    if (!selectedDate || headers.length === 0) return;
    const m = selectedDate.match(/[A-Za-z]+$/);
    if (!m) return;
    const key = m[0].slice(0,3).toLowerCase();
    const det = detectMonth(headers);
    if (!det) return;
    if (MONTH_MAP[key] === undefined) return;
    const newOffset = MONTH_MAP[key] - det.monthIndex;
    setMonthOffset(newOffset);
  }, [selectedDate, headers]);

  const { weeks, monthName, monthIndex, year, canGoPrev, canGoNext } = useMemo(()=>{
    const det = detectMonth(headers);
    const availableMonths = detectAvailableMonths(headers);
    const now = new Date();
    let year = yearHint || now.getFullYear();
    let monthIndex = det ? det.monthIndex : now.getMonth();
    monthIndex += monthOffset;
    while (monthIndex < 0) { monthIndex += 12; year -= 1; }
    while (monthIndex > 11) { monthIndex -= 12; year += 1; }

    const monthName = MONTH_NAME[monthIndex];
    const currentMonthKey = monthName.toLowerCase().slice(0, 3);
    // Use full month name if the headers use full names
    const usesFullName = det ? det.usesFullName : false;

    const lastDay = new Date(year, monthIndex+1, 0).getDate();
    const days = Array.from({length:lastDay}, (_,i)=> i+1);

    interface DayCell { label: string; headerKey: string; day: number; weekday: number; }
    const monthHeader = usesFullName ? MONTH_NAME_FULL[monthIndex] : monthName;
    const dayCells: DayCell[] = days.map(day=>{
      const headerKey = `${day}${monthHeader}`;
      const d = new Date(year, monthIndex, day);
      return { label: String(day), headerKey, day, weekday: d.getDay() };
    });

    const weeks: (DayCell|null)[][] = [];
    let currentWeek: (DayCell|null)[] = [];
    const firstWeekday = dayCells[0]?.weekday ?? 0;
    for (let i=0;i<firstWeekday;i++) currentWeek.push(null);
    dayCells.forEach(cell=>{
      currentWeek.push(cell);
      if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
    });
    if (currentWeek.length>0) { while (currentWeek.length<7) currentWeek.push(null); weeks.push(currentWeek); }

    const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
    const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
    const prevMonthKey = MONTH_NAME[prevMonthIndex].toLowerCase().slice(0, 3);
    const nextMonthKey = MONTH_NAME[nextMonthIndex].toLowerCase().slice(0, 3);
    
    // Check if we can navigate based on headers (if not dynamic) or year limits (if dynamic)
    let canGoPrev: boolean;
    let canGoNext: boolean;
    
    if (allowDynamicDates) {
      // Check year boundaries for dynamic mode
      const prevYear = monthIndex === 0 ? year - 1 : year;
      const nextYear = monthIndex === 11 ? year + 1 : year;
      canGoPrev = prevYear >= effectiveMinYear;
      canGoNext = nextYear <= effectiveMaxYear;
    } else {
      // Check available months in headers
      canGoPrev = availableMonths.has(prevMonthKey);
      canGoNext = availableMonths.has(nextMonthKey);
    }

    return { weeks: weeks as DayCell[][], monthName, monthIndex, year, canGoPrev, canGoNext };
  },[headers, yearHint, monthOffset, allowDynamicDates, effectiveMinYear, effectiveMaxYear]);

  const handleSelect = (key:string) => { if (onSelect) onSelect(key); };

  return (
    <div className="mc-month-calendar large">
      <div className="mc-header-row">
        {showNavigation && (
          <button type="button" className="mc-nav-btn" onClick={() => setMonthOffset(monthOffset - 1)} disabled={!canGoPrev} title="Previous Month">←</button>
        )}
        <div className="mc-month-title">{monthName} {year}</div>
        {showNavigation && (
          <button type="button" className="mc-nav-btn" onClick={() => setMonthOffset(monthOffset + 1)} disabled={!canGoNext} title="Next Month">→</button>
        )}
      </div>
      {showWeekdays && (
        <div className="mc-weekdays">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>(
            <div key={d} className="mc-weekday">{d}</div>
          ))}
        </div>
      )}
      <div className="mc-weeks">
        {weeks.map((week,wi)=>(
          <div className="mc-week" key={wi}>
            {week.map((cell,ci)=>{
              if (!cell) return <div key={ci} className="mc-day empty" />;
              // In dynamic mode, all dates are active; otherwise check headers
              const isActive = allowDynamicDates || headers.includes(cell.headerKey);
              const isSelected = cell.headerKey === selectedDate;
              return (
                <button
                  key={ci}
                  type="button"
                  className={`mc-day ${isActive?'active':''} ${isSelected?'selected':''} ${!headers.includes(cell.headerKey) && allowDynamicDates ? 'dynamic' : ''}`}
                  onClick={()=> isActive && handleSelect(cell.headerKey)}
                  disabled={!isActive}
                  title={`${cell.headerKey}${!headers.includes(cell.headerKey) && allowDynamicDates ? ' (New date)' : ''}`}
                >
                  <span className="mc-day-number">{cell.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <style jsx>{`
        .mc-month-calendar.large { background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:14px 16px 18px; width:100%; box-sizing:border-box; display:flex; flex-direction:column; gap:10px; }
        .mc-header-row { display:flex; justify-content:center; align-items:center; gap:12px; }
        .mc-month-title { font-size:.9rem; letter-spacing:1px; font-weight:600; color:var(--text); text-transform:uppercase; }
        .mc-nav-btn { background:var(--panel-alt); border:1px solid var(--border); border-radius:6px; color:var(--text-dim); padding:6px 12px; font-size:1rem; cursor:pointer; transition:.18s; font-weight:600; }
        .mc-nav-btn:hover:not(:disabled) { background:var(--primary); border-color:var(--primary); color:#fff; }
        .mc-nav-btn:disabled { opacity:.3; cursor:not-allowed; }
        .mc-weekdays { display:grid; grid-template-columns:repeat(7,1fr); gap:6px; }
        .mc-weekday { text-align:center; font-size:.65rem; letter-spacing:.5px; color:var(--text-dim); padding:2px 0; font-weight:500; }
        .mc-weeks { display:flex; flex-direction:column; gap:6px; }
        .mc-week { display:grid; grid-template-columns:repeat(7,1fr); gap:6px; }
        .mc-day { position:relative; background:var(--panel-alt); border:1px solid var(--border); border-radius:8px; height:52px; font-size:.8rem; color:var(--text-dim); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:.18s; padding:0; font-weight:500; }
        .mc-day.active { color:var(--text); }
        .mc-day:hover.active { background:var(--primary); border-color:var(--primary); color:#fff; }
        .mc-day.selected { background:var(--primary); border-color:var(--primary); color:#fff; font-weight:700; box-shadow:0 0 0 2px rgba(79, 70, 229, 0.25); }
        .mc-day.empty { background:transparent; border:none; cursor:default; }
        .mc-day:disabled { opacity:.3; cursor:default; }
        .mc-day-number { position:relative; z-index:2; }
      `}</style>
    </div>
  );
}