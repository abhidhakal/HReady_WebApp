import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import '/src/pages/employee/styles/EmployeeAttendance.css';
import logo from '/src/assets/primary_icon.webp';
import '@fortawesome/fontawesome-free/css/all.min.css';

const statusColor = status => {
  switch ((status || '').toLowerCase()) {
    case 'present':
    case 'checked in':
      return '#4caf50';
    case 'absent':
    case 'not checked in':
      return '#f44336';
    case 'checked out':
      return '#2196f3';
    default:
      return '#9e9e9e';
  }
};

const StatusChip = ({ status }) => (
  <span
    className={`attendance-status-chip ${statusColor(status)}`}
  >
    {status}
  </span>
);

const Card = ({ children, style }) => (
  <div
    className="attendance-card"
  >
    {children}
  </div>
);

const EmployeeAttendance = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [todayStatus, setTodayStatus] = useState('Not Checked In');
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendanceRecord(res.data);

        if (res.data.check_in_time && !res.data.check_out_time) {
          setTodayStatus('Checked In');
        } else if (res.data.check_in_time && res.data.check_out_time) {
          setTodayStatus('Checked Out');
        } else {
          setTodayStatus('Not Checked In');
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setAttendanceRecord(null);
      }
    };

    fetchAttendance();
  }, [navigate]);

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/checkin', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTodayStatus('Checked In');
      window.location.reload();
    } catch (err) {
      console.error('Error during check-in:', err);
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.put('/attendance/checkout', { date: new Date() }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTodayStatus('Checked Out');
      window.location.reload();
    } catch (err) {
      console.error('Error during check-out:', err);
    }
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={toggleSidebar} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a onClick={() => navigate(`/employee/${id}`)}>Dashboard</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/employee/${id}/attendance`)}>Attendance</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/payroll`)}>My Payroll</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/tasks`)}>Tasks</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/leave`)}>Leave</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/announcements`)}>Announcements</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/requests`)}>Requests</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/profile`)}>Profile</a></li>
            <li>
              <a
                className="nav-logout"
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
              >
                Log Out
              </a>
            </li>
          </ul>
        </nav>

        <div className="main-content attendance-page" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ marginBottom: 24 }}>My Attendance</h2>
          <Card>
            <div className="attendance-header">
              <span className="attendance-header-title">Today</span>
              <StatusChip status={todayStatus} />
            </div>
            {attendanceRecord ? (
              <div className="attendance-details">
                <div className="attendance-date">
                  <span className="attendance-date-icon"><i className="fas fa-calendar-alt"></i></span>
                  <span className="attendance-date-text">{new Date(attendanceRecord.date).toLocaleDateString()}</span>
                </div>
                <div className="attendance-check-in">
                  <span className="attendance-check-in-icon"><i className="fas fa-sign-in-alt"></i></span>
                  <span className="attendance-check-in-label">Check In:</span>&nbsp;
                  <span className="attendance-check-in-time">{attendanceRecord.check_in_time ? new Date(attendanceRecord.check_in_time).toLocaleTimeString() : '-'}</span>
                </div>
                <div className="attendance-check-out">
                  <span className="attendance-check-out-icon"><i className="fas fa-sign-out-alt"></i></span>
                  <span className="attendance-check-out-label">Check Out:</span>&nbsp;
                  <span className="attendance-check-out-time">{attendanceRecord.check_out_time ? new Date(attendanceRecord.check_out_time).toLocaleTimeString() : '-'}</span>
                </div>
                <div className="attendance-total-hours">
                  <span className="attendance-total-hours-icon"><i className="fas fa-clock"></i></span>
                  <span className="attendance-total-hours-label">Total Hours:</span>&nbsp;
                  <span className="attendance-total-hours-value">{attendanceRecord.total_hours ? attendanceRecord.total_hours.toFixed(2) : '-'}</span>
                </div>
              </div>
            ) : (
              <div className="attendance-empty-state">
                <span className="attendance-empty-state-icon"><i className="fas fa-info-circle"></i></span>
                No record for today.
              </div>
            )}
            <div className="attendance-actions">
              <button
                className={`attendance-btn ${todayStatus === 'Not Checked In' ? 'checked-in-btn' : ''}`}
                onClick={handleCheckIn}
                disabled={todayStatus !== 'Not Checked In'}
              >
                <i className="fas fa-sign-in-alt" style={{ marginRight: 8 }}></i>Check In
              </button>
              <button
                className={`attendance-btn ${todayStatus === 'Checked In' ? 'checked-in-btn' : ''}`}
                onClick={handleCheckOut}
                disabled={todayStatus !== 'Checked In'}
              >
                <i className="fas fa-sign-out-alt" style={{ marginRight: 8 }}></i>Check Out
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
