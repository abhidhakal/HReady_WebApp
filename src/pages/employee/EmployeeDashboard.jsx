import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import '../../pages/admin/styles/Dashboard.css';
import api from '/src/api/api.js';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
import { secureLogout } from '/src/auth/authService.js';
import { getApiBaseUrl } from '../../utils/env';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';

function EmployeeDashboard() {
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

  const resolveProfilePicture = (picture) => {
    if (!picture) return '/assets/images/profile.svg';
    const base = getApiBaseUrl().replace(/\/api$/, '');
    if (picture.startsWith('/uploads')) return `${base}/api${picture}`;
    if (picture.startsWith('http')) return picture;
    return '/assets/images/profile.svg';
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await secureLogout(navigate);
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
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
  }, [navigate]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAnnouncements(res.data);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks/my', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
  }, []);

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
            <div className="dashboard-skeletons">
              {[1,2,3].map(i => (
                <Skeleton key={i} variant="rectangular" width={320} height={160} style={{ margin: 16 }} />
              ))}
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
                  <div className="info-card overview-card">...</div>
                  <div className="info-card position-card">...</div>
                  <div className="info-card leaves-card">...</div>
                  <div className="info-card pending-tasks-card">...</div>
                </div>
              )}

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
