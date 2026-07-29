import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, Users, MapPin, DollarSign, Calendar, Trash2, Edit3, UserPlus } from 'lucide-react';

export default function Projects() {
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer' || user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '', description: '', location: '', type: 'residential',
    status: 'ongoing', startDate: '', endDate: '', budget: '',
    clientName: '', clientPhone: '', priority: 'medium', progress: 0
  });

  const [assignData, setAssignData] = useState({ employeeId: '', role: 'member' });

  const fetchProjects = () => {
    api.get('/projects')
      .then(res => setProjects(res.data.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchEmployees = () => {
    if (isEmployer) {
      api.get('/employees').then(res => setEmployees(res.data.data)).catch(() => {});
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    try {
      if (selectedProject) {
        await api.put(`/projects/${selectedProject.id}`, formData);
      } else {
        await api.post('/projects', formData);
      }
      setShowModal(false);
      setSelectedProject(null);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${selectedProject.id}/assign`, assignData);
      setShowAssignModal(false);
      fetchProjects();
    } catch (err) {
      alert('Failed to assign employee');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Real Estate Projects</h1>
          <p>{isEmployer ? 'Manage all construction and property developments' : 'Your assigned real estate projects'}</p>
        </div>
        {isEmployer && (
          <button
            onClick={() => {
              setSelectedProject(null);
              setFormData({
                title: '', description: '', location: '', type: 'residential',
                status: 'ongoing', startDate: '', endDate: '', budget: '',
                clientName: '', clientPhone: '', priority: 'medium', progress: 0
              });
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} /> Create Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {projects.map(p => (
          <div className="card" key={p.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="card-header" style={{ alignItems: 'flex-start' }}>
              <div>
                <span className="card-title" style={{ fontSize: 16 }}>{p.title}</span>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{p.type}</span>
                  <span className={`badge badge-${p.status === 'completed' ? 'success' : p.status === 'ongoing' ? 'purple' : 'warning'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
              {isEmployer && (
                <div className="action-btns">
                  <button
                    onClick={() => {
                      setSelectedProject(p);
                      setFormData({
                        title: p.title, description: p.description || '', location: p.location || '',
                        type: p.type || 'residential', status: p.status || 'ongoing',
                        startDate: p.startDate ? p.startDate.split('T')[0] : '',
                        endDate: p.endDate ? p.endDate.split('T')[0] : '',
                        budget: p.budget || '', clientName: p.clientName || '',
                        clientPhone: p.clientPhone || '', priority: p.priority || 'medium', progress: p.progress || 0
                      });
                      setShowModal(true);
                    }}
                    className="icon-btn"
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="icon-btn danger" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.4 }}>{p.description || 'No description provided.'}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                  <MapPin size={14} color="#0ea5e9" /> {p.location || 'N/A'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontWeight: 600 }}>
                  <DollarSign size={14} color="#22c55e" /> ₹{(p.budget ? p.budget.toLocaleString() : '0')}
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, fontWeight: 600 }}>
                  <span>Completion</span>
                  <span>{p.progress || 0}%</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${p.progress || 0}%`, height: '100%', background: 'linear-gradient(90deg, #0ea5e9, #6366f1)', borderRadius: 4 }} />
                </div>
              </div>

              {/* Assigned Employees */}
              <div style={{ marginTop: 'auto', paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Assigned Team</span>
                  {isEmployer && (
                    <button
                      onClick={() => {
                        setSelectedProject(p);
                        setShowAssignModal(true);
                      }}
                      style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <UserPlus size={12} /> Assign
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.assignments?.map(a => (
                    <span key={a.employee?.id || Math.random()} className="badge badge-gray" style={{ fontSize: 11 }}>
                      👤 {a.employee?.name} ({a.role})
                    </span>
                  ))}
                  {(!p.assignments || p.assignments.length === 0) && (
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>No team assigned yet</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">{selectedProject ? 'Edit Project' : 'Create Real Estate Project'}</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
            </div>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Project Title</label>
                  <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-control" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Property Type</label>
                    <select className="form-control" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land / Plot</option>
                      <option value="rental">Rental Complex</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Budget (INR)</label>
                    <input type="number" className="form-control" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Progress (%)</label>
                    <input type="number" min="0" max="100" className="form-control" value={formData.progress} onChange={e => setFormData({ ...formData, progress: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Client / Developer Name</label>
                    <input type="text" className="form-control" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="planning">Planning</option>
                      <option value="ongoing">Ongoing Work</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Employee Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h2 className="modal-title">Assign Team Member</h2>
              <button onClick={() => setShowAssignModal(false)} className="modal-close">✕</button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Employee</label>
                  <select className="form-control" required value={assignData.employeeId} onChange={e => setAssignData({ ...assignData, employeeId: e.target.value })}>
                    <option value="">-- Choose Employee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation || 'Staff'})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Project Role</label>
                  <select className="form-control" value={assignData.role} onChange={e => setAssignData({ ...assignData, role: e.target.value })}>
                    <option value="lead">Project Lead</option>
                    <option value="member">Team Member</option>
                    <option value="architect">Architect</option>
                    <option value="supervisor">Site Supervisor</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Assign Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
