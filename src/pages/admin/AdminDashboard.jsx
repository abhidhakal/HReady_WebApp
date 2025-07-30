import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import '../../pages/admin/styles/Dashboard.css';
import api from '/src/api/api.js';
import Toast from '/src/components/Toast.jsx';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
// import logo from '../../assets/primary_icon.webp';
import { useAuth } from '/src/hooks/useAuth.js';
import { getApiBaseUrl } from '../../utils/env';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';
import { useToast } from '/src/hooks/useToast.js';
// Import services
import { 
  getAdminAttendance, 
  getAnnouncements, 
  getAllEmployees, 
  getAllLeaves, 
  getTasks 
} from '/src/services/index.js';

function AdminDashboard() {
  const { id } = useParams();
  const [employeeCount, setEmployeeCount] = useState(0);
  const [name, setName] = useState('Admin');
  const [profilePicture, setProfilePicture] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState('Not Done');
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState(0);
  const [todayOverview, setTodayOverview] = useState({
    active: 0,
    onLeave: 0,
    absent: 0
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { getToken, fetchUserData, logout } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);

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
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const userData = await fetchUserData();
        if (userData) {
          setName(userData.name || 'Admin');
          setProfilePicture(userData.profilePicture || '');
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setName('Admin');
        setProfilePicture('');
      }
    };

    fetchAdminData();
  }, [navigate, getToken, fetchUserData]); // Add fetchUserData back to dependencies

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const fetchAttendanceStatus = async () => {
      try {
        const result = await getAdminAttendance();
        if (result.success) {
          if (result.data?.check_out_time) setAttendanceStatus('Checked Out');
          else if (result.data?.check_in_time) setAttendanceStatus('Checked In');
          else setAttendanceStatus('Not Done');
        }
      } catch (err) {
        if (err.response?.status === 404) setAttendanceStatus('Not Done');
      }
    };

    fetchAttendanceStatus();
  }, [getToken]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const result = await getAnnouncements();
        if (result.success) {
          setAnnouncements(result.data);
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }
    };

    fetchAnnouncements();
  }, [getToken]);

  useEffect(() => {
    const fetchEmployeesAndOverview = async () => {
      setLoading(true);
      try {
        const result = await getAllEmployees();
        if (result.success) {
          const employees = result.data;
          setEmployeeCount(employees.length);
          
          // Calculate today's overview
          let active = 0, onLeave = 0, absent = 0;
          employees.forEach(emp => {
            if (emp.status?.toLowerCase() === 'active') active++;
            else if (emp.status?.toLowerCase() === 'on leave') onLeave++;
            else if (emp.status?.toLowerCase() === 'absent') absent++;
          });
          
          setTodayOverview({ active, onLeave, absent });
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
      setLoading(false);
    };

    fetchEmployeesAndOverview();
  }, [getToken]);

  useEffect(() => {
    const fetchPendingLeaveRequests = async () => {
      try {
        const result = await getAllLeaves();
        if (result.success) {
          const pendingCount = result.data.filter(leave => 
            leave.status?.toLowerCase() === 'pending'
          ).length;
          
          setPendingLeaveRequests(pendingCount);
        }
      } catch (err) {
        console.error('Error fetching leave requests:', err);
      }
    };

    fetchPendingLeaveRequests();
  }, [getToken]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const result = await getTasks(true); // true for admin
        if (result.success) {
          setTasks(result.data);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };

    fetchTasks();
  }, [getToken]);

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
        onClose={() => hideToast()}
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
                  onError={(e) => {
                    console.log('Profile image failed to load:', e.target.src);
                    // Try direct path if API path failed
                    if (e.target.src.includes('/api/uploads')) {
                      const directPath = e.target.src.replace('/api/uploads', '/uploads');
                      console.log('Trying direct path:', directPath);
                      e.target.src = directPath;
                    } else {
                      e.target.src = '/assets/images/profile.svg';
                    }
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
          ) : (
            <div className="info-cards">
              <div className="info-card position-card">
                  <h2>Position</h2>
                  <div className="position-content">
                    <div className="position-header">
                      <i className="fas fa-user-tie"></i>
                      <span className="position-value">Admin</span>
                    </div>
                  </div>
              </div>
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
                {loading ? (
                  // Task Cards Skeleton
                  [1, 2, 3].map((i) => (
                    <div key={i} className="task-card" style={{ padding: 16, border: '1px solid #e1e5e9', borderRadius: 8, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Skeleton variant="text" width={150} height={24} />
                        <Skeleton variant="rectangular" width={80} height={24} style={{ borderRadius: 12 }} />
                      </div>
                      <Skeleton variant="text" width="100%" height={16} style={{ marginBottom: 8 }} />
                      <Skeleton variant="text" width="80%" height={16} style={{ marginBottom: 12 }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Skeleton variant="text" width={120} height={16} />
                        <Skeleton variant="rectangular" width={100} height={32} style={{ borderRadius: 6 }} />
                      </div>
                    </div>
                  ))
                ) : tasks.length > 0 ? (
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
                {loading ? (
                  // Announcement Cards Skeleton
                  [1, 2].map((i) => (
                    <div key={i} className="announcement-card" style={{ padding: 16, border: '1px solid #e1e5e9', borderRadius: 8, marginBottom: 12 }}>
                      <Skeleton variant="text" width={180} height={24} style={{ marginBottom: 12 }} />
                      <Skeleton variant="text" width="100%" height={16} style={{ marginBottom: 8 }} />
                      <Skeleton variant="text" width="90%" height={16} style={{ marginBottom: 8 }} />
                      <Skeleton variant="text" width={120} height={14} />
                    </div>
                  ))
                ) : announcements.length > 0 ? (
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
