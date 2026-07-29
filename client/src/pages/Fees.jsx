import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Search, Edit2, Trash2, IndianRupee, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PAYMENT_MODES = ['cash','online','cheque','bank_transfer','upi'];
const EMPTY = { student:'', batch:'', course:'', amount:'', paymentMode:'cash', transactionId:'', purpose:'Course Fee', remarks:'' };

function FeeModal({ students, batches, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleStudentChange = (id) => {
    const s = students.find(x=>x._id===id);
    set('student', id);
    if (s?.batch) set('batch', s.batch?._id || s.batch);
    if (s?.course) set('course', s.course?._id || s.course);
    if (s) set('amount', Math.max(0, s.totalFees - s.paidFees));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.post('/fees', form);
      onSave(data.data);
      toast.success('Fee recorded');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message||'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Collect Fee</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Student *</label>
              <select className="form-control" value={form.student} onChange={e=>handleStudentChange(e.target.value)} required>
                <option value="">Select Student</option>
                {students.map(s=><option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input className="form-control" type="number" value={form.amount} onChange={e=>set('amount',e.target.value)} required min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select className="form-control" value={form.paymentMode} onChange={e=>set('paymentMode',e.target.value)}>
                  {PAYMENT_MODES.map(m=><option key={m} value={m}>{m.replace('_',' ').toUpperCase()}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Purpose</label>
                <input className="form-control" value={form.purpose} onChange={e=>set('purpose',e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Transaction ID</label>
                <input className="form-control" value={form.transactionId} onChange={e=>set('transactionId',e.target.value)} placeholder="Optional" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Remarks</label>
              <textarea className="form-control" rows={2} value={form.remarks} onChange={e=>set('remarks',e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':'Collect Fee'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const load = async (p=1) => {
    setLoading(true);
    try {
      const { data } = await api.get('/fees', { params:{ page:p, limit:10 } });
      setFees(data.data);
      setPagination(data.pagination);
      setTotalRevenue(data.totalRevenue);
    } catch { toast.error('Failed to load fees'); }
    finally { setLoading(false); }
  };

  useEffect(() => { api.get('/students', { params:{limit:1000} }).then(r=>setStudents(r.data.data)); }, []);
  useEffect(() => { load(1); }, []);

  const handleSave = () => load(1);

  const modeColor = { cash:'success', online:'info', upi:'purple', cheque:'warning', bank_transfer:'gray' };

  return (
    <div>
      <div className="page-header">
        <div><h1>Fee Management</h1><p>Track student payments</p></div>
        <button className="btn btn-primary" onClick={()=>setModal(true)}><Plus size={16}/> Collect Fee</button>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:20}}>
        <div className="stat-card" style={{'--accent-color':'#22c55e','--icon-bg':'#dcfce7'}}>
          <div className="stat-icon"><IndianRupee size={24} color="#22c55e"/></div>
          <div><div className="stat-value">₹{(totalRevenue||0).toLocaleString()}</div><div className="stat-label">Total Collected</div></div>
        </div>
        <div className="stat-card" style={{'--accent-color':'#6366f1','--icon-bg':'#e0e7ff'}}>
          <div className="stat-icon"><FileText size={24} color="#6366f1"/></div>
          <div><div className="stat-value">{pagination.total||0}</div><div className="stat-label">Transactions</div></div>
        </div>
        <div className="stat-card" style={{'--accent-color':'#ef4444','--icon-bg':'#fee2e2'}}>
          <div className="stat-icon"><IndianRupee size={24} color="#ef4444"/></div>
          <div><div className="stat-value">-</div><div className="stat-label">Pending (All Students)</div></div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          {loading ? <div className="loading"><div className="spinner"/></div> : (
            <table>
              <thead><tr><th>Receipt</th><th>Student</th><th>Amount</th><th>Mode</th><th>Purpose</th><th>Date</th></tr></thead>
              <tbody>
                {fees.length===0 ? <tr><td colSpan={6}><div className="empty-state">No fee records</div></td></tr>
                : fees.map(f=>(
                  <tr key={f._id}>
                    <td><span style={{fontWeight:600,color:'#6366f1'}}>{f.receiptNumber}</span></td>
                    <td>
                      <div style={{fontWeight:600,fontSize:13}}>{f.student?.name||'-'}</div>
                      <div style={{fontSize:11,color:'#94a3b8'}}>{f.student?.studentId}</div>
                    </td>
                    <td style={{fontWeight:700,color:'#22c55e',fontSize:15}}>₹{(f.amount||0).toLocaleString()}</td>
                    <td><span className={`badge badge-${modeColor[f.paymentMode]||'gray'}`}>{f.paymentMode?.replace('_',' ')}</span></td>
                    <td style={{fontSize:13}}>{f.purpose}</td>
                    <td style={{fontSize:12,color:'#64748b'}}>{f.paymentDate?format(new Date(f.paymentDate),'dd MMM yyyy'):'-'}</td>
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

      {modal && <FeeModal students={students} onClose={()=>setModal(false)} onSave={handleSave}/>}
    </div>
  );
}
