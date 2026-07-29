import { useEffect, useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, Calendar, UserCheck } from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const isEmployer = user?.role === 'employer' || user?.role === 'admin';

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);

  const fetchAttendance = () => {
    api.get('/attendance')
      .then(res => {
        setAttendance(res.data.data);
        const todayStr = new Date().toISOString().split('T')[0];
        const hasCheckIn = res.data.data.some(a => a.employeeId === user?.id && a.date.startsWith(todayStr));
        setCheckedInToday(hasCheckIn);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleMarkAttendance = async (status = 'present') => {
    try {
      await api.post('/attendance', { status });
      fetchAttendance();
      alert('Attendance marked successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Attendance & Time Tracking</h1>
          <p>{isEmployer ? 'Monitor daily employee clock-ins and site visits' : 'Mark your daily work attendance and view history'}</p>
        </div>
        {!isEmployer && (
          <button
            onClick={() => handleMarkAttendance('present')}
            disabled={checkedInToday}
            className={`btn ${checkedInToday ? 'btn-secondary' : 'btn-success'}`}
          >
            <Clock size={16} /> {checkedInToday ? 'Checked In Today ✓' : 'Mark Present Today'}
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Daily Attendance Logs ({new Date().toLocaleDateString()})</span>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {isEmployer && <th>Employee</th>}
                <th>Date</th>
                <th>Check-in Time</th>
                <th>Check-out Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(a => (
                <tr key={a.id}>
                  {isEmployer && (
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.employee?.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{a.employee?.designation}</div>
                    </td>
                  )}
                  <td style={{ fontWeight: 500 }}>{new Date(a.date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 600, color: '#0ea5e9' }}>{a.checkIn || '09:00 AM'}</td>
                  <td>{a.checkOut || '18:00 PM'}</td>
                  <td>
                    <span className={`badge badge-${a.status === 'present' ? 'success' : 'danger'}`} style={{ textTransform: 'capitalize' }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan={isEmployer ? 5 : 4} style={{ textAlign: 'center', color: '#94a3b8', padding: 30 }}>
                    No attendance records for today yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
