import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const TITLES = {
  '/': 'Dashboard Overview',
  '/projects': 'Real Estate Projects',
  '/leaves': 'Leaves & Absence Requests',
  '/payroll': 'Payrolls & Salary Slips',
  '/attendance': 'Attendance & Time Logs',
  '/employees': 'Employee Directory',
};

export default function Header() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'PropManage ERP';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'RE';

  return (
    <header className="header">
      <div>
        <div className="header-title">{title}</div>
      </div>
      <div className="header-right">
        <button style={{ background: 'none', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
          <Bell size={18} />
        </button>
        <div className="header-avatar" style={{ background: user?.role === 'employer' ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
          {initials}
        </div>
      </div>
    </header>
  );
}
