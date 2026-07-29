import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { title:'', description:'', duration:'', fees:0, category:'', status:'active' };

function CourseModal({ course, onClose, onSave }) {
  const [form, setForm] = useState(course || EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = !!course?._id;
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = isEdit
        ? await api.put(`/courses/${course._id}`, form)
        : await api.post('/courses', form);
      onSave(data.data, isEdit);
      toast.success(isEdit ? 'Course updated' : 'Course created');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Edit Course' : 'Add New Course'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Course Title *</label>
              <input className="form-control" value={form.title} onChange={e=>set('title',e.target.value)} required placeholder="e.g. Full Stack Web Development" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-control" value={form.category} onChange={e=>set('category',e.target.value)} placeholder="e.g. Web Development" />
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input className="form-control" value={form.duration} onChange={e=>set('duration',e.target.value)} placeholder="e.g. 3 months" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fees (₹)</label>
                <input className="form-control" type="number" value={form.fees} onChange={e=>set('fees',Number(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e=>set('status',e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Course description..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update' : 'Create Course'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/courses', { params: { search } });
      setCourses(data.data);
    } catch { toast.error('Failed to load courses'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this course?')) return;
    try { await api.delete(`/courses/${id}`); toast.success('Deleted'); setCourses(p => p.filter(c => c._id !== id)); }
    catch { toast.error('Delete failed'); }
  };

  const handleSave = (c, isEdit) => {
    if (isEdit) setCourses(p => p.map(x => x._id === c._id ? c : x));
    else setCourses(p => [c, ...p]);
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Courses</h1><p>Manage training courses</p></div>
        <button className="btn btn-primary" onClick={() => setModal('add')}><Plus size={16}/> Add Course</button>
      </div>

      <div className="search-bar">
        <div className="search-input">
          <Search size={16}/><input placeholder="Search courses..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      {loading ? <div className="loading"><div className="spinner"/></div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:16 }}>
          {courses.map(c => (
            <div className="card" key={c._id}>
              <div style={{ padding:'20px 20px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <span className={`badge badge-${c.status==='active'?'success':'gray'}`}>{c.status}</span>
                <div className="action-btns">
                  <button className="icon-btn" onClick={()=>setModal(c)}><Edit2 size={14}/></button>
                  <button className="icon-btn danger" onClick={()=>handleDelete(c._id)}><Trash2 size={14}/></button>
                </div>
              </div>
              <div className="card-body">
                <div style={{ width:44, height:44, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:18, marginBottom:12 }}>
                  {c.title?.slice(0,1)}
                </div>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{c.title}</h3>
                <p style={{ fontSize:12, color:'#64748b', marginBottom:12, lineClamp:2 }}>{c.description || 'No description'}</p>
                <div style={{ display:'flex', gap:12, fontSize:12, color:'#64748b' }}>
                  <span>⏱ {c.duration || 'N/A'}</span>
                  <span>📁 {c.category || 'General'}</span>
                </div>
                <div style={{ marginTop:12, paddingTop:12, borderTop:'1px solid #f1f5f9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:18, fontWeight:800, color:'#6366f1' }}>₹{(c.fees||0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && <div className="empty-state"><p>No courses found</p></div>}
        </div>
      )}

      {modal && (
        <CourseModal
          course={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
