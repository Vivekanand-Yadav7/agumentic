import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Search, Edit2, Trash2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_OPTS = ['new','contacted','interested','enrolled','not_interested','follow_up'];
const SOURCE_OPTS = ['walk-in','phone','website','social_media','referral','other'];
const EMPTY = { name:'', email:'', phone:'', course:'', source:'walk-in', status:'new', message:'', followUpDate:'' };

function EnquiryModal({ enquiry, onClose, onSave }) {
  const [form, setForm] = useState(enquiry ? {
    ...enquiry,
    followUpDate: enquiry.followUpDate ? enquiry.followUpDate.slice(0,10) : ''
  } : EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = !!enquiry?._id;
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = isEdit
        ? await api.put(`/enquiries/${enquiry._id}`, form)
        : await api.post('/enquiries', form);
      onSave(data.data, isEdit);
      toast.success(isEdit ? 'Enquiry updated' : 'Enquiry added');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message||'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit?'Edit Enquiry':'New Enquiry'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-control" value={form.name} onChange={e=>set('name',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-control" value={form.phone} onChange={e=>set('phone',e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email} onChange={e=>set('email',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Interested Course</label>
                <input className="form-control" value={form.course} onChange={e=>set('course',e.target.value)} placeholder="Course name" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Source</label>
                <select className="form-control" value={form.source} onChange={e=>set('source',e.target.value)}>
                  {SOURCE_OPTS.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e=>set('status',e.target.value)}>
                  {STATUS_OPTS.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
            </div>
            {form.status === 'follow_up' && (
              <div className="form-group">
                <label className="form-label">Follow-up Date</label>
                <input className="form-control" type="date" value={form.followUpDate} onChange={e=>set('followUpDate',e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Message / Notes</label>
              <textarea className="form-control" rows={3} value={form.message} onChange={e=>set('message',e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':isEdit?'Update':'Add Enquiry'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const load = async (p=1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/enquiries', { params:{ search, status:statusFilter, page:p, limit:10 } });
      setEnquiries(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load enquiries'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(1); setPage(1); }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete enquiry?')) return;
    try { await api.delete(`/enquiries/${id}`); toast.success('Deleted'); setEnquiries(p=>p.filter(e=>e._id!==id)); }
    catch { toast.error('Delete failed'); }
  };

  const handleSave = (e, isEdit) => {
    if (isEdit) setEnquiries(p=>p.map(x=>x._id===e._id?e:x));
    else load(1);
  };

  const statusColor = {
    new:'info', contacted:'warning', interested:'purple',
    enrolled:'success', not_interested:'gray', follow_up:'danger'
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Enquiries</h1><p>Manage leads and enquiries</p></div>
        <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={16}/> Add Enquiry</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{margin:0,flex:1}}>
            <div className="search-input" style={{maxWidth:280}}>
              <Search size={16}/><input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="form-control" style={{width:160}} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {STATUS_OPTS.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
          </div>
          <span className="badge badge-info">{pagination.total||0} total</span>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="loading"><div className="spinner"/></div> : (
            <table>
              <thead><tr><th>Name</th><th>Contact</th><th>Course</th><th>Source</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {enquiries.length===0 ? <tr><td colSpan={7}><div className="empty-state">No enquiries found</div></td></tr>
                : enquiries.map(e=>(
                  <tr key={e._id}>
                    <td style={{fontWeight:600}}>{e.name}</td>
                    <td>
                      <div style={{fontSize:13}}>{e.phone}</div>
                      <div style={{fontSize:11,color:'#94a3b8'}}>{e.email}</div>
                    </td>
                    <td style={{fontSize:13}}>{e.course||'-'}</td>
                    <td><span className="badge badge-gray">{e.source?.replace('_',' ')}</span></td>
                    <td><span className={`badge badge-${statusColor[e.status]||'gray'}`}>{e.status?.replace('_',' ')}</span></td>
                    <td style={{fontSize:12,color:'#64748b'}}>{e.createdAt?format(new Date(e.createdAt),'dd MMM yy'):'-'}</td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" onClick={()=>setModal(e)}><Edit2 size={14}/></button>
                        <button className="icon-btn danger" onClick={()=>handleDelete(e._id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {pagination.pages>1 && (
          <div className="pagination">
            <span className="pagination-info">Page {page} of {pagination.pages}</span>
            <div className="pagination-controls">
              {Array.from({length:pagination.pages},(_,i)=>i+1).map(p=>(
                <button key={p} className={`page-btn${page===p?' active':''}`} onClick={()=>{setPage(p);load(p);}}>{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && <EnquiryModal enquiry={modal==='add'?null:modal} onClose={()=>setModal(null)} onSave={handleSave}/>}
    </div>
  );
}
