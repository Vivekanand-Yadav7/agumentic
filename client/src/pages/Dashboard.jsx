import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import {
  Building2, Users, CalendarDays, DollarSign, Clock,
  CheckCircle2, XCircle, AlertCircle, ArrowUpRight, TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchDashboard = () => {
    api.get('/dashboard')
      .then(res => { setData(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleReviewLeave = async (leaveId, status) => {
    setProcessingId(leaveId);
    try {
      await api.put(`/leaves/${leaveId}/review`, { status });
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating leave');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state"><p>Failed to load dashboard data</p></div>;

  const { dashboardType, stats, recentProjects, pendingLeaveList, recentEmployees, recentLeaves, payrolls } = data;

  // ─────────────────────────────────────────────────────────────
  // EMPLOYEE DASHBOARD
  // ─────────────────────────────────────────────────────────────
  if (dashboardType === 'employee') {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1>Employee Portal</h1>
            <p>Track your assigned real estate projects, leaves, and salary slips</p>
          </div>
          <Link to="/leaves" className="btn btn-primary">
            <CalendarDays size={16} /> Apply for Leave
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card" style={{ '--accent-color': '#0ea5e9', '--icon-bg': '#e0f2fe' }}>
            <div className="stat-icon"><Building2 size={24} color="#0ea5e9" /></div>
            <div>
              <div className="stat-value">{stats.myProjects || 0}</div>
              <div className="stat-label">Assigned Projects</div>
            </div>
          </div>

          <div className="stat-card" style={{ '--accent-color': '#f59e0b', '--icon-bg': '#fef3c7' }}>
            <div className="stat-icon"><CalendarDays size={24} color="#f59e0b" /></div>
            <div>
              <div className="stat-value">{stats.pendingLeaves || 0}</div>
              <div className="stat-label">Pending Leave Requests</div>
            </div>
          </div>

          <div className="stat-card" style={{ '--accent-color': '#22c55e', '--icon-bg': '#dcfce7' }}>
            <div className="stat-icon"><DollarSign size={24} color="#22c55e" /></div>
            <div>
              <div className="stat-value">₹{stats.netSalary ? stats.netSalary.toLocaleString() : 0}</div>
              <div className="stat-label">Latest Net Salary</div>
            </div>
          </div>

          <div className="stat-card" style={{ '--accent-color': '#6366f1', '--icon-bg': '#e0e7ff' }}>
            <div className="stat-icon"><Clock size={24} color="#6366f1" /></div>
            <div>
              <div className="stat-value">{stats.presentDays || 0} Days</div>
              <div className="stat-label">Present This Month</div>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="dashboard-grid">
          {/* Assigned Real Estate Projects */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">My Real Estate Projects</span>
              <Link to="/projects" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Project Name</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProjects?.map(item => {
                    const p = item.project || item;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.title}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>Client: {p.clientName || 'N/A'}</div>
                        </td>
                        <td style={{ fontSize: 12 }}>{p.location}</td>
                        <td>
                          <span className="badge badge-info">{p.type}</span>
                        </td>
                        <td style={{ width: 120 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${p.progress || 0}%`, height: '100%', background: '#0ea5e9' }} />
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 700 }}>{p.progress || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {(!recentProjects || recentProjects.length === 0) && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No assigned projects found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Leave Requests */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">My Recent Leave Requests</span>
              <Link to="/leaves" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaves?.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{l.type}</td>
                      <td style={{ fontSize: 12 }}>
                        {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 600 }}>{l.days}</td>
                      <td>
                        <span className={`badge badge-${l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'}`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!recentLeaves || recentLeaves.length === 0) && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No leave applications yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // EMPLOYER / ADMIN DASHBOARD
  // ─────────────────────────────────────────────────────────────
  const statCards = [
    { label: 'Active Employees', value: stats.totalEmployees || 0, icon: Users, color: '#6366f1', bg: '#e0e7ff' },
    { label: 'Real Estate Projects', value: stats.totalProjects || 0, icon: Building2, color: '#0ea5e9', bg: '#e0f2fe' },
    { label: 'Pending Leave Approvals', value: stats.pendingLeaves || 0, icon: CalendarDays, color: '#f59e0b', bg: '#fef3c7' },
    { label: 'Ongoing Site Works', value: stats.ongoingProjects || 0, icon: TrendingUp, color: '#22c55e', bg: '#dcfce7' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Employer Management Dashboard</h1>
          <p>Real Estate Projects Overview, Employee Leaves, and Payroll Management</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/projects" className="btn btn-primary">
            <Building2 size={16} /> Add New Project
          </Link>
          <Link to="/employees" className="btn btn-secondary">
            <Users size={16} /> Add Employee
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {statCards.map(s => (
          <div className="stat-card" key={s.label} style={{ '--accent-color': s.color, '--icon-bg': s.bg }}>
            <div className="stat-icon">
              <s.icon size={24} color={s.color} />
            </div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Real Estate Projects Overview */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Active Real Estate Projects</span>
            <Link to="/projects" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>Manage All →</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Type & Location</th>
                  <th>Budget</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects?.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{p.title}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Client: {p.clientName || 'Private'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{p.location}</div>
                      <span className="badge badge-gray" style={{ fontSize: 10 }}>{p.type}</span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: 13 }}>₹{(p.budget / 100000).toFixed(1)} L</td>
                    <td>
                      <span className={`badge badge-${p.status === 'completed' ? 'success' : p.status === 'ongoing' ? 'info' : 'warning'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!recentProjects || recentProjects.length === 0) && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>No active projects found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Employee Leaves */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pending Employee Leave Requests</span>
            <Link to="/leaves" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Days</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaveList?.map(l => (
                  <tr key={l.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{l.employee?.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{l.employee?.designation}</div>
                    </td>
                    <td>
                      <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>{l.type}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{l.days}d</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          disabled={processingId === l.id}
                          onClick={() => handleReviewLeave(l.id, 'approved')}
                          className="btn btn-sm btn-success"
                          style={{ padding: '3px 8px', fontSize: 11 }}
                        >
                          Approve
                        </button>
                        <button
                          disabled={processingId === l.id}
                          onClick={() => handleReviewLeave(l.id, 'rejected')}
                          className="btn btn-sm btn-danger"
                          style={{ padding: '3px 8px', fontSize: 11 }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!pendingLeaveList || pendingLeaveList.length === 0) && (
                  <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No pending leave requests to review 🎉</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
