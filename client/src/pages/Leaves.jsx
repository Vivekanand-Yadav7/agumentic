import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, Plus, Check, X, Clock, AlertCircle } from 'lucide-react';

export default function Leaves() {
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer' || user?.role === 'admin';

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const [formData, setFormData] = useState({
    type: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchLeaves = () => {
    api.get('/leaves')
      .then(res => setLeaves(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', formData);
      setShowApplyModal(false);
      setFormData({ type: 'casual', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit leave application');
    }
  };

  const handleReviewLeave = async (id, status) => {
    const remarks = prompt(`Add optional remark for ${status}:`);
    try {
      await api.put(`/leaves/${id}/review`, { status, remarks });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update leave');
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return;
    try {
      await api.delete(`/leaves/${id}`);
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel leave');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Leave & Absence Management</h1>
          <p>{isEmployer ? 'Review and manage workforce leave requests' : 'Apply for leave and track approval status'}</p>
        </div>
        {!isEmployer && (
          <button onClick={() => setShowApplyModal(true)} className="btn btn-primary">
            <Plus size={16} /> Apply for Leave
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Leave Applications List</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {isEmployer && <th>Employee</th>}
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.id}>
                  {isEmployer && (
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{l.employee?.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{l.employee?.designation || l.employee?.department || 'Staff'}</div>
                    </td>
                  )}
                  <td>
                    <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>{l.type}</span>
                  </td>
                  <td style={{ fontSize: 12.5 }}>
                    {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                  </td>
                  <td style={{ fontWeight: 700 }}>{l.days} Days</td>
                  <td style={{ fontSize: 13, color: '#475569', maxWidth: 220 }}>{l.reason}</td>
                  <td>
                    <span className={`badge badge-${l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td>
                    {isEmployer ? (
                      l.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleReviewLeave(l.id, 'approved')} className="btn btn-sm btn-success">
                            <Check size={12} /> Approve
                          </button>
                          <button onClick={() => handleReviewLeave(l.id, 'rejected')} className="btn btn-sm btn-danger">
                            <X size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>Reviewed</span>
                      )
                    ) : (
                      l.status === 'pending' && (
                        <button onClick={() => handleCancelLeave(l.id)} className="btn btn-sm btn-secondary">
                          Cancel
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={isEmployer ? 7 : 6} style={{ textAlign: 'center', color: '#94a3b8', padding: 30 }}>
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 className="modal-title">Apply for Leave</h2>
              <button onClick={() => setShowApplyModal(false)} className="modal-close">✕</button>
            </div>
            <form onSubmit={handleApplyLeave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select className="form-control" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-control" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-control" required value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Reason for Absence</label>
                  <textarea className="form-control" rows="3" required placeholder="Describe the reason for leave..." value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowApplyModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
