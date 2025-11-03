"use client";
import { useState, useEffect } from 'react';
import { Clock, Upload, Download, Trash2, RefreshCw, FileText } from 'lucide-react';

interface Props { id: string; }

interface ImportedCsvInfo {
  lastImportTime?: string;
  lastImportMonth?: string;
  hasImportedData: boolean;
}

export default function CsvImportTab({id}:Props) {
  const [file,setFile]=useState<File|null>(null);
  const [uploading,setUploading]=useState(false);
  const [message,setMessage]=useState('');
  const [monthInfo,setMonthInfo]=useState('');
  const [exporting,setExporting]=useState(false);
  const [availableMonths,setAvailableMonths]=useState<string[]>([]);
  const [selectedMonths,setSelectedMonths]=useState<string[]>([]);
  const [exportAll,setExportAll]=useState(true);
  const [csvInfo,setCsvInfo]=useState<ImportedCsvInfo>({hasImportedData: false});
  const [syncing,setSyncing]=useState(false);
  const [deleting,setDeleting]=useState(false);

  useEffect(() => {
    loadAvailableMonths();
    loadCsvInfo();
  }, []);

  async function loadCsvInfo() {
    try {
      // Check if there's Google data (CSV imports go to Google data)
      const res = await fetch('/api/admin/get-google-data');
      if (res.ok) {
        const data = await res.json();
        if (data.allEmployees && data.allEmployees.length > 0) {
          setCsvInfo({
            hasImportedData: true,
            lastImportTime: localStorage.getItem('lastCsvImportTime') || 'Unknown',
            lastImportMonth: localStorage.getItem('lastCsvImportMonth') || ''
          });
        } else {
          setCsvInfo({hasImportedData: false});
        }
      }
    } catch (e) {
      console.error('Failed to load CSV info:', e);
    }
  }

  async function loadAvailableMonths() {
    try {
      const res = await fetch('/api/admin/get-admin-data');
      if (res.ok) {
        const data = await res.json();
        if (data.headers && data.headers.length > 0) {
          const monthsSet = new Set<string>();
          const validMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          data.headers.forEach((h: string) => {
            const match = h.match(/[A-Za-z]+/);
            if (match && validMonths.includes(match[0])) {
              monthsSet.add(match[0]);
            }
          });
          setAvailableMonths(Array.from(monthsSet));
        }
      }
    } catch (e) {
      console.error('Failed to load months:', e);
    }
  }

  async function upload() {
    if (!file) { setMessage('Select a CSV file first'); return; }
    setUploading(true); setMessage('');
    const form = new FormData();
    form.append('csv_file', file);
    const res = await fetch('/api/admin/upload-csv',{method:'POST', body:form}).then(r=>r.json());
    setUploading(false);
    if (res.success) {
      setMessage(res.message);
      const m = (res.message||'').match(/for (.*)!/);
      if (m) {
        setMonthInfo(m[1]);
        // Store import info in localStorage
        localStorage.setItem('lastCsvImportTime', new Date().toLocaleString());
        localStorage.setItem('lastCsvImportMonth', m[1]);
      }
      loadAvailableMonths(); // Refresh available months after upload
      loadCsvInfo(); // Refresh CSV info
    } else setMessage(res.error||'Upload failed');
  }

  async function syncCsvData() {
    if (!confirm('Sync CSV data to Admin roster? This will merge CSV data with existing admin data.')) {
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch('/api/admin/sync-csv-to-admin', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'CSV data synced successfully');
        loadAvailableMonths();
      } else {
        alert(data.error || 'Failed to sync CSV data');
      }
    } catch (e) {
      console.error('Sync error:', e);
      alert('Failed to sync CSV data');
    }
    setSyncing(false);
  }

  async function deleteCsvData() {
    if (!confirm('Delete all CSV imported data? This cannot be undone and will clear the Google data layer.')) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/delete-csv-data', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'CSV data deleted successfully');
        loadCsvInfo();
        loadAvailableMonths();
        setMonthInfo('');
        localStorage.removeItem('lastCsvImportTime');
        localStorage.removeItem('lastCsvImportMonth');
      } else {
        alert(data.error || 'Failed to delete CSV data');
      }
    } catch (e) {
      console.error('Delete error:', e);
      alert('Failed to delete CSV data');
    }
    setDeleting(false);
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const months = exportAll ? [] : selectedMonths;
      const res = await fetch('/api/admin/export-csv', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({months})
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = res.headers.get('Content-Disposition')?.split('filename=')[1] || 'admin_schedule.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setMessage('CSV exported successfully!');
      } else {
        const err = await res.json();
        setMessage(err.error || 'Export failed');
      }
    } catch (e) {
      setMessage('Export failed');
      console.error(e);
    }
    setExporting(false);
  }



  function toggleMonth(month: string) {
    if (selectedMonths.includes(month)) {
      setSelectedMonths(selectedMonths.filter(m => m !== month));
    } else {
      setSelectedMonths([...selectedMonths, month]);
    }
  }

  return (
    <div id={id} className="tab-pane">
      <h2>CSV Import</h2>
      <p>Import roster data from a CSV file (template-compatible). This updates Google base data and merges into Admin if absent.</p>
      
      {/* CSV Import Status */}
      {csvInfo.hasImportedData && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          background: 'var(--bg)',
          border: '2px solid var(--primary)',
          borderRadius: '8px'
        }}>
          <h3 style={{fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: 8}}>
            <FileText size={20} style={{color: 'var(--primary)'}} />
            Imported CSV Data Status
          </h3>
          <div style={{marginBottom: '12px'}}>
            <div style={{fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '4px'}}>
              Last Import: {csvInfo.lastImportTime}
            </div>
            {csvInfo.lastImportMonth && (
              <div style={{fontSize: '0.9rem', color: 'var(--text-dim)'}}>
                Month: {csvInfo.lastImportMonth}
              </div>
            )}
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              className="btn" 
              style={{background: '#2196F3', color: 'white'}}
              onClick={syncCsvData}
              disabled={syncing}
            >
              {syncing ? 'Syncing...' : <><RefreshCw size={16} style={{display:'inline', marginRight:'6px'}} /> Sync CSV to Admin</>}
            </button>
            <button 
              className="btn" 
              style={{background: '#f44336', color: 'white'}}
              onClick={deleteCsvData}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : <><Trash2 size={16} style={{display:'inline', marginRight:'6px'}} /> Delete CSV Data</>}
            </button>
          </div>
        </div>
      )}
      
      <div className="import-box">
        <label className="file-label">
          <input type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0]||null)}/>
          {file ? (
            <>
              <span className="file-name">{file.name}</span>
              <span style={{fontSize:'.85rem', color:'#7E90A8'}}>Click to change file</span>
            </>
          ) : (
            <>
              <span style={{fontSize:'1rem', fontWeight:600, color:'#C4D9EC'}}>Drop CSV file here or click to browse</span>
              <span style={{fontSize:'.85rem', color:'#7E90A8'}}>Supports template-compatible CSV files</span>
            </>
          )}
        </label>
        <div className="actions-row">
          <button className="btn primary" disabled={!file||uploading} onClick={upload}>
            {uploading? <><Clock size={16} style={{display:'inline', marginRight:'6px'}} /> Uploading...</> : <><Upload size={16} style={{display:'inline', marginRight:'6px'}} /> Upload CSV</>}
          </button>
          <a className="btn" href="/api/admin/download-template" target="_blank" rel="noreferrer"><Download size={16} style={{display:'inline', marginRight:'6px'}} /> Download Template</a>
        </div>
        {message && <div className="import-message">{message}</div>}
        {monthInfo && <div className="success-box">Detected Month: {monthInfo}</div>}
      </div>
      <div className="note-box">
        The importer replaces only matching date columns for the detected month; older months remain intact.
      </div>

      <div style={{marginTop: '30px'}}>
        <h2>CSV Export</h2>
        <p>Export Admin Final Schedule data to CSV format.</p>
        <div className="import-box">
          <div className="radio-group">
            <label className={`radio-option ${exportAll ? 'checked' : ''}`}>
              <input 
                type="radio" 
                checked={exportAll} 
                onChange={() => {setExportAll(true); setSelectedMonths([]);}}
              />
              <span>Export All Months</span>
            </label>
            <label className={`radio-option ${!exportAll ? 'checked' : ''}`}>
              <input 
                type="radio" 
                checked={!exportAll} 
                onChange={() => setExportAll(false)}
              />
              <span>Select Specific Months</span>
            </label>
          </div>

          {!exportAll && availableMonths.length > 0 && (
            <div style={{marginBottom: '15px'}}>
              <div style={{fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600, color:'#B5CAE0'}}>Select Months:</div>
              <div className="month-pills">
                {availableMonths.map(month => (
                  <button
                    key={month}
                    onClick={() => toggleMonth(month)}
                    className={`month-pill ${selectedMonths.includes(month) ? 'selected' : ''}`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="actions-row">
            <button 
              className="btn primary" 
              disabled={exporting || (!exportAll && selectedMonths.length === 0)} 
              onClick={exportCsv}
            >
              {exporting ? 'Exporting...' : <><Download size={16} style={{display:'inline', marginRight:'6px'}} /> Export CSV</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}