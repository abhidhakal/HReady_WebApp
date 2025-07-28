import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import '../../pages/admin/styles/Dashboard.css';
import api from '/src/api/api.js';
import Toast from '/src/components/Toast.jsx';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
// import logo from '../../assets/primary_icon.webp';
import { secureLogout } from '/src/auth/authService.js';
import { getApiBaseUrl } from '../../utils/env';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';
import { useApi } from '../../hooks/useApi';

function AdminDashboard() {
  const { id } = useParams();
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const [name, setName] = useState('Admin');
  const [profilePicture, setProfilePicture] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('Not Done');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [employeeCount, setEmployeeCount] = useState(0);
  const [todayOverview, setTodayOverview] = useState({ active: 0, onLeave: 0, absent: 0 });
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  // Derived loading state from useApi hooks
  const loading = employeesLoading || leavesLoading || announcementsLoading || tasksLoading;

  const token = localStorage.getItem('token');
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // useApi hooks for admin dashboard data
  const { data: announcements, loading: announcementsLoading, error: announcementsError } = useApi({
    url: '/announcements',
    headers
  });
  const { data: employees, loading: employeesLoading, error: employeesError } = useApi({
    url: '/employees',
    headers
  });
  const { data: leaves, loading: leavesLoading, error: leavesError } = useApi({
    url: '/leaves/all',
    headers
  });
  const { data: tasks, loading: tasksLoading, error: tasksError } = useApi({
    url: '/tasks',
    headers
  });

  // Set employeeCount and todayOverview when employees data changes
  useEffect(() => {
    if (employees && Array.isArray(employees)) {
      setEmployeeCount(employees.length);
      let active = 0, onLeave = 0, absent = 0;
      employees.forEach(emp => {
        if (emp.status?.toLowerCase() === 'active') active++;
        else if (emp.status?.toLowerCase() === 'on leave') onLeave++;
        else if (emp.status?.toLowerCase() === 'absent') absent++;
      });
      setTodayOverview({ active, onLeave, absent });
    }
  }, [employees]);

  // Set pendingLeaveRequests when leaves data changes
  useEffect(() => {
    if (leaves && Array.isArray(leaves)) {
      const pendingCount = leaves.filter(leave => leave.status?.toLowerCase() === 'pending').length;
      setPendingLeaveRequests(pendingCount);
    }
  }, [leaves]);

  // Remove old useEffect and state for announcements, employees, leaves, tasks
  // ... existing code ...

  const resolveProfilePicture = (picture) => {
    console.log('resolveProfilePicture called with:', picture);
    if (!picture) {
      console.log('No picture, returning default');
      return '/assets/images/profile.svg';
    }
    const base = getApiBaseUrl().replace(/\/api$/, '');
    console.log('API base URL:', base);
    if (picture.startsWith('/uploads')) {
      const fullUrl = `${base}/api${picture}`;
      console.log('Upload path, returning:', fullUrl);
      return fullUrl;
    }
    if (picture.startsWith('http')) {
      console.log('HTTP URL, returning as-is:', picture);
      return picture;
    }
    console.log('Unknown format, returning default');
    return '/assets/images/profile.svg';
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await secureLogout(
      navigate,
      () => setToast({ message: 'Logged out successfully', type: 'success' }),
      (error) => setToast({ message: 'Logout completed with warnings', type: 'warning' })
    );
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    api.get('/admins/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        console.log('Admin data received:', res.data);
        setName(res.data.name || 'Admin');
        setProfilePicture(res.data.profilePicture || '');
        console.log('Profile picture set to:', res.data.profilePicture || '');
      })
      .catch(() => {
        setName('Admin');
        setProfilePicture('');
      });
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    api.get('/attendance/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (res.data?.check_out_time) setAttendanceStatus('Checked Out');
        else if (res.data?.check_in_time) setAttendanceStatus('Checked In');
        else setAttendanceStatus('Not Done');
      })
      .catch(err => {
        if (err.response?.status === 404) setAttendanceStatus('Not Done');
      });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="full-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      <DashboardHeader onToggleSidebar={toggleSidebar} userRole="admin" />

      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/payroll`)}>Payroll Management</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/attendance`)}>Admin Attendance</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/tasks`)}>Manage Tasks</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/leaves`)}>Leaves</a></li>
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

        <div className="main-content">
          <div className="welcome-banner">
            <div className="banner-left">
              <div className="profile-picture">
                <img
                  src={resolveProfilePicture(profilePicture)}
                  alt="Admin Profile"
                  onLoad={() => console.log('Profile image loaded successfully')}
                  onError={(e) => {
                    console.error('Profile image failed to load:', e.target.src);
                    console.error('Error details:', e);
                  }}
                />
              </div>
              <h2 className="employee-name">Hello, {name}</h2>
            </div>
            <div className="banner-middle">
              <p>
                Your Today's Attendance:{" "}
                <span className={
                  attendanceStatus === 'Checked In' || attendanceStatus === 'Checked Out'
                    ? 'status-done'
                    : 'status-not-done'
                }>
                  {attendanceStatus}
                </span>
              </p>
              <small
                className="go-attendance-label"
                onClick={() => navigate(`/admin/${id}/attendance`)}
              >
                click here to complete attendance
              </small>
            </div>
            <div className="banner-right">
              <button
                className="edit-profile"
                onClick={() => navigate(`/admin/${id}/profile`)}
              >
                Edit Admin Profile
              </button>
            </div>
          </div>

          {/* Info Cards Section */}
          {loading ? (
            <div className="info-cards">
              {[1,2,3,4].map(i => (
                <div className="info-card" key={i}>
                  <Skeleton variant="text" width={60} height={24} style={{ marginBottom: 12 }} />
                  <Skeleton variant="rectangular" width={80} height={32} />
                  <Skeleton variant="text" width={40} height={16} style={{ marginTop: 12 }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="info-cards">
              {/* Place your real info cards here, each with className="info-card" */}
              {/* Example: */}
              <div className="info-card overview-card">
                  <h2>Today's Overview</h2>
                  <div className="overview-content">
                    <div className="overview-item">
                      <i className="fas fa-user-check"></i>
                      <span className="overview-label">Active:</span>
                      <span className="overview-value">{todayOverview.active}</span>
                    </div>
                    <div className="overview-item">
                      <i className="fas fa-umbrella-beach"></i>
                      <span className="overview-label">On Leave:</span>
                      <span className="overview-value">{todayOverview.onLeave}</span>
                    </div>
                    <div className="overview-item">
                      <i className="fas fa-user-times"></i>
                      <span className="overview-label">Absent:</span>
                      <span className="overview-value">{todayOverview.absent}</span>
                    </div>
                  </div>
                </div>
                <div className="info-card employees-card">
                  <h2>Total Employees</h2>
                  <div className="employees-content">
                    <div className="employees-header">
                      <i className="fas fa-users"></i>
                      <span className="employees-count">{employeeCount}</span>
                    </div>
                    <button 
                      className="view-employees-btn"
                      onClick={() => navigate(`/admin/${id}/employees`)}
                    >
                      Manage
                    </button>
                  </div>
                </div>
                <div className="info-card leave-requests-card">
                  <h2>Pending Leave Requests</h2>
                  <div className="leave-requests-content">
                    <div className="leave-requests-header">
                      <i className="fas fa-clock"></i>
                      <span className="leave-requests-count">{pendingLeaveRequests}</span>
                    </div>
                    <button 
                      className="review-leave-btn"
                      onClick={() => navigate(`/admin/${id}/leaves`)}
                    >
                      Review
                    </button>
                  </div>
                </div>
                <div className="info-card position-card">
                  <h2>Position</h2>
                  <p>Admin</p>
                </div>
            </div>
          )}

          <div className="other-section">
            <div className="task-section">
              <div className="task-header">
                <h2>Recent Tasks</h2>
                <button
                  className="edit-task"
                  onClick={() => navigate(`/admin/${id}/tasks`)}
                >
                  View All Tasks
                </button>
              </div>
              <div className="task-cards-container">
                {(Array.isArray(tasks) && tasks.length > 0) ? (
                  tasks.slice(0, 6).map((task) => (
                    <div key={task._id} className="task-card">
                      <div className="task-card-header">
                        <h3 className="task-title">{task.title}</h3>
                        <span className={`task-status ${task.status?.toLowerCase().replace(' ', '-')}`}>
                          {task.status}
                        </span>
                      </div>
                      {task.description && (
                        <p className="task-description">
                          {task.description.length > 80 
                            ? task.description.slice(0, 80) + '...' 
                            : task.description
                          }
                        </p>
                      )}
                      <div className="task-card-footer">
                        <span className="task-due-date">
                          <i className="fas fa-calendar-alt"></i>
                          Due: {formatDate(task.dueDate)}
                        </span>
                        <button 
                          className="task-details-btn"
                          onClick={() => navigate(`/admin/${id}/tasks`)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-tasks-message">
                    <i className="fas fa-clipboard-list"></i>
                    <p>No tasks available.</p>
                    <small>Create new tasks to get started.</small>
                  </div>
                )}
              </div>
            </div>

            <div className="announcement-section">
              <div className="announcement-header">
                <h2>Recent Announcements</h2>
                <button
                  className="edit-announcement"
                  onClick={() => navigate(`/admin/${id}/announcements`)}
                >
                  View All
                </button>
              </div>
              <div className="announcement-box-cards scrollable-announcements">
                {(Array.isArray(announcements) && announcements.length > 0) ? (
                  announcements.map((ann) => (
                    <div className="announcement-card" key={ann._id}>
                      <h3>{ann.title}</h3>
                      <p>{ann.message.length > 100 ? ann.message.slice(0, 100) + '...' : ann.message}</p>
                      <small>{new Date(ann.createdAt).toLocaleDateString()}</small>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', margin: '20px 0' }}>No announcements available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
}

export default AdminDashboard;
