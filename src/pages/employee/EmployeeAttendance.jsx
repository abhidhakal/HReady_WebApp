import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import '/src/pages/employee/styles/EmployeeAttendance.css';
// import logo from '../../assets/primary_icon.webp';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '/src/hooks/useAuth.js';
import { useToast } from '/src/hooks/useToast.js';
import Toast from '/src/components/Toast.jsx';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
// Import services
import { getMyAttendance, checkIn, checkOut } from '/src/services/index.js';

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
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const [myRecord, setMyRecord] = useState(null);
  const [todayStatus, setTodayStatus] = useState('Not Checked In');
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { getToken, logout } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const result = await getMyAttendance();
      if (result.success) {
        setMyRecord(result.data);
        if (result.data.check_in_time && !result.data.check_out_time) {
          setTodayStatus('Checked In');
        } else if (result.data.check_in_time && result.data.check_out_time) {
          setTodayStatus('Checked Out');
        } else {
          setTodayStatus('Not Checked In');
        }
      } else {
        if (result.error?.response?.status === 404) {
          setMyRecord(null); // No record for today
        } else {
          showError('Failed to fetch attendance data');
          console.error('Error fetching attendance:', result.error);
        }
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      showError('Failed to fetch attendance data');
    }
    setLoading(false);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    fetchAttendance();
  }, [navigate, getToken, showError]);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout(
      navigate,
      () => showSuccess('Logged out successfully'),
      (error) => showError('Logout completed with warnings')
    );
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleCheckIn = async () => {
    try {
      const result = await checkIn();
      if (result.success) {
        showSuccess('Check-in successful');
        setTodayStatus('Checked In');
        fetchAttendance();
      } else {
        showError('Failed to check in');
        console.error('Error during check-in:', result.error);
      }
    } catch (err) {
      showError('Failed to check in');
      console.error('Error during check-in:', err);
    }
  };

  const handleCheckOut = async () => {
    try {
      const result = await checkOut();
      if (result.success) {
        showSuccess('Check-out successful');
        setTodayStatus('Checked Out');
        fetchAttendance();
      } else {
        showError('Failed to check out');
        console.error('Error during check-out:', result.error);
      }
    } catch (err) {
      showError('Failed to check out');
      console.error('Error during check-out:', err);
    }
  };

  return (
    <div className="full-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      <DashboardHeader onToggleSidebar={toggleSidebar} userRole="employee" />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
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
                onClick={handleLogoutClick}
              >
                Log Out
              </a>
            </li>
          </ul>
        </nav>
        <div className="main-content attendance-page" style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ marginBottom: 24 }}>My Attendance</h2>
          {loading ? (
            <Card>
              <div style={{ padding: 16, border: '1px solid #e1e5e9', borderRadius: 8, marginBottom: 12 }}>
                <Skeleton variant="text" width={60} height={24} style={{ marginBottom: 12 }} />
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <Skeleton variant="circular" width={48} height={48} style={{ marginRight: 16 }} />
                  <Skeleton variant="text" width={80} height={32} />
                </div>
                <Skeleton variant="text" width={40} height={16} style={{ marginTop: 12 }} />
              </div>
            </Card>
          ) : (
            <Card>
              <div className="attendance-header">
                <span className="attendance-header-title">Today</span>
                <StatusChip status={todayStatus} />
              </div>
              {myRecord ? (
                <div className="attendance-details">
                  <div className="attendance-date">
                    <span className="attendance-date-icon"><i className="fas fa-calendar-alt"></i></span>
                    <span className="attendance-date-text">{new Date(myRecord.date).toLocaleDateString()}</span>
                  </div>
                  <div className="attendance-check-in">
                    <span className="attendance-check-in-icon"><i className="fas fa-sign-in-alt"></i></span>
                    <span className="attendance-check-in-label">Check In:</span>&nbsp;
                    <span className="attendance-check-in-time">{myRecord.check_in_time ? new Date(myRecord.check_in_time).toLocaleTimeString() : '-'}</span>
                  </div>
                  <div className="attendance-check-out">
                    <span className="attendance-check-out-icon"><i className="fas fa-sign-out-alt"></i></span>
                    <span className="attendance-check-out-label">Check Out:</span>&nbsp;
                    <span className="attendance-check-out-time">{myRecord.check_out_time ? new Date(myRecord.check_out_time).toLocaleTimeString() : '-'}</span>
                  </div>
                  <div className="attendance-total-hours">
                    <span className="attendance-total-hours-icon"><i className="fas fa-clock"></i></span>
                    <span className="attendance-total-hours-label">Total Hours:</span>&nbsp;
                    <span className="attendance-total-hours-value">{myRecord.total_hours ? myRecord.total_hours.toFixed(2) : '-'}</span>
                  </div>
                </div>
              ) : (
                <div className="attendance-empty-state">
                  <span className="attendance-empty-state-icon"><i className="fas fa-info-circle"></i></span>
                  No attendance record for today.
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
          )}
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
};

export default EmployeeAttendance;
