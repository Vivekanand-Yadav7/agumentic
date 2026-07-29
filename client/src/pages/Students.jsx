import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Search, Edit2, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { name:'', email:'', phone:'', alternatePhone:'', gender:'male', address:'', city:'', state:'', pincode:'', qualification:'', occupation:'', course:'', batch:'', totalFees:0, notes:'', referredBy:'' };

function StudentModal({ student, courses, batches, onClose, onSave }) {
  const [form, setForm] = useState(student || EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = !!student?._id;

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        const { data } = await api.put(`/students/${student._id}`, form);
        onSave(data.data, true);
        toast.success('Student updated');
      } else {
        const { data } = await api.post('/students', form);
        onSave(data.data, false);
        toast.success('Student added');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving student');
    } finally { setSaving(false); }
  };

  const filteredBatches = form.course ? batches.filter(b => b.course?._id === form.course || b.course === form.course) : batches;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Student' : 'Add New Student'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.name} onChange={e=>set('name',e.target.value)} required placeholder="Student name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required placeholder="Email address" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-control" value={form.phone} onChange={e=>set('phone',e.target.value)} required placeholder="Phone number" />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-control" value={form.gender} onChange={e=>set('gender',e.target.value)}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course</label>
                <select className="form-control" value={form.course} onChange={e=>{set('course',e.target.value); set('batch','');}}>
                  <option value="">Select Course</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Batch</label>
                <select className="form-control" value={form.batch} onChange={e=>set('batch',e.target.value)}>
                  <option value="">Select Batch</option>
                  {filteredBatches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-control" value={form.city} onChange={e=>set('city',e.target.value)} placeholder="City" />
              </div>
              <div className="form-group">
                <label className="form-label">Qualification</label>
                <input className="form-control" value={form.qualification} onChange={e=>set('qualification',e.target.value)} placeholder="Qualification" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Total Fees (₹)</label>
                <input className="form-control" type="number" value={form.totalFees} onChange={e=>set('totalFees',Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Referred By</label>
                <input className="form-control" value={form.referredBy} onChange={e=>set('referredBy',e.target.value)} placeholder="Referral source" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-control" value={form.address} onChange={e=>set('address',e.target.value)} placeholder="Full address" />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-control" rows={2} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder="Any notes..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update' : 'Add Student'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Students() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | student object
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/students', { params });
      setStudents(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load students'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    api.get('/courses').then(r => setCourses(r.data.data));
    api.get('/batches').then(r => setBatches(r.data.data));
  }, []);

  useEffect(() => { load(1); setPage(1); }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      load(page);
    } catch { toast.error('Delete failed'); }
  };

  const handleSave = (student, isEdit) => {
    if (isEdit) setStudents(p => p.map(s => s._id === student._id ? student : s));
    else load(1);
  };

  const feeColor = { paid: 'success', partial: 'warning', pending: 'danger' };
  const statusColor = { active: 'success', inactive: 'gray', completed: 'info', dropped: 'danger' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Students</h1>
          <p>Manage all enrolled students</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{ margin: 0, flex: 1 }}>
            <div className="search-input" style={{ maxWidth: 320 }}>
              <Search size={16} />
              <input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width: 140 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
              <option value="dropped">Dropped</option>
            </select>
          </div>
          <span className="badge badge-info">{pagination.total || 0} total</span>
        </div>

        <div className="table-wrapper">
          {loading ? <div className="loading"><div className="spinner"/></div> : (
            <table>
              <thead>
                <tr>
                  <th>Student</th><th>Contact</th><th>Course</th><th>Batch</th>
                  <th>Fee Status</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state">No students found</div></td></tr>
                ) : students.map(s => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                        <div className="avatar-circle">{s.name?.slice(0,2).toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight:600 }}>{s.name}</div>
                          <div style={{ fontSize:11, color:'#94a3b8' }}>{s.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize:13 }}>{s.email}</div>
                      <div style={{ fontSize:11, color:'#94a3b8' }}>{s.phone}</div>
                    </td>
                    <td style={{ fontSize:13 }}>{s.course?.title || '-'}</td>
                    <td style={{ fontSize:13 }}>{s.batch?.name || '-'}</td>
                    <td><span className={`badge badge-${feeColor[s.feeStatus] || 'gray'}`}>{s.feeStatus}</span></td>
                    <td><span className={`badge badge-${statusColor[s.status] || 'gray'}`}>{s.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" onClick={() => setModal(s)} title="Edit"><Edit2 size={14} /></button>
                        <button className="icon-btn danger" onClick={() => handleDelete(s._id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              Showing {((page-1)*10)+1}–{Math.min(page*10, pagination.total)} of {pagination.total}
            </span>
            <div className="pagination-controls">
              {Array.from({length: pagination.pages}, (_, i) => i+1).map(p => (
                <button key={p} className={`page-btn${page===p?' active':''}`} onClick={() => { setPage(p); load(p); }}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <StudentModal
          student={modal === 'add' ? null : modal}
          courses={courses}
          batches={batches}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
