import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Plus, CheckCircle, Clock, FileText } from 'lucide-react';

export default function Payroll() {
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer' || user?.role === 'admin';

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: '',
    hra: '',
    allowances: '',
    deductions: '',
    tax: '',
    status: 'pending',
    remarks: ''
  });

  const fetchPayrolls = () => {
    api.get('/payroll')
      .then(res => setPayrolls(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchEmployees = () => {
    if (isEmployer) {
      api.get('/employees').then(res => setEmployees(res.data.data)).catch(() => {});
    }
  };

  useEffect(() => {
    fetchPayrolls();
    fetchEmployees();
  }, []);

  const handleCreatePayroll = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payroll', formData);
      setShowGenerateModal(false);
      fetchPayrolls();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate payroll');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/payroll/${id}/status`, { status });
      fetchPayrolls();
    } catch (err) {
      alert('Failed to update payroll status');
    }
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Payrolls & Salary Management</h1>
          <p>{isEmployer ? 'Generate monthly payrolls and process employee salary payments' : 'View your monthly salary slips and payment history'}</p>
        </div>
        {isEmployer && (
          <button onClick={() => setShowGenerateModal(true)} className="btn btn-primary">
            <Plus size={16} /> Process Monthly Payroll
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Salary Slips & Disbursals</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {isEmployer && <th>Employee</th>}
                <th>Period</th>
                <th>Basic Salary</th>
                <th>Allowances / HRA</th>
                <th>Deductions & Tax</th>
                <th>Net Disbursed</th>
                <th>Status</th>
                {isEmployer && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {payrolls.map(p => (
                <tr key={p.id}>
                  {isEmployer && (
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.employee?.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{p.employee?.designation}</div>
                    </td>
                  )}
                  <td style={{ fontWeight: 600 }}>
                    {monthNames[p.month - 1]} {p.year}
                  </td>
                  <td>₹{p.basicSalary?.toLocaleString()}</td>
                  <td>₹{((p.hra || 0) + (p.allowances || 0)).toLocaleString()}</td>
                  <td style={{ color: '#ef4444' }}>-₹{((p.deductions || 0) + (p.tax || 0)).toLocaleString()}</td>
                  <td style={{ fontWeight: 800, fontSize: 14, color: '#15803d' }}>
                    ₹{p.netSalary?.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge badge-${p.status === 'paid' ? 'success' : 'warning'}`}>
                      {p.status}
                    </span>
                  </td>
                  {isEmployer && (
                    <td>
                      {p.status === 'pending' ? (
                        <button onClick={() => handleUpdateStatus(p.id, 'paid')} className="btn btn-sm btn-success">
                          <CheckCircle size={12} /> Mark Paid
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Paid on {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'N/A'}</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {payrolls.length === 0 && (
                <tr>
                  <td colSpan={isEmployer ? 8 : 7} style={{ textAlign: 'center', color: '#94a3b8', padding: 30 }}>
                    No payroll records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 550 }}>
            <div className="modal-header">
              <h2 className="modal-title">Generate Salary Slip</h2>
              <button onClick={() => setShowGenerateModal(false)} className="modal-close">✕</button>
            </div>
            <form onSubmit={handleCreatePayroll}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Employee</label>
                  <select
                    className="form-control"
                    required
                    value={formData.employeeId}
                    onChange={e => {
                      const emp = employees.find(x => x.id === e.target.value);
                      setFormData({
                        ...formData,
                        employeeId: e.target.value,
                        basicSalary: emp?.salary ? Math.round(emp.salary * 0.6) : '',
                        hra: emp?.salary ? Math.round(emp.salary * 0.2) : ''
                      });
                    }}
                  >
                    <option value="">-- Select Employee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation || 'Staff'})</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Month</label>
                    <select className="form-control" value={formData.month} onChange={e => setFormData({ ...formData, month: parseInt(e.target.value) })}>
                      {monthNames.map((m, idx) => (
                        <option key={m} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input type="number" className="form-control" value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Basic Salary (INR)</label>
                    <input type="number" className="form-control" required value={formData.basicSalary} onChange={e => setFormData({ ...formData, basicSalary: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">HRA (INR)</label>
                    <input type="number" className="form-control" value={formData.hra} onChange={e => setFormData({ ...formData, hra: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Other Allowances</label>
                    <input type="number" className="form-control" value={formData.allowances} onChange={e => setFormData({ ...formData, allowances: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deductions (Provident Fund/Leaves)</label>
                    <input type="number" className="form-control" value={formData.deductions} onChange={e => setFormData({ ...formData, deductions: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Status</label>
                  <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowGenerateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Payroll</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
