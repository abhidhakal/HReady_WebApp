import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '/src/api/api.js';
import '/src/pages/admin/styles/AdminAttendance.css';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
// import logo from '../../assets/primary_icon.webp';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Skeleton from '@mui/material/Skeleton';

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
      <DashboardHeader onToggleSidebar={toggleSidebar} userRole="admin" />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={'/assets/images/primary_icon.webp'} alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/payroll`)}>Payroll Management</a></li>
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
          <h2 className="attendance-page-title">Attendance Management</h2>

          {attendanceRecords.length === 0 && !myRecord ? (
            <div style={{ margin: '32px 0' }}>
              {[1,2,3].map(i => (
                <Card key={i}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={18} />
                    <Skeleton variant="text" width="80%" height={18} />
                    <Skeleton variant="rectangular" width="100%" height={40} style={{ margin: '12px 0' }} />
                  </div>
                </Card>
              ))}
            </div>
          ) : null}

          <Card>
            <div className="attendance-header">
              <span className="attendance-title">My Attendance</span>
              <StatusChip status={todayStatus} />
            </div>
            {myRecord ? (
              <div className="attendance-details">
                <div className="attendance-detail-row">
                  <span className="attendance-icon calendar"><i className="fas fa-calendar-alt"></i></span>
                  <span className="attendance-label">{new Date(myRecord.date).toLocaleDateString()}</span>
                </div>
                <div className="attendance-detail-row">
                  <span className="attendance-icon checkin"><i className="fas fa-sign-in-alt"></i></span>
                  <span className="attendance-label">Check In:</span>&nbsp;
                  <span>{myRecord.check_in_time ? new Date(myRecord.check_in_time).toLocaleTimeString() : '-'}</span>
                </div>
                <div className="attendance-detail-row">
                  <span className="attendance-icon checkout"><i className="fas fa-sign-out-alt"></i></span>
                  <span className="attendance-label">Check Out:</span>&nbsp;
                  <span>{myRecord.check_out_time ? new Date(myRecord.check_out_time).toLocaleTimeString() : '-'}</span>
                </div>
                <div className="attendance-detail-row">
                  <span className="attendance-icon hours"><i className="fas fa-clock"></i></span>
                  <span className="attendance-label">Total Hours:</span>&nbsp;
                  <span>{myRecord.total_hours ? myRecord.total_hours.toFixed(2) : '-'}</span>
                </div>
              </div>
            ) : (
              <div className="attendance-no-record">
                <span className="attendance-info-icon"><i className="fas fa-info-circle"></i></span>
                No record for today.
              </div>
            )}
            <div className="attendance-buttons">
              <button
                className={`attendance-btn ${todayStatus === 'Not Checked In' ? 'active' : 'disabled'}`}
                onClick={handleCheckIn}
                disabled={todayStatus !== 'Not Checked In'}
              >
                <i className="fas fa-sign-in-alt"></i>Check In
              </button>
              <button
                className={`attendance-btn ${todayStatus === 'Checked In' ? 'active' : 'disabled'}`}
                onClick={handleCheckOut}
                disabled={todayStatus !== 'Checked In'}
              >
                <i className="fas fa-sign-out-alt"></i>Check Out
              </button>
            </div>
          </Card>

          <Card>
            <div className="attendance-records-title">Employee Attendance Records</div>
            {attendanceRecords.length > 0 ? (
              <div className="attendance-records-container">
                {attendanceRecords.map(record => (
                  <div key={record._id} className="attendance-list-item">
                    <Avatar name={record.user?.name || 'N/A'} />
                    <div className="attendance-info-main">
                      <div className="attendance-info-details">
                        <span className="attendance-user-name"><i className="fas fa-user"></i> {record.user?.name || 'N/A'}</span>
                        <span className="attendance-user-email">({record.user?.email || '-'})</span>
                      </div>
                      <div className="attendance-info-details">
                        <span className="attendance-meta-item"><i className="fas fa-calendar-alt"></i> {new Date(record.date).toLocaleDateString()}</span>
                        <span className="attendance-meta-item checkin-time"><i className="fas fa-sign-in-alt"></i> {record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '-'}</span>
                        <span className="attendance-meta-item checkout-time"><i className="fas fa-sign-out-alt"></i> {record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-'}</span>
                        <StatusChip status={record.status} />
                        <span className="attendance-meta-item hours"><i className="fas fa-clock"></i> {record.total_hours ? record.total_hours.toFixed(2) : '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="attendance-empty-state">
                <span className="attendance-empty-icon"><i className="fas fa-users-slash"></i></span>
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
