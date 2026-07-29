import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name||'', phone: user?.phone||'', address: user?.address||'' });
  const [passwords, setPasswords] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.put('/users/profile', profile);
      updateUser(data.data);
      toast.success('Profile updated');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    setChangingPwd(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully');
      setPasswords({ currentPassword:'', newPassword:'', confirmPassword:'' });
    } catch (err) { toast.error(err.response?.data?.message||'Error'); }
    finally { setChangingPwd(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Settings</h1><p>Manage your account settings</p></div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
        {/* Profile */}
        <div className="card">
          <div className="card-header"><span className="card-title">Profile Settings</span></div>
          <form onSubmit={handleProfile}>
            <div className="card-body">
              <div style={{textAlign:'center',marginBottom:24}}>
                <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:800,color:'white',margin:'0 auto 12px'}}>
                  {user?.name?.slice(0,2).toUpperCase()}
                </div>
                <div style={{fontWeight:700,fontSize:16}}>{user?.name}</div>
                <div style={{fontSize:13,color:'#64748b'}}>{user?.role}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" value={user?.email} disabled style={{background:'#f8fafc',color:'#94a3b8'}} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-control" value={profile.address} onChange={e=>setProfile(p=>({...p,address:e.target.value}))} />
              </div>
            </div>
            <div style={{padding:'0 20px 20px'}}>
              <button type="submit" className="btn btn-primary" style={{width:'100%'}} disabled={saving}>{saving?'Saving...':'Save Profile'}</button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header"><span className="card-title">Change Password</span></div>
          <form onSubmit={handlePassword}>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-control" type="password" value={passwords.currentPassword} onChange={e=>setPasswords(p=>({...p,currentPassword:e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-control" type="password" value={passwords.newPassword} onChange={e=>setPasswords(p=>({...p,newPassword:e.target.value}))} required minLength={6} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input className="form-control" type="password" value={passwords.confirmPassword} onChange={e=>setPasswords(p=>({...p,confirmPassword:e.target.value}))} required />
              </div>
              <div style={{background:'#f0f9ff',borderRadius:8,padding:'12px 16px',fontSize:13,color:'#0369a1'}}>
                Password must be at least 6 characters long.
              </div>
            </div>
            <div style={{padding:'0 20px 20px'}}>
              <button type="submit" className="btn btn-primary" style={{width:'100%'}} disabled={changingPwd}>{changingPwd?'Changing...':'Change Password'}</button>
            </div>
          </form>
        </div>
      </div>

      {/* System Info */}
      <div className="card" style={{marginTop:24}}>
        <div className="card-header"><span className="card-title">System Information</span></div>
        <div className="card-body">
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {[
              { label:'Application', value:'Shilabs Academy Management' },
              { label:'Version', value:'1.0.0' },
              { label:'Stack', value:'MongoDB + Express + React + Node' },
            ].map(info=>(
              <div key={info.label} style={{background:'#f8fafc',borderRadius:8,padding:'14px 16px'}}>
                <div style={{fontSize:12,color:'#94a3b8',marginBottom:4}}>{info.label}</div>
                <div style={{fontWeight:600,fontSize:13}}>{info.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
