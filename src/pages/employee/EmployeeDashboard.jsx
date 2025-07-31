import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import '../../pages/admin/styles/Dashboard.css';
import Toast from '/src/components/Toast.jsx';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
import { useAuth } from '/src/hooks/useAuth.js';
import { getApiBaseUrl } from '../../utils/env';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';

import { useToast } from '/src/hooks/useToast.js';
// Import services
import { getMyProfile, getMyAttendance, getAnnouncements, getTasks, getMyLeaves } from '/src/services/index.js';

const EmployeeDashboard = () => {
  const { id } = useParams();
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const [name, setName] = useState('Employee');
  const [position, setPosition] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState('Not Done');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getToken, fetchUserData, logout } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const resolveProfilePicture = (picture) => {
    if (!picture) return '/assets/images/profile.svg';
    
    // If it's already a full URL (Cloudinary), return it directly
    if (picture.startsWith('http')) return picture;
    
    // If it's a local path (legacy), try to construct the full URL
    if (picture.startsWith('/uploads')) {
      const base = getApiBaseUrl().replace(/\/api$/, '');
      const apiPath = `${base}/api${picture}`;
      const directPath = `${base}${picture}`;
      console.log('Legacy path detected, trying:', apiPath);
      return apiPath;
    }
    
    return '/assets/images/profile.svg';
  };

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

  useEffect(() => {
    setLoading(true);
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchEmployee = async () => {
      try {
        const result = await getMyProfile();
        if (result.success) {
          setName(result.data.name || 'Employee');
          setPosition(result.data.position || 'Employee');
          setProfilePicture(result.data.profilePicture || '');
        } else {
          showError(result.error?.message || 'Failed to fetch employee profile');
        }
      } catch (err) {
        console.error('Error fetching employee:', err);
        showError('Error fetching employee profile');
      }
    };

    const fetchAttendance = async () => {
      try {
        const result = await getMyAttendance();
        if (result.success && result.data) {
          if (result.data.check_out_time) {
            setAttendanceStatus('Checked Out');
          } else if (result.data.check_in_time) {
            setAttendanceStatus('Checked In');
          } else {
            setAttendanceStatus('Not Done');
          }
        } else {
          setAttendanceStatus('Not Done');
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        showError('Error fetching attendance status');
      }
    };

    Promise.all([fetchEmployee(), fetchAttendance()]).finally(() => setLoading(false));
  }, [navigate, getToken, showError]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const result = await getAnnouncements();
        if (result.success) {
          setAnnouncements(result.data);
        } else {
          showError(result.error?.message || 'Failed to fetch announcements');
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
        showError('Error fetching announcements');
      }
    };
    fetchAnnouncements();
  }, [getToken, showError]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const result = await getTasks();
        if (result.success) {
          setTasks(result.data);
        } else {
          showError(result.error?.message || 'Failed to fetch tasks');
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        showError('Error fetching tasks');
      }
    };
    const fetchLeaves = async () => {
      try {
        const result = await getMyLeaves();
        if (result.success) {
          setLeaves(result.data);
        } else {
          showError(result.error?.message || 'Failed to fetch leaves');
        }
      } catch (err) {
        console.error('Error fetching leaves:', err);
        showError('Error fetching leaves');
      }
    };

    fetchTasks();
    fetchLeaves();
  }, [getToken, showError]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Calculate remaining leaves for current month (4 leaves per month, resets monthly)
  const calculateRemainingLeaves = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // January is 0
    
    // 4 leaves per month
    const monthlyLeaves = 4;
    
    // Calculate leaves taken this month (approved leaves only)
    let leavesTakenThisMonth = 0;
    
    leaves.filter(leave => {
      const leaveDate = new Date(leave.startDate);
      const leaveYear = leaveDate.getFullYear();
      const leaveMonth = leaveDate.getMonth() + 1;
      return leave.status?.toLowerCase() === 'approved' && 
             leaveYear === currentYear && 
             leaveMonth === currentMonth;
    }).forEach(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      
      // Calculate number of days between start and end date (inclusive)
      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      
      // If it's a half day, count as 0.5 days
      if (leave.halfDay) {
        leavesTakenThisMonth += 0.5;
      } else {
        leavesTakenThisMonth += daysDiff;
      }
    });
    
    return Math.max(0, monthlyLeaves - leavesTakenThisMonth);
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
            <li><a className="nav-dashboard" onClick={() => navigate(`/employee/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/attendance`)}>Attendance</a></li>
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

        <div className="main-content">
          {loading ? (
            <div className="dashboard-content">
              {/* Welcome Banner Skeleton */}
              <div style={{ padding: 20, border: '1px solid #e1e5e9', borderRadius: 12, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <Skeleton variant="circular" width={60} height={60} style={{ marginRight: 16 }} />
                  <div style={{ flex: 1 }}>
                    <Skeleton variant="text" width={200} height={28} style={{ marginBottom: 8 }} />
                    <Skeleton variant="text" width={150} height={16} />
                  </div>
                  <Skeleton variant="rectangular" width={120} height={36} style={{ borderRadius: 6 }} />
                </div>
              </div>

              {/* Info Cards Skeleton */}
              <div className="info-cards">
                {[1, 2, 3, 4].map(i => (
                  <div className="info-card" key={i} style={{ padding: 20, border: '1px solid #e1e5e9', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <Skeleton variant="text" width={60} height={24} style={{ marginBottom: 12 }} />
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                      <Skeleton variant="circular" width={48} height={48} style={{ marginRight: 16 }} />
                      <Skeleton variant="text" width={80} height={32} />
                    </div>
                    <Skeleton variant="text" width={40} height={16} style={{ marginTop: 12 }} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="dashboard-content">
              <div className="welcome-banner">
                <div className="banner-left">
                  <div className="profile-picture">
                    <img
                      src={resolveProfilePicture(profilePicture)}
                      alt="Profile"
                    />
                  </div>
                  <h2 className="employee-name">Welcome, {name}</h2>
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
                    onClick={() => navigate(`/employee/${id}/attendance`)}
                  >
                    click here to complete attendance
                  </small>
                </div>
                <div className="banner-right">
                  <button
                    className="edit-profile"
                    onClick={() => navigate(`/employee/${id}/profile`)}
                  >
                    Edit Employee Profile
                  </button>
                </div>
              </div>

              {/* Info Cards Section */}
              <div className="info-cards">
                <div className="info-card position-card">
                  <h2>Position</h2>
                  <div className="position-content">
                    <div className="position-header">
                      <i className="fas fa-briefcase"></i>
                      <span className="position-value">{position}</span>
                    </div>
                  </div>
                </div>
                <div className="info-card payroll-card-nav">
                  <h2>My Payroll</h2>
                  <div className="payroll-content-nav">
                    <button 
                      className="view-payroll-btn"
                      onClick={() => navigate(`/employee/${id}/payroll`)}
                    >
                      Go to Payroll
                    </button>
                  </div>
                </div>
                <div className="info-card leaves-card">
                  <h2>Leave Days Left</h2>
                  <div className="leaves-content">
                    <div className="leaves-header">
                      <i className="fas fa-calendar-alt"></i>
                      <span className="leaves-count">{calculateRemainingLeaves()}</span>
                    </div>
                    <button 
                      className="request-leave-btn"
                      onClick={() => navigate(`/employee/${id}/leave`)}
                    >
                      Request Leave
                    </button>
                  </div>
                </div>
                <div className="info-card pending-tasks-card">
                  <h2>Pending Tasks</h2>
                  <div className="pending-tasks-content">
                    <div className="pending-tasks-header">
                      <i className="fas fa-exclamation-triangle"></i>
                      <span className="pending-count">{tasks.filter(task => task.status?.toLowerCase() === 'pending').length}</span>
                      {tasks.length > 0 && (
                        <div className="progress-container">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${((tasks.length - tasks.filter(task => task.status?.toLowerCase() === 'pending').length) / tasks.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    {tasks.filter(task => task.status?.toLowerCase() === 'pending').length > 0 && (
                      <div className="next-task-info">
                        <p className="next-task-title">Title: {tasks.filter(task => task.status?.toLowerCase() === 'pending')[0]?.title}</p>
                        {tasks.filter(task => task.status?.toLowerCase() === 'pending')[0]?.dueDate && (
                          <p className="next-task-due">Due: {formatDate(tasks.filter(task => task.status?.toLowerCase() === 'pending')[0]?.dueDate)}</p>
                        )}
                      </div>
                    )}
                    <button 
                      className="view-tasks-btn"
                      onClick={() => navigate(`/employee/${id}/tasks`)}
                    >
                      View All
                    </button>
                  </div>
                </div>
              </div>

              <div className="other-section">
                <div className="task-section">
                  <div className="task-header">
                    <h2>My Tasks</h2>
                    <button
                      className="edit-task"
                      onClick={() => navigate(`/employee/${id}/tasks`)}
                    >
                      View All Tasks
                    </button>
                  </div>
                  <div className="task-cards-container">
                    {tasks.length > 0 ? (
                      tasks.slice(0, 6).map((task) => (
                        <div key={task._id} className="task-card">
                          <div className="task-card-header">
                            <h3 className="task-title">{task.title}</h3>
                            <span className={`task-status ${task.status?.toLowerCase().replace(' ', '-')}`}>
                              {task.status}
                            </span>
                          </div>
                          <div className="task-card-footer">
                            <span className="task-due-date">
                              <i className="fas fa-calendar-alt"></i>
                              Due: {formatDate(task.dueDate)}
                            </span>
                            <button 
                              className="task-details-btn"
                              onClick={() => navigate(`/employee/${id}/tasks`)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-tasks-message">
                        <i className="fas fa-clipboard-list"></i>
                        <p>No tasks assigned to you.</p>
                        <small>Check back later for new assignments.</small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="announcement-section">
                  <div className="announcement-header">
                    <h2>Recent Announcements</h2>
                    <button
                      className="edit-announcement"
                      onClick={() => navigate(`/employee/${id}/announcements`)}
                    >
                      View All
                    </button>
                  </div>
                  <div className="announcement-box-cards scrollable-announcements">
                    {announcements.length > 0 ? (
                      announcements.map((ann) => (
                        <div className="announcement-card" key={ann._id}>
                          <h3>{ann.title}</h3>
                          <p>{ann.message}</p>
                          <small>
                            Posted by: <strong>{ann.postedBy || 'Admin'}</strong> | {new Date(ann.createdAt).toLocaleString()}
                          </small>
                        </div>
                      ))
                    ) : (
                      <p>No announcements available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
}

export default EmployeeDashboard;
