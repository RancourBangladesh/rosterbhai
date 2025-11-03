"use client";
import { useState, useEffect } from 'react';
import { Clock, Plus, Save, Trash2, RefreshCw } from 'lucide-react';

interface Props {
  id: string;
}

interface ShiftDefinition {
  code: string;
  description: string;
}

export default function ShiftManagementTab({ id }: Props) {
  const [shifts, setShifts] = useState<ShiftDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newShiftCode, setNewShiftCode] = useState('');
  const [newShiftDescription, setNewShiftDescription] = useState('');
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editingDescription, setEditingDescription] = useState('');

  useEffect(() => {
    loadShifts();
  }, []);

  async function loadShifts() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/shift-definitions').then(r => r.json());
      if (res.success && res.shiftDefinitions) {
        const shiftArray = Object.entries(res.shiftDefinitions)
          .map(([code, description]) => ({ code, description: description as string }))
          .filter(s => s.code !== ''); // Exclude empty code
        setShifts(shiftArray);
      }
    } catch (error) {
      console.error('Failed to load shifts:', error);
      alert('Failed to load shift definitions');
    } finally {
      setLoading(false);
    }
  }

  async function addShift() {
    if (!newShiftCode.trim()) {
      alert('Shift code is required');
      return;
    }
    if (!newShiftDescription.trim()) {
      alert('Shift description is required');
      return;
    }

    const code = newShiftCode.trim().toUpperCase();
    
    // Check for duplicates
    if (shifts.some(s => s.code === code)) {
      alert(`Shift code "${code}" already exists`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/shift-definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, description: newShiftDescription.trim() })
      }).then(r => r.json());

      if (res.success) {
        setNewShiftCode('');
        setNewShiftDescription('');
        await loadShifts();
      } else {
        alert(res.error || 'Failed to add shift');
      }
    } catch (error) {
      console.error('Failed to add shift:', error);
      alert('Failed to add shift');
    } finally {
      setSaving(false);
    }
  }

  async function updateShift(code: string) {
    if (!editingDescription.trim()) {
      alert('Shift description is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/shift-definitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, description: editingDescription.trim() })
      }).then(r => r.json());

      if (res.success) {
        setEditingCode(null);
        setEditingDescription('');
        await loadShifts();
      } else {
        alert(res.error || 'Failed to update shift');
      }
    } catch (error) {
      console.error('Failed to update shift:', error);
      alert('Failed to update shift');
    } finally {
      setSaving(false);
    }
  }

  async function deleteShift(code: string) {
    if (!confirm(`Are you sure you want to delete shift "${code}"? This will not affect existing schedule data.`)) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/shift-definitions?code=${encodeURIComponent(code)}`, {
        method: 'DELETE'
      }).then(r => r.json());

      if (res.success) {
        await loadShifts();
      } else {
        alert(res.error || 'Failed to delete shift');
      }
    } catch (error) {
      console.error('Failed to delete shift:', error);
      alert('Failed to delete shift');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(shift: ShiftDefinition) {
    setEditingCode(shift.code);
    setEditingDescription(shift.description);
  }

  function cancelEdit() {
    setEditingCode(null);
    setEditingDescription('');
  }

  async function resetToDefaults() {
    if (!confirm('Reset all shifts to default values? This will replace all custom shift definitions.')) {
      return;
    }

    setSaving(true);
    try {
      const defaultShifts = {
        M2: "8 AM – 5 PM",
        M3: "9 AM – 6 PM",
        M4: "10 AM – 7 PM",
        D1: "12 PM – 9 PM",
        D2: "1 PM – 10 PM",
        DO: "OFF",
        SL: "Sick Leave",
        CL: "Casual Leave",
        EL: "Emergency Leave",
        HL: "Holiday Leave"
      };

      const res = await fetch('/api/admin/shift-definitions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shiftDefinitions: defaultShifts })
      }).then(r => r.json());

      if (res.success) {
        await loadShifts();
        alert('Shifts reset to defaults successfully');
      } else {
        alert(res.error || 'Failed to reset shifts');
      }
    } catch (error) {
      console.error('Failed to reset shifts:', error);
      alert('Failed to reset shifts');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div id={id} style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '8px' 
      }}>
        <Clock size={28} style={{ color: '#3b82f6' }} />
        <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '700', 
          color: '#111827',
          margin: 0 
        }}>
          Shift Management
        </h2>
      </div>
      
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '24px',
        fontSize: '14px'
      }}>
        Define and manage shift codes and their time descriptions for your organization.
      </p>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={loadShifts}
          disabled={loading || saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || saving ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            opacity: loading || saving ? 0.6 : 1
          }}
        >
          <RefreshCw size={16} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>

        <button
          onClick={resetToDefaults}
          disabled={loading || saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading || saving ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            opacity: loading || saving ? 0.6 : 1
          }}
        >
          <RefreshCw size={16} />
          Reset to Defaults
        </button>
      </div>

      {/* Add New Shift */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '16px',
          color: '#111827'
        }}>
          Add New Shift
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '150px 1fr auto',
          gap: '12px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Shift Code
            </label>
            <input
              type="text"
              value={newShiftCode}
              onChange={(e) => setNewShiftCode(e.target.value.toUpperCase())}
              placeholder="e.g., M2, D1"
              maxLength={10}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'monospace',
                textTransform: 'uppercase'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '13px', 
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Description
            </label>
            <input
              type="text"
              value={newShiftDescription}
              onChange={(e) => setNewShiftDescription(e.target.value)}
              placeholder="e.g., 8 AM – 5 PM"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            onClick={addShift}
            disabled={saving || !newShiftCode.trim() || !newShiftDescription.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: saving || !newShiftCode.trim() || !newShiftDescription.trim() ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              opacity: saving || !newShiftCode.trim() || !newShiftDescription.trim() ? 0.5 : 1,
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={16} />
            Add Shift
          </button>
        </div>
      </div>

      {/* Existing Shifts */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            Current Shift Definitions ({shifts.length})
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Loading shift definitions...
          </div>
        ) : shifts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            No shift definitions found. Add your first shift above.
          </div>
        ) : (
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ 
                    padding: '12px 20px', 
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#6b7280',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Shift Code
                  </th>
                  <th style={{ 
                    padding: '12px 20px', 
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#6b7280',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    Description
                  </th>
                  <th style={{ 
                    padding: '12px 20px', 
                    textAlign: 'right',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#6b7280',
                    borderBottom: '1px solid #e5e7eb',
                    width: '180px'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift, idx) => (
                  <tr 
                    key={shift.code}
                    style={{ 
                      backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb',
                      borderBottom: '1px solid #e5e7eb'
                    }}
                  >
                    <td style={{ 
                      padding: '16px 20px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#111827'
                    }}>
                      {shift.code}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {editingCode === shift.code ? (
                        <input
                          type="text"
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #3b82f6',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                          autoFocus
                        />
                      ) : (
                        <span style={{ fontSize: '14px', color: '#374151' }}>
                          {shift.description}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        justifyContent: 'flex-end' 
                      }}>
                        {editingCode === shift.code ? (
                          <>
                            <button
                              onClick={() => updateShift(shift.code)}
                              disabled={saving}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                opacity: saving ? 0.6 : 1
                              }}
                            >
                              <Save size={14} />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={saving}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: '600'
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(shift)}
                              disabled={saving || editingCode !== null}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: saving || editingCode !== null ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                opacity: saving || editingCode !== null ? 0.5 : 1
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteShift(shift.code)}
                              disabled={saving || editingCode !== null}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: saving || editingCode !== null ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: '600',
                                opacity: saving || editingCode !== null ? 0.5 : 1
                              }}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '8px'
      }}>
        <p style={{ 
          fontSize: '13px', 
          color: '#1e40af',
          margin: 0,
          lineHeight: '1.6'
        }}>
          <strong>Note:</strong> Shift codes are used throughout the system in schedules and templates. 
          Deleting or modifying shifts will not affect existing schedule data, only how they are displayed. 
          Common shift codes: M2-M4 (Morning), D1-D2 (Day), DO (Off), SL/CL/EL/HL (Leave types).
        </p>
      </div>
    </div>
  );
}
