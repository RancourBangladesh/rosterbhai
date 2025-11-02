"use client";
import { useState, useEffect } from 'react';
import { Plus, Save, Trash2, Calendar, Users } from 'lucide-react';

interface Props { id: string; }

interface Employee {
  id: string;
  name: string;
  team: string;
}

export default function TemplateCreatorTab({ id }: Props) {
  const [templateName, setTemplateName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [defaultShift, setDefaultShift] = useState('M2');
  const [shiftOptions, setShiftOptions] = useState<string[]>(['M2', 'M3', 'M4', 'D1', 'D2', 'DO', 'SL', 'CL', 'EL', 'HL', 'N/A']);

  useEffect(() => {
    loadEmployees();
    loadShiftDefinitions();
  }, []);

  async function loadEmployees() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/get-admin-data');
      if (res.ok) {
        const data = await res.json();
        const allEmps: Employee[] = [];
        if (data.teams) {
          Object.entries(data.teams).forEach(([teamName, emps]: [string, any]) => {
            emps.forEach((emp: any) => {
              allEmps.push({
                id: emp.id,
                name: emp.name,
                team: teamName
              });
            });
          });
        }
        setEmployees(allEmps);
      }
    } catch (e) {
      console.error('Failed to load employees:', e);
    }
    setLoading(false);
  }

  async function loadShiftDefinitions() {
    try {
      const res = await fetch('/api/admin/shift-definitions');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.shiftDefinitions) {
          const codes = Object.keys(data.shiftDefinitions)
            .filter(code => code !== '') // Exclude empty code
            .sort();
          if (codes.length > 0) {
            setShiftOptions([...codes, 'N/A']);
            // Set first shift as default if M2 doesn't exist
            if (!codes.includes('M2') && codes.length > 0) {
              setDefaultShift(codes[0]);
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to load shift definitions:', e);
    }
  }

  function generateDateHeaders(start: string, end: string): string[] {
    const headers: string[] = [];
    const startD = new Date(start);
    const endD = new Date(end);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    let current = new Date(startD);
    while (current <= endD) {
      const day = current.getDate();
      const month = monthNames[current.getMonth()];
      headers.push(`${day}${month}`);
      current.setDate(current.getDate() + 1);
    }
    return headers;
  }

  async function createTemplate() {
    if (!templateName.trim()) {
      setMessage('❌ Please enter a template name');
      return;
    }
    if (!startDate || !endDate) {
      setMessage('❌ Please select start and end dates');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setMessage('❌ Start date must be before end date');
      return;
    }
    if (selectedEmployees.length === 0) {
      setMessage('❌ Please select at least one employee');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const headers = generateDateHeaders(startDate, endDate);
      const schedule = Array(headers.length).fill(defaultShift);

      // Create template data structure
      const templateData: any = {
        teams: {},
        headers,
        allEmployees: []
      };

      // Group employees by team
      const employeesByTeam: Record<string, Employee[]> = {};
      selectedEmployees.forEach(empId => {
        const emp = employees.find(e => e.id === empId);
        if (emp) {
          if (!employeesByTeam[emp.team]) {
            employeesByTeam[emp.team] = [];
          }
          employeesByTeam[emp.team].push(emp);
        }
      });

      // Build template structure
      Object.entries(employeesByTeam).forEach(([teamName, teamEmps]) => {
        templateData.teams[teamName] = teamEmps.map(emp => ({
          name: emp.name,
          id: emp.id,
          schedule: [...schedule],
          currentTeam: teamName
        }));
      });

      // Build allEmployees
      selectedEmployees.forEach(empId => {
        const emp = employees.find(e => e.id === empId);
        if (emp) {
          templateData.allEmployees.push({
            name: emp.name,
            id: emp.id,
            schedule: [...schedule],
            currentTeam: emp.team
          });
        }
      });

      // Save template
      const res = await fetch('/api/admin/create-roster-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: templateName.trim(),
          templateData,
          startDate,
          endDate
        })
      });

      const result = await res.json();
      
      if (result.success) {
        setMessage(`✅ ${result.message}`);
        // Reset form
        setTemplateName('');
        setStartDate('');
        setEndDate('');
        setSelectedEmployees([]);
      } else {
        setMessage(`❌ ${result.error || 'Failed to create template'}`);
      }
    } catch (e) {
      console.error('Template creation error:', e);
      setMessage('❌ Failed to create template');
    }

    setSaving(false);
  }

  function toggleEmployee(empId: string) {
    setSelectedEmployees(prev => 
      prev.includes(empId) 
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  }

  function toggleAll() {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id));
    }
  }

  return (
    <div id={id} style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
        📋 Create Roster Template
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Create a new roster template with selected employees and date range. This will initialize your tenant&apos;s roster data.
      </p>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: message.includes('✅') ? '#dcfce7' : '#fee2e2',
          border: `1px solid ${message.includes('✅') ? '#86efac' : '#fca5a5'}`,
          color: message.includes('✅') ? '#166534' : '#991b1b'
        }}>
          {message}
        </div>
      )}

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={18} />
          Template Configuration
        </h3>

        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
              Template Name *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., January 2025 Roster"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                Default Shift
              </label>
              <select
                value={defaultShift}
                onChange={(e) => setDefaultShift(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                {shiftOptions.map(shift => (
                  <option key={shift} value={shift}>{shift}</option>
                ))}
              </select>
            </div>
          </div>

          {startDate && endDate && new Date(startDate) <= new Date(endDate) && (
            <div style={{
              padding: '12px',
              background: '#f3f4f6',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#374151'
            }}>
              📅 This template will cover <strong>{generateDateHeaders(startDate, endDate).length} days</strong> from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} />
            Select Employees ({selectedEmployees.length} selected)
          </h3>
          <button
            onClick={toggleAll}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            {selectedEmployees.length === employees.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
            Loading employees...
          </div>
        ) : employees.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            color: '#92400e'
          }}>
            ⚠️ No employees found. Please add employees first in the Team Management tab.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '12px',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '4px'
          }}>
            {employees.map(emp => (
              <label
                key={emp.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  border: `2px solid ${selectedEmployees.includes(emp.id) ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: selectedEmployees.includes(emp.id) ? '#eff6ff' : '#fff',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp.id)}
                  onChange={() => toggleEmployee(emp.id)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500 }}>{emp.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>ID: {emp.id} • Team: {emp.team}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={createTemplate}
          disabled={saving || !templateName || !startDate || !endDate || selectedEmployees.length === 0}
          style={{
            padding: '12px 24px',
            background: saving ? '#9ca3af' : '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Save size={18} />
          {saving ? 'Creating Template...' : 'Create & Apply Template'}
        </button>
      </div>
    </div>
  );
}
