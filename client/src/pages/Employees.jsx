import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Users, Plus, Mail, Phone, Briefcase, DollarSign, Shield } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '123', phone: '', role: 'employee',
    department: 'Site Management', designation: 'Project Manager', salary: ''
  });

  const fetchEmployees = () => {
    api.get('/employees')
      .then(res => setEmployees(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', formData);
      setShowAddModal(false);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add employee');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Employee & Staff Directory</h1>
          <p>Manage all company employees, architects, site engineers, and role permissions</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={16} /> Add Staff Member
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Employee Roster</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Contact</th>
                <th>Department</th>
                <th>Designation</th>
                <th>System Role</th>
                <th>Monthly Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar-circle">
                        {e.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Joined {new Date(e.joiningDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5 }}>{e.email}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{e.phone || 'No phone'}</div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{e.department || 'General'}</td>
                  <td>{e.designation || 'Staff'}</td>
                  <td>
                    <span className={`badge badge-${e.role === 'employer' || e.role === 'admin' ? 'purple' : 'info'}`} style={{ textTransform: 'capitalize' }}>
                      {e.role}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{e.salary ? e.salary.toLocaleString() : '0'}</td>
                  <td>
                    <span className="badge badge-success">{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">Add Staff Member</h2>
              <button onClick={() => setShowAddModal(false)} className="modal-close">✕</button>
            </div>
            <form onSubmit={handleAddEmployee}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-control" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-control" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input type="text" className="form-control" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select className="form-control" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                      <option value="employee">Employee</option>
                      <option value="employer">Employer / Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Monthly Base Salary (INR)</label>
                    <input type="number" className="form-control" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Password</label>
                  <input type="text" className="form-control" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
