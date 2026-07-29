import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EMPTY = { title:'', description:'', batch:'', dueDate:'', totalMarks:100 };

function AssignmentModal({ assignment, batches, onClose, onSave }) {
  const [form, setForm] = useState(assignment ? {
    ...assignment,
    batch: assignment.batch?._id || assignment.batch || '',
    dueDate: assignment.dueDate ? assignment.dueDate.slice(0,10) : ''
  } : EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = !!assignment?._id;
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = isEdit
        ? await api.put(`/assignments/${assignment._id}`, form)
        : await api.post('/assignments', form);
      onSave(data.data, isEdit);
      toast.success(isEdit?'Updated':'Created');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message||'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit?'Edit Assignment':'New Assignment'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-control" value={form.title} onChange={e=>set('title',e.target.value)} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Batch *</label>
                <select className="form-control" value={form.batch} onChange={e=>set('batch',e.target.value)} required>
                  <option value="">Select Batch</option>
                  {batches.map(b=><option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input className="form-control" type="date" value={form.dueDate} onChange={e=>set('dueDate',e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Total Marks</label>
              <input className="form-control" type="number" value={form.totalMarks} onChange={e=>set('totalMarks',Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={e=>set('description',e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':isEdit?'Update':'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [batchFilter, setBatchFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/assignments', { params:{ batch:batchFilter } });
      setAssignments(data.data);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { api.get('/batches').then(r=>setBatches(r.data.data)); }, []);
  useEffect(() => { load(); }, [batchFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/assignments/${id}`); toast.success('Deleted'); setAssignments(p=>p.filter(a=>a._id!==id)); }
    catch { toast.error('Failed'); }
  };

  const handleSave = (a, isEdit) => {
    if (isEdit) setAssignments(p=>p.map(x=>x._id===a._id?a:x));
    else setAssignments(p=>[a,...p]);
  };

  const isPastDue = (d) => new Date(d) < new Date();

  return (
    <div>
      <div className="page-header">
        <div><h1>Assignments</h1><p>Manage batch assignments</p></div>
        <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={16}/> New Assignment</button>
      </div>

      <div className="card">
        <div className="card-header">
          <select className="form-control" style={{width:200}} value={batchFilter} onChange={e=>setBatchFilter(e.target.value)}>
            <option value="">All Batches</option>
            {batches.map(b=><option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="loading"><div className="spinner"/></div> : (
            <table>
              <thead><tr><th>Title</th><th>Batch</th><th>Due Date</th><th>Marks</th><th>Submissions</th><th>Actions</th></tr></thead>
              <tbody>
                {assignments.length===0 ? <tr><td colSpan={6}><div className="empty-state">No assignments</div></td></tr>
                : assignments.map(a=>(
                  <tr key={a._id}>
                    <td style={{fontWeight:600}}>{a.title}</td>
                    <td style={{fontSize:13}}>{a.batch?.name||'-'}</td>
                    <td>
                      <span style={{fontSize:13,color:isPastDue(a.dueDate)?'#ef4444':'#374151',fontWeight: isPastDue(a.dueDate)?600:400}}>
                        {a.dueDate ? format(new Date(a.dueDate), 'dd MMM yyyy') : '-'}
                      </span>
                      {isPastDue(a.dueDate) && <span className="badge badge-danger" style={{marginLeft:6,fontSize:10}}>Overdue</span>}
                    </td>
                    <td>{a.totalMarks}</td>
                    <td>{a.submissions?.length || 0}</td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" onClick={()=>setModal(a)}><Edit2 size={14}/></button>
                        <button className="icon-btn danger" onClick={()=>handleDelete(a._id)}><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && <AssignmentModal assignment={modal==='add'?null:modal} batches={batches} onClose={()=>setModal(null)} onSave={handleSave}/>}
    </div>
  );
}
