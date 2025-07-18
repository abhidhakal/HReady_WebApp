import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import '/src/pages/admin/styles/AdminAttendance.css';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
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

const Avatar = ({ name }) => (
  <div
    className="attendance-avatar"
  >
    {name && name.length > 0 ? name[0].toUpperCase() : '?'}
  </div>
);

const Card = ({ children, style }) => (
  <div
    className="attendance-card"
  >
    {children}
  </div>
);

const AdminAttendance = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [myRecord, setMyRecord] = useState(null);
  const [todayStatus, setTodayStatus] = useState('Not Checked In');
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // All records for employees
      const resAll = await api.get('/attendance/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceRecords(resAll.data);
    } catch (err) {
      console.error('Error fetching all attendance:', err);
      setAttendanceRecords([]);
    }

    try {
      // My own attendance record for today
      const resMine = await api.get('/attendance/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyRecord(resMine.data);

      if (resMine.data.check_in_time && !resMine.data.check_out_time) {
        setTodayStatus('Checked In');
      } else if (resMine.data.check_in_time && resMine.data.check_out_time) {
        setTodayStatus('Checked Out');
      } else {
        setTodayStatus('Not Checked In');
      }
    } catch (err) {
      console.error('Error fetching my attendance:', err);
      setMyRecord(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/checkin', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTodayStatus('Checked In');
      fetchData();
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
      fetchData();
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
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}/attendance`)}>Admin Attendance</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/tasks`)}>Manage Tasks</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/leaves`)}>Manage Leaves</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/announcements`)}>Manage Announcements</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/requests`)}>Requests</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/profile`)}>Profile</a></li>
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

        <div className="main-content attendance-page">
          <h2 style={{ marginBottom: 24 }}>Attendance Management</h2>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 20, fontWeight: 600 }}>My Attendance</span>
              <StatusChip status={todayStatus} />
            </div>
            {myRecord ? (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ color: '#607d8b', marginRight: 8 }}><i className="fas fa-calendar-alt"></i></span>
                  <span style={{ fontWeight: 500 }}>{new Date(myRecord.date).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: '#43a047', marginRight: 8 }}><i className="fas fa-sign-in-alt"></i></span>
                  <span style={{ fontWeight: 600 }}>Check In:</span>&nbsp;
                  <span>{myRecord.check_in_time ? new Date(myRecord.check_in_time).toLocaleTimeString() : '-'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: '#e53935', marginRight: 8 }}><i className="fas fa-sign-out-alt"></i></span>
                  <span style={{ fontWeight: 600 }}>Check Out:</span>&nbsp;
                  <span>{myRecord.check_out_time ? new Date(myRecord.check_out_time).toLocaleTimeString() : '-'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#fb8c00', marginRight: 8 }}><i className="fas fa-clock"></i></span>
                  <span style={{ fontWeight: 600 }}>Total Hours:</span>&nbsp;
                  <span>{myRecord.total_hours ? myRecord.total_hours.toFixed(2) : '-'}</span>
                </div>
              </div>
            ) : (
              <div style={{ color: '#888', display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ marginRight: 8 }}><i className="fas fa-info-circle"></i></span>
                No record for today.
              </div>
            )}
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <button
                className="attendance-btn"
                style={{ flex: 1, background: todayStatus === 'Not Checked In' ? '#1976d2' : '#bdbdbd', color: 'white', fontWeight: 600, padding: '12px 0', borderRadius: 8, border: 'none', fontSize: 16, cursor: todayStatus === 'Not Checked In' ? 'pointer' : 'not-allowed' }}
                onClick={handleCheckIn}
                disabled={todayStatus !== 'Not Checked In'}
              >
                <i className="fas fa-sign-in-alt" style={{ marginRight: 8 }}></i>Check In
              </button>
              <button
                className="attendance-btn"
                style={{ flex: 1, background: todayStatus === 'Checked In' ? '#1976d2' : '#bdbdbd', color: 'white', fontWeight: 600, padding: '12px 0', borderRadius: 8, border: 'none', fontSize: 16, cursor: todayStatus === 'Checked In' ? 'pointer' : 'not-allowed' }}
                onClick={handleCheckOut}
                disabled={todayStatus !== 'Checked In'}
              >
                <i className="fas fa-sign-out-alt" style={{ marginRight: 8 }}></i>Check Out
              </button>
            </div>
          </Card>

          <Card>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Employee Attendance Records</div>
            {attendanceRecords.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {attendanceRecords.map(record => (
                  <div key={record._id} className="attendance-list-item">
                    <Avatar name={record.user?.name || 'N/A'} />
                    <div className="attendance-info-main">
                      <div className="attendance-info-details">
                        <span><i className="fas fa-user" style={{ marginRight: 4 }}></i> {record.user?.name || 'N/A'}</span>
                        <span style={{ color: '#888', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>({record.user?.email || '-'})</span>
                      </div>
                      <div className="attendance-info-details">
                        <span><i className="fas fa-calendar-alt" style={{ marginRight: 4 }}></i> {new Date(record.date).toLocaleDateString()}</span>
                        <span><i className="fas fa-sign-in-alt" style={{ color: '#43a047', marginRight: 4 }}></i> {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '-'}</span>
                        <span><i className="fas fa-sign-out-alt" style={{ color: '#e53935', marginRight: 4 }}></i> {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-'}</span>
                        <StatusChip status={record.status} />
                        <span><i className="fas fa-clock" style={{ color: '#fb8c00', marginRight: 4 }}></i> {record.total_hours ? record.total_hours.toFixed(2) : '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="attendance-empty-state">
                <span><i className="fas fa-users-slash" style={{ fontSize: 32 }}></i></span>
                No employee attendance records found.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
