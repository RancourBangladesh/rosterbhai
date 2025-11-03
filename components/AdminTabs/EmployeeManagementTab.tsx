"use client";
import { useState, useEffect } from 'react';
import { Edit, Save, Plus, Mail, UserX, Users } from 'lucide-react';
import SendPasswordLinkModal from '../Shared/SendPasswordLinkModal';

interface Props { id: string; }
interface Employee { 
  name: string; 
  id: string; 
  schedule: string[]; 
  currentTeam?: string; 
  status?: 'active' | 'inactive';
  deleted_at?: string;
}
interface AdminData {
  teams: Record<string, Employee[]>;
  headers: string[];
}

function EditEmployeeModal({
  employee,
  onSave,
  onCancel
}: {
  employee: { id: string; name: string; currentTeam?: string };
  onSave: (name: string, id: string) => void;
  onCancel: () => void;
}) {
  const [empName, setEmpName] = useState(employee.name);
  const [empId, setEmpId] = useState(employee.id);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Employee</h3>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid two">
            <div>
              <label>Name</label>
              <input
                value={empName}
                onChange={e => setEmpName(e.target.value)}
                placeholder="Full Name"
              />
            </div>
            <div>
              <label>ID (Cannot be changed)</label>
              <input
                value={empId}
                disabled
                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                placeholder="EMP ID"
              />
            </div>
          </div>
          <div className="info-box" style={{ marginTop: '1rem' }}>
            <strong>Note:</strong> Employee ID cannot be changed once created to maintain data integrity.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn primary" onClick={() => onSave(empName, empId)}>
            <Save size={16} style={{display:'inline', marginRight:'6px'}} /> Save
          </button>
          <button className="btn" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeeManagementTab({ id }: Props) {
  const [data, setData] = useState<AdminData>({ teams: {}, headers: [] });
  const [empName, setEmpName] = useState('');
  const [empId, setEmpId] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'unassigned'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmp, setEditingEmp] = useState<{ id: string; name: string; currentTeam?: string } | null>(null);
  const [sendingPasswordTo, setSendingPasswordTo] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [reactivateTeam, setReactivateTeam] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/get-admin-data');
      if (res.ok) {
        const j = await res.json();
        setData(j);
      }
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => { load(); }, []);

  // Get all employees across all teams
  const allEmployees: Employee[] = [];
  Object.entries(data.teams).forEach(([teamName, employees]) => {
    employees.forEach(emp => {
      allEmployees.push({ ...emp, currentTeam: teamName });
    });
  });

  // Filter employees
  const filteredEmployees = allEmployees.filter(emp => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      if (!emp.name.toLowerCase().includes(search) && 
          !emp.id.toLowerCase().includes(search) &&
          !emp.currentTeam?.toLowerCase().includes(search)) {
        return false;
      }
    }

    // Status filter
    if (filter === 'active') {
      return emp.status !== 'inactive' && emp.currentTeam !== 'Inactive Employees';
    }
    if (filter === 'inactive') {
      return emp.status === 'inactive' || emp.currentTeam === 'Inactive Employees';
    }
    if (filter === 'unassigned') {
      return emp.currentTeam === 'Unassigned';
    }
    return true; // 'all'
  });

  // Get all team names (excluding Inactive Employees)
  const allTeams = Object.keys(data.teams).filter(t => t !== 'Inactive Employees');

  // Count statistics
  const activeCount = allEmployees.filter(e => e.status !== 'inactive' && e.currentTeam !== 'Inactive Employees').length;
  const inactiveCount = allEmployees.filter(e => e.status === 'inactive' || e.currentTeam === 'Inactive Employees').length;
  const unassignedCount = allEmployees.filter(e => e.currentTeam === 'Unassigned').length;

  async function addEmployee() {
    if (!empName || !empId) {
      alert('Please enter both name and ID');
      return;
    }
    
    const res = await fetch('/api/admin/save-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        name: empName, 
        id: empId, 
        team: 'Unassigned', // Create in Unassigned team by default
        action: 'add' 
      })
    }).then(r => r.json());
    
    if (res.success) {
      setEmpName(''); 
      setEmpId('');
      load();
    } else {
      alert(res.error || 'Failed to add employee');
    }
  }

  async function editEmployee(name: string, id: string) {
    if (!editingEmp || !name) return;
    
    const res = await fetch('/api/admin/save-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        id: editingEmp.id, // Keep original ID
        team: editingEmp.currentTeam || 'Unassigned',
        action: 'edit',
        oldId: editingEmp.id,
        oldTeam: editingEmp.currentTeam || 'Unassigned'
      })
    }).then(r => r.json());
    
    if (res.success) {
      setEditingEmp(null);
      load();
    } else {
      alert(res.error || 'Failed to edit employee');
    }
  }

  async function reassignEmployee(emp: Employee, newTeam: string) {
    if (emp.status === 'inactive') {
      alert('Cannot reassign inactive employees.');
      return;
    }
    
    if (newTeam === emp.currentTeam) {
      return; // No change
    }
    
    const res = await fetch('/api/admin/save-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: emp.name,
        id: emp.id,
        team: newTeam,
        action: 'edit',
        oldId: emp.id,
        oldTeam: emp.currentTeam
      })
    }).then(r => r.json());
    
    if (res.success) {
      load();
    } else {
      alert(res.error || 'Failed to reassign employee');
    }
  }

  async function deleteEmployee(emp: Employee) {
    if (emp.status === 'inactive') {
      alert('This employee is already inactive.');
      return;
    }
    
    if (!confirm(`Deactivate employee "${emp.name}" (ID: ${emp.id})?\n\nThis will:\n- Move them to "Inactive Employees"\n- Disable their login\n- Reserve their ID permanently\n\nTheir data will be preserved but they cannot log in.`)) {
      return;
    }
    
    const res = await fetch('/api/admin/delete-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: emp.id })
    }).then(r => r.json());
    
    if (res.success) {
      load();
    } else {
      alert(res.error || 'Failed to deactivate employee');
    }
  }

  async function reactivate(emp: Employee, targetTeam: string) {
    if (!targetTeam) {
      alert('Please select a team to reactivate the employee into.');
      return;
    }
    const res = await fetch('/api/admin/reactivate-employee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: emp.id, targetTeam })
    }).then(r => r.json());

    if (res.success) {
      load();
    } else {
      alert(res.error || 'Failed to reactivate employee');
    }
  }

  function getStatusBadge(emp: Employee) {
    if (emp.status === 'inactive' || emp.currentTeam === 'Inactive Employees') {
      return <span className="badge-inactive">Inactive</span>;
    }
    if (emp.currentTeam === 'Unassigned') {
      return <span className="badge-warning">Unassigned</span>;
    }
    return <span className="badge-active">Active</span>;
  }

  return (
    <div id={id} className="tab-pane employee-management-root">
      <h2>Employee Registry</h2>
      <p>Centralized employee management. Create employees here, then assign them to teams.</p>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
            <Users size={24} style={{ color: '#1e40af' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{allEmployees.length}</div>
            <div className="stat-label">Total Employees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7' }}>
            <Users size={24} style={{ color: '#15803d' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{activeCount}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
            <Users size={24} style={{ color: '#b45309' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{unassignedCount}</div>
            <div className="stat-label">Unassigned</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fee2e2' }}>
            <UserX size={24} style={{ color: '#991b1b' }} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{inactiveCount}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
      </div>

      {/* Add Employee Form */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Create New Employee</h3>
        <div className="info-box" style={{ marginBottom: '1rem' }}>
          <strong>Important:</strong> Employee IDs must be unique and cannot be changed once created. 
          New employees will be created in the &quot;Unassigned&quot; team. Assign them to a team in Team Management.
        </div>
        <div className="form-grid two">
          <div>
            <label>Full Name <span style={{ color: 'red' }}>*</span></label>
            <input
              value={empName}
              onChange={e => setEmpName(e.target.value)}
              placeholder="e.g., John Doe"
            />
          </div>
          <div>
            <label>Employee ID <span style={{ color: 'red' }}>*</span></label>
            <input
              value={empId}
              onChange={e => setEmpId(e.target.value.toUpperCase())}
              placeholder="e.g., EMP001"
            />
          </div>
        </div>
        <div className="actions-row" style={{ marginTop: '1rem' }}>
          <button className="btn primary" onClick={addEmployee}>
            <Plus size={16} style={{display:'inline', marginRight:'6px'}} /> Create Employee
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="filter-row">
          <div className="filter-buttons">
            <button 
              className={`btn small ${filter === 'all' ? 'primary' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({allEmployees.length})
            </button>
            <button 
              className={`btn small ${filter === 'active' ? 'primary' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active ({activeCount})
            </button>
            <button 
              className={`btn small ${filter === 'unassigned' ? 'primary' : ''}`}
              onClick={() => setFilter('unassigned')}
            >
              Unassigned ({unassignedCount})
            </button>
            <button 
              className={`btn small ${filter === 'inactive' ? 'primary' : ''}`}
              onClick={() => setFilter('inactive')}
            >
              Inactive ({inactiveCount})
            </button>
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name, ID, or team..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ minWidth: '250px' }}
            />
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>Employee List ({filteredEmployees.length})</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>ID</th>
                <th>Name</th>
                <th>Current Team</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    No employees found
                  </td>
                </tr>
              )}
              {filteredEmployees.map(emp => (
                <tr 
                  key={emp.id}
                  style={emp.status === 'inactive' ? { backgroundColor: '#fee2e2', opacity: 0.7 } : {}}
                >
                  <td>{getStatusBadge(emp)}</td>
                  <td><strong>{emp.id}</strong></td>
                  <td>{emp.name}</td>
                  <td>
                    {emp.status === 'inactive' ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          value={reactivateTeam[emp.id] || ''}
                          onChange={(e) => setReactivateTeam(prev => ({ ...prev, [emp.id]: e.target.value }))}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#fef3c7',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="" disabled>Select team…</option>
                          {allTeams.map(team => (
                            <option key={team} value={team}>{team}</option>
                          ))}
                        </select>
                        <button
                          className="btn small"
                          onClick={() => reactivate(emp, reactivateTeam[emp.id])}
                          title="Reactivate employee"
                          style={{ background: '#10b981', color: '#fff' }}
                        >
                          Reactivate
                        </button>
                      </div>
                    ) : (
                      <select
                        value={emp.currentTeam || 'Unassigned'}
                        onChange={(e) => reassignEmployee(emp, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: emp.currentTeam === 'Unassigned' ? '#fef3c7' : '#e0e7ff',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        {allTeams.map(team => (
                          <option key={team} value={team}>{team}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {emp.status !== 'inactive' && (
                        <>
                          <button 
                            className="icon-btn tiny" 
                            onClick={() => setSendingPasswordTo({ id: emp.id, name: emp.name })}
                            title="Send password setup link"
                            style={{ color: 'var(--primary)' }}
                          >
                            <Mail size={14} />
                          </button>
                          <button 
                            className="icon-btn tiny" 
                            onClick={() => setEditingEmp({ id: emp.id, name: emp.name, currentTeam: emp.currentTeam })}
                            title="Edit employee"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="icon-btn danger tiny" 
                            onClick={() => deleteEmployee(emp)}
                            title="Deactivate employee"
                          >
                            <UserX size={14} />
                          </button>
                        </>
                      )}
                      {emp.status === 'inactive' && (
                        <span style={{ fontSize: '0.875rem', color: '#999', fontStyle: 'italic' }}>
                          Deactivated on {emp.deleted_at ? new Date(emp.deleted_at).toLocaleDateString() : 'N/A'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading && <div className="inline-loading">Loading employee data...</div>}
      
      {editingEmp && (
        <EditEmployeeModal
          employee={editingEmp}
          onSave={(name, id) => editEmployee(name, id)}
          onCancel={() => setEditingEmp(null)}
        />
      )}
      
      {sendingPasswordTo && (
        <SendPasswordLinkModal
          employee={sendingPasswordTo}
          onClose={() => setSendingPasswordTo(null)}
        />
      )}

      <style jsx>{`
        .employee-management-root {
          padding: 1rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-content {
          flex: 1;
        }
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
        }
        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }
        .card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .filter-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .search-box input {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
        }
        .badge-active {
          padding: 0.25rem 0.75rem;
          background-color: #dcfce7;
          color: #15803d;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-inactive {
          padding: 0.25rem 0.75rem;
          background-color: #fee2e2;
          color: #991b1b;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-warning {
          padding: 0.25rem 0.75rem;
          background-color: #fef3c7;
          color: #b45309;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }
          .search-box input {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
