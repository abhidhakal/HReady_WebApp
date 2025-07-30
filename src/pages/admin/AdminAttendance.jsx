import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import './styles/AdminAttendance.css';
import api from '/src/api/api.js';
import Toast from '/src/components/Toast.jsx';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
import { useAuth } from '/src/hooks/useAuth.js';
import { useSidebar } from '../../hooks/useSidebar';
import { useToast } from '/src/hooks/useToast.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Skeleton from '@mui/material/Skeleton';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
// Import services
import { getAllAttendance, getAdminAttendance, adminCheckIn, adminCheckOut, getAllEmployees } from '/src/services/index.js';

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
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [myRecord, setMyRecord] = useState(null);
  const [todayStatus, setTodayStatus] = useState('Not Checked In');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const { getToken, logout } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const token = getToken();
  const navigate = useNavigate();

  const fetchData = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Fetch all employees first
      const employeesResult = await getAllEmployees();
      if (employeesResult.success) {
        setAllEmployees(employeesResult.data);
      } else {
        console.error('Error fetching employees:', employeesResult.error);
        setAllEmployees([]);
      }

      // Fetch today's attendance records
      const attendanceResult = await getAllAttendance();
      if (attendanceResult.success) {
        setAttendanceRecords(attendanceResult.data);
      } else {
        showError('Failed to fetch attendance records');
        console.error('Error fetching all attendance:', attendanceResult.error);
        setAttendanceRecords([]);
      }
    } catch (err) {
      showError('Failed to fetch data');
      console.error('Error fetching data:', err);
      setAttendanceRecords([]);
      setAllEmployees([]);
    }

    try {
      // My own attendance record for today
      const myResult = await getAdminAttendance();
      if (myResult.success) {
        setMyRecord(myResult.data);

        if (myResult.data.check_in_time && !myResult.data.check_out_time) {
          setTodayStatus('Checked In');
        } else if (myResult.data.check_in_time && myResult.data.check_out_time) {
          setTodayStatus('Checked Out');
        } else {
          setTodayStatus('Not Checked In');
        }
      } else {
        console.error('Error fetching my attendance:', myResult.error);
        setMyRecord(null);
      }
    } catch (err) {
      console.error('Error fetching my attendance:', err);
      setMyRecord(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

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
      const result = await adminCheckIn();
      if (result.success) {
        showSuccess('Check-in successful');
        setTodayStatus('Checked In');
        fetchData();
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
      const result = await adminCheckOut();
      if (result.success) {
        showSuccess('Check-out successful');
        setTodayStatus('Checked Out');
        fetchData();
      } else {
        showError('Failed to check out');
        console.error('Error during check-out:', result.error);
      }
    } catch (err) {
      showError('Failed to check out');
      console.error('Error during check-out:', err);
    }
  };

  // Create complete attendance view for selected date
  const getCompleteAttendanceView = () => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    
    // Get attendance records for selected date
    const dateAttendanceRecords = attendanceRecords.filter(record => {
      if (!record.date) return false;
      
      // Try different date formats and handle timezone issues
      let recordDate;
      try {
        recordDate = new Date(record.date);
        // Reset time to start of day for comparison
        recordDate.setHours(0, 0, 0, 0);
        
        const selectedDateStart = new Date(selectedDate);
        selectedDateStart.setHours(0, 0, 0, 0);
        

        
        return recordDate.getTime() === selectedDateStart.getTime();
      } catch (error) {
        console.error('Error parsing date:', record.date, error);
        return false;
      }
    });



    // Create complete attendance view
    const completeAttendanceView = allEmployees.map(employee => {
      // Try multiple ways to match employee with attendance record
      const attendanceRecord = dateAttendanceRecords.find(record => {
        // Check if record has user object with _id
        if (record.user && record.user._id === employee._id) {
          return true;
        }
        // Check if record has employeeId field
        if (record.employeeId === employee._id) {
          return true;
        }
        // Check if record has userId field
        if (record.userId === employee._id) {
          return true;
        }
        // Check if record has user field as string ID
        if (record.user === employee._id) {
          return true;
        }
        return false;
      });
      
      if (attendanceRecord) {
        // Employee has attendance record - present
        return {
          ...attendanceRecord,
          user: employee,
          status: attendanceRecord.check_out_time ? 'Checked Out' : 
                  attendanceRecord.check_in_time ? 'Checked In' : 'Present'
        };
      } else {
        // Employee has no attendance record - absent
        return {
          _id: `absent-${employee._id}`,
          user: employee,
          date: selectedDateStr,
          check_in_time: null,
          check_out_time: null,
          total_hours: 0,
          status: 'Absent'
        };
      }
    });

    return completeAttendanceView;
  };

  const completeAttendanceView = getCompleteAttendanceView();

  return (
    <div className="full-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
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
                onClick={handleLogoutClick}
              >
                Log Out
              </a>
            </li>
          </ul>
        </nav>

        <div className="main-content attendance-page">
          <h2 className="attendance-page-title">Attendance Management</h2>

          {loading && attendanceRecords.length === 0 && !myRecord ? (
            <div style={{ margin: '32px 0' }}>
              {/* Attendance Records Skeleton */}
              {[1, 2, 3, 4, 5].map(i => (
                <Card key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Skeleton variant="circular" width={40} height={40} style={{ marginRight: 16 }} />
                      <div style={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={24} style={{ marginBottom: 8 }} />
                        <Skeleton variant="text" width="40%" height={18} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <Skeleton variant="text" width={80} height={20} />
                      <Skeleton variant="rectangular" width={100} height={32} style={{ borderRadius: 16 }} />
                    </div>
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
            <div className="attendance-records-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <span>Employee Attendance Records</span>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={date => date && setSelectedDate(date)}
                  renderInput={params => <TextField {...params} size="small" style={{ minWidth: 140 }} />}
                />
              </LocalizationProvider>
            </div>
            {completeAttendanceView.length > 0 ? (
              <div className="attendance-records-container">
                {completeAttendanceView.map(record => (
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
                No employees found.
              </div>
            )}
          </Card>
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

export default AdminAttendance;
