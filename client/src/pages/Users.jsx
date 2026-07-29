import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EMPTY = { name:'', email:'', password:'', phone:'', role:'trainer', status:'active', qualification:'', address:'' };

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user || EMPTY);
  const [saving, setSaving] = useState(false);
  const isEdit = !!user?._id;
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      const { data } = isEdit
        ? await api.put(`/users/${user._id}`, payload)
        : await api.post('/users', payload);
      onSave(data.data, isEdit);
      toast.success(isEdit ? 'User updated' : 'User created');
      onClose();
    } catch (err) { toast.error(err.response?.data?.message||'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit?'Edit User':'Add Staff Member'}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.name} onChange={e=>set('name',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-control" type="email" value={form.email} onChange={e=>set('email',e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{isEdit ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <input className="form-control" type="password" value={form.password} onChange={e=>set('password',e.target.value)} required={!isEdit} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e=>set('phone',e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-control" value={form.role} onChange={e=>set('role',e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="trainer">Trainer</option>
                </select>
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
              <label className="form-label">Qualification</label>
              <input className="form-control" value={form.qualification} onChange={e=>set('qualification',e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Saving...':isEdit?'Update':'Add User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params:{ search, role:roleFilter } });
      setUsers(data.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [search, roleFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await api.delete(`/users/${id}`); toast.success('Deleted'); setUsers(p=>p.filter(u=>u._id!==id)); }
    catch (err) { toast.error(err.response?.data?.message||'Delete failed'); }
  };

  const handleSave = (u, isEdit) => {
    if (isEdit) setUsers(p=>p.map(x=>x._id===u._id?u:x));
    else setUsers(p=>[u,...p]);
  };

  const roleColor = { admin:'purple', trainer:'info' };

  return (
    <div>
      <div className="page-header">
        <div><h1>Staff & Users</h1><p>Manage admins and trainers</p></div>
        <button className="btn btn-primary" onClick={()=>setModal('add')}><Plus size={16}/> Add User</button>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar" style={{margin:0,flex:1}}>
            <div className="search-input" style={{maxWidth:280}}>
              <Search size={16}/><input placeholder="Search users..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="form-control" style={{width:140}} value={roleFilter} onChange={e=>setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="trainer">Trainer</option>
            </select>
          </div>
        </div>
        <div className="table-wrapper">
          {loading ? <div className="loading"><div className="spinner"/></div> : (
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {users.length===0 ? <tr><td colSpan={6}><div className="empty-state">No users found</div></td></tr>
                : users.map(u=>(
                  <tr key={u._id}>
                    <td>
                      <div style={{display:'flex',gap:10,alignItems:'center'}}>
                        <div className="avatar-circle">{u.name?.slice(0,2).toUpperCase()}</div>
                        <div style={{fontWeight:600}}>{u.name} {u._id===me?._id&&<span style={{fontSize:11,color:'#6366f1'}}>(you)</span>}</div>
                      </div>
                    </td>
                    <td style={{fontSize:13}}>{u.email}</td>
                    <td style={{fontSize:13}}>{u.phone||'-'}</td>
                    <td><span className={`badge badge-${roleColor[u.role]||'gray'}`}>{u.role}</span></td>
                    <td><span className={`badge badge-${u.status==='active'?'success':'gray'}`}>{u.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" onClick={()=>setModal(u)}><Edit2 size={14}/></button>
                        {u._id !== me?._id && <button className="icon-btn danger" onClick={()=>handleDelete(u._id)}><Trash2 size={14}/></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modal && <UserModal user={modal==='add'?null:modal} onClose={()=>setModal(null)} onSave={handleSave}/>}
    </div>
  );
}
