import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import '../../pages/admin/styles/Dashboard.css';
import api from '/src/api/api.js';
import Toast from '/src/components/Toast.jsx';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
import { useAuth } from '/src/hooks/useAuth.js';
import { getApiBaseUrl } from '../../utils/env';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';

const EmployeeDashboard = () => {
  const { id } = useParams();
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const [name, setName] = useState('Employee');
  const [position, setPosition] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState('Not Done');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { getToken, fetchUserData, logout } = useAuth();

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
    await logout(navigate);
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
        const res = await api.get('/employees/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setName(res.data.name || 'Employee');
        setPosition(res.data.position || 'Employee');
        setProfilePicture(res.data.profilePicture || '');
      } catch (err) {
        console.error('Error fetching employee:', err);
      }
    };

    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          if (res.data.check_out_time) {
            setAttendanceStatus('Checked Out');
          } else if (res.data.check_in_time) {
            setAttendanceStatus('Checked In');
          } else {
            setAttendanceStatus('Not Done');
          }
        } else {
          setAttendanceStatus('Not Done');
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setAttendanceStatus('Not Done');
        } else {
          console.error('Error fetching attendance:', err);
        }
      }
    };

    Promise.all([fetchEmployee(), fetchAttendance()]).finally(() => setLoading(false));
  }, [navigate, getToken]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setAnnouncements(res.data);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }
    };
    fetchAnnouncements();
  }, [getToken]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks/my', {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
  }, [getToken]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="full-screen">
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
              <div className="welcome-banner">
                <div className="banner-left">
                  <Skeleton variant="circular" width={80} height={80} style={{ marginRight: 16 }} />
                  <Skeleton variant="text" width={200} height={32} />
                </div>
                <div className="banner-middle">
                  <Skeleton variant="text" width={300} height={24} />
                  <Skeleton variant="text" width={250} height={16} />
                </div>
                <div className="banner-right">
                  <Skeleton variant="rectangular" width={150} height={40} />
                </div>
              </div>

              {/* Info Cards Skeleton */}
              <div className="info-cards">
                {[1,2,3,4].map(i => (
                  <div className="info-card" key={i}>
                    <Skeleton variant="text" width={60} height={24} style={{ marginBottom: 12 }} />
                    <Skeleton variant="rectangular" width={80} height={32} />
                    <Skeleton variant="text" width={40} height={16} style={{ marginTop: 12 }} />
                  </div>
                ))}
              </div>

              {/* Tasks Section Skeleton */}
              <div className="other-section">
                <div className="task-section">
                  <div className="task-header">
                    <Skeleton variant="text" width={120} height={28} />
                    <Skeleton variant="rectangular" width={100} height={32} />
                  </div>
                  <div className="task-cards-container">
                    {[1,2,3].map(i => (
                      <div className="task-card" key={i}>
                        <div className="task-card-header">
                          <Skeleton variant="text" width={150} height={24} />
                          <Skeleton variant="rectangular" width={80} height={24} />
                        </div>
                        <Skeleton variant="text" width="100%" height={16} />
                        <Skeleton variant="text" width="80%" height={16} />
                        <div className="task-card-footer">
                          <Skeleton variant="text" width={120} height={16} />
                          <Skeleton variant="rectangular" width={100} height={32} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Announcements Section Skeleton */}
                <div className="announcement-section">
                  <div className="announcement-header">
                    <Skeleton variant="text" width={150} height={28} />
                    <Skeleton variant="rectangular" width={80} height={32} />
                  </div>
                  <div className="announcement-box-cards scrollable-announcements">
                    {[1,2,3].map(i => (
                      <div className="announcement-card" key={i}>
                        <Skeleton variant="text" width={180} height={24} />
                        <Skeleton variant="text" width="100%" height={16} />
                        <Skeleton variant="text" width="90%" height={16} />
                        <Skeleton variant="text" width={120} height={14} />
                      </div>
                    ))}
                  </div>
                </div>
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
                {/* Place your real info cards here, each with className="info-card" */}
                {/* Example: */}
                <div className="info-card overview-card">...</div>
                <div className="info-card position-card">...</div>
                <div className="info-card leaves-card">...</div>
                <div className="info-card pending-tasks-card">...</div>
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
