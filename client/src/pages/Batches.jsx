import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Edit2, Trash2, Search, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTS = ['upcoming','ongoing','completed','cancelled'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const EMPTY = { name:'', batchCode:'', course:'', trainer:'', startDate:'', endDate:'', timing:'', days:[], maxStudents:20, status:'upcoming', description:'' };

function BatchModal({ batch, courses, trainers, onClose, onSave }) {
  const [form, setForm] = useState(batch ? {
    ...batch,
    course: batch.course?._id || batch.course || '',
    trainer: batch.trainer?._id || batch.trainer || '',
    startDate: batch.startDate ? batch.startDate.slice(0,10) : '',
    endDate: batch.endDate ? batch.endDate.slice(0,10) : '',
  } : EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = !!batch?._id;
  const set = (k,v) => setForm(p => ({...p, [k]:v}));
  const toggleDay = (d) => set('days', form.days.includes(d) ? form.days.filter(x=>x!==d) : [...form.days, d]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = isEdit
        ? await api.put(`/batches/${batch._id}`, form)
        : await api.post('/batches', form);
      onSave(data.data, isEdit);
      toast.success(isEdit ? 'Batch updated' : 'Batch created');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:680}}>
        <div className="modal-header">
          <span className="modal-title">{isEdit?'Edit Batch':'New Batch'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Batch Name *</label>
                <input className="form-control" value={form.name} onChange={e=>set('name',e.target.value)} required placeholder="e.g. MERN Batch July 2024" />
              </div>
              <div className="form-group">
                <label className="form-label">Batch Code</label>
                <input className="form-control" value={form.batchCode} onChange={e=>set('batchCode',e.target.value)} placeholder="Auto-generated if empty" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course *</label>
                <select className="form-control" value={form.course} onChange={e=>set('course',e.target.value)} required>
                  <option value="">Select Course</option>
                  {courses.map(c=><option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Trainer</label>
                <select className="form-control" value={form.trainer} onChange={e=>set('trainer',e.target.value)}>
                  <option value="">Select Trainer</option>
                  {trainers.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input className="form-control" type="date" value={form.startDate} onChange={e=>set('startDate',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input className="form-control" type="date" value={form.endDate} onChange={e=>set('endDate',e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Timing</label>
                <input className="form-control" value={form.timing} onChange={e=>set('timing',e.target.value)} placeholder="e.g. 9:00 AM - 12:00 PM" />
              </div>
              <div className="form-group">
                <label className="form-label">Max Students</label>
                <input className="form-control" type="number" value={form.maxStudents} onChange={e=>set('maxStudents',Number(e.target.value))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Days</label>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {DAYS.map(d=>(
                  <button key={d} type="button"
                    onClick={()=>toggleDay(d)}
                    style={{
                      padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight:600, cursor:'pointer',
                      background: form.days.includes(d) ? '#6366f1' : '#f1f5f9',
                      color: form.days.includes(d) ? 'white' : '#64748b',
                      border: `1.5px solid ${form.days.includes(d) ? '#6366f1' : '#e2e8f0'}`
                    }}
                  >{d}</button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e=>set('status',e.target.value)}>
                  {STATUS_OPTS.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':isEdit?'Update':'Create Batch'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/batches', { params: { search, status: statusFilter } });
      setBatches(data.data);
    } catch { toast.error('Failed to load batches'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    api.get('/courses').then(r=>setCourses(r.data.data));
    api.get('/users', { params:{role:'trainer'} }).then(r=>setTrainers(r.data.data)).catch(()=>{});
  }, []);
  useEffect(() => { load(); }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete batch?')) return;
    try { await api.delete(`/batches/${id}`); toast.success('Deleted'); setBatches(p=>p.filter(b=>b._id!==id)); }
    catch { toast.error('Delete failed'); }
  };

  const handleSave = (b, isEdit) => {
    if (isEdit) setBatches(p=>p.map(x=>x._id===b._id?b:x));
    else setBatches(p=>[b,...p]);
  };

  const statusColor = { ongoing:'success', upcoming:'info', completed:'gray', cancelled:'danger' };

  return (
    <div>
      <div className="page-header">
        <div><h1>Batches</h1><p>Manage training batches</p></div>
        <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={16}/> New Batch</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{margin:0,flex:1}}>
            <div className="search-input" style={{maxWidth:280}}>
              <Search size={16}/><input placeholder="Search batches..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="form-control" style={{width:140}} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {STATUS_OPTS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="loading"><div className="spinner"/></div> : (
            <table>
              <thead><tr><th>Batch</th><th>Course</th><th>Trainer</th><th>Timing</th><th>Students</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {batches.length===0 ? <tr><td colSpan={7}><div className="empty-state">No batches found</div></td></tr>
                : batches.map(b=>(
                  <tr key={b._id}>
                    <td>
                      <div style={{fontWeight:600}}>{b.name}</div>
                      <div style={{fontSize:11,color:'#94a3b8'}}>{b.batchCode}</div>
                    </td>
                    <td style={{fontSize:13}}>{b.course?.title||'-'}</td>
                    <td style={{fontSize:13}}>{b.trainer?.name||'-'}</td>
                    <td>
                      <div style={{fontSize:12}}>{b.timing||'-'}</div>
                      <div style={{fontSize:11,color:'#94a3b8'}}>{b.days?.join(', ')||''}</div>
                    </td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:4}}>
                        <Users size={12} color="#94a3b8"/>
                        <span style={{fontSize:13}}>{b.students?.length||0} / {b.maxStudents}</span>
                      </div>
                    </td>
                    <td><span className={`badge badge-${statusColor[b.status]||'gray'}`}>{b.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" onClick={()=>setModal(b)}><Edit2 size={14}/></button>
                        <button className="icon-btn danger" onClick={()=>handleDelete(b._id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && <BatchModal batch={modal==='add'?null:modal} courses={courses} trainers={trainers} onClose={()=>setModal(null)} onSave={handleSave}/>}
    </div>
  );
}
