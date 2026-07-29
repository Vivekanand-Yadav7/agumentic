import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Building2, CalendarDays, DollarSign,
  Clock, Users, Settings, LogOut, ShieldCheck
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'RE';

  const isEmployer = user?.role === 'employer' || user?.role === 'admin';

  const NAV = [
    {
      label: 'MAIN',
      items: [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/projects', icon: Building2, label: 'Real Estate Projects' },
      ]
    },
    {
      label: 'WORKFORCE & HR',
      items: [
        { to: '/leaves', icon: CalendarDays, label: 'Leaves & Requests' },
        { to: '/payroll', icon: DollarSign, label: 'Payrolls & Salary' },
        { to: '/attendance', icon: Clock, label: 'Attendance' },
        ...(isEmployer ? [{ to: '/employees', icon: Users, label: 'Employee Directory' }] : [])
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
          <Building2 size={22} color="#ffffff" />
        </div>
        <div>
          <div className="logo-text" style={{ fontSize: 18, fontWeight: 800 }}>PropManage</div>
          <div className="logo-sub" style={{ fontSize: 11, color: '#94a3b8' }}>Real Estate ERP Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div key={section.label}>
            <div className="nav-section-title">{section.label}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="avatar" style={{ background: isEmployer ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          {initials}
        </div>
        <div className="user-info" style={{ flex: 1 }}>
          <div className="name" style={{ fontWeight: 600, fontSize: 13 }}>{user?.name}</div>
          <div className="role" style={{ fontSize: 11, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 4 }}>
            {isEmployer && <ShieldCheck size={12} color="#f59e0b" />}
            {user?.role || 'employee'}
          </div>
        </div>
        <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
