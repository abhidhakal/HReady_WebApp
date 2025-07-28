import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '/src/api/api.js';
import { useAuth } from '/src/hooks/useAuth.js';
import { useSidebar } from '/src/hooks/useSidebar.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../components/styles/DashboardHeader.css';

function DashboardHeader({ username = 'John Doe', onToggleSidebar, userRole = 'employee' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userName, setUserName] = useState('');
  const notificationsRef = useRef(null);
  const tasksRef = useRef(null);
  const userDropdownRef = useRef(null);
  const { getToken, fetchUserData, logout, userRole: authUserRole, userId } = useAuth();
  const { isOpen: sidebarOpen, toggleSidebar } = useSidebar(false);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Fetch user data from API
  useEffect(() => {
    const fetchUserDataFromAPI = async () => {
      try {
        const userData = await fetchUserData();
        if (userData) {
          setUserName(userData.name || (authUserRole === 'admin' ? 'Admin' : 'Employee'));
        } else {
          setUserName(authUserRole === 'admin' ? 'Admin' : 'Employee');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserName(authUserRole === 'admin' ? 'Admin' : 'Employee');
      }
    };

    if (authUserRole && id) {
      fetchUserDataFromAPI();
    }
  }, [authUserRole, id, getToken]); // Keep necessary dependencies

  // Fetch real data from APIs
  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      if (!token) return;

      try {
        // Fetch announcements
        const announcementsRes = await api.get('/announcements', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Transform announcements to notification format
        const transformedNotifications = announcementsRes.data.map(announcement => ({
          id: announcement._id,
          title: announcement.title,
          message: announcement.message,
          time: formatTimeAgo(new Date(announcement.createdAt)),
          read: false, // You can add a read status field to announcements if needed
          type: 'announcement',
          audience: announcement.audience
        }));
        
        setNotifications(transformedNotifications);

        // Fetch tasks based on user role
        const tasksEndpoint = authUserRole === 'admin' ? '/tasks' : '/tasks/my';
        const tasksRes = await api.get(tasksEndpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTasks(tasksRes.data);

        // Count unread notifications (for now, all announcements are considered unread)
        setUnreadNotifications(transformedNotifications.length);
      } catch (error) {
        console.error('Error fetching header data:', error);
      }
    };

    fetchData();
  }, [authUserRole, getToken]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (tasksRef.current && !tasksRef.current.contains(event.target)) {
        setShowTasks(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout(navigate);
  };

  const handleProfileClick = () => {
    const profilePath = userId ? `/${authUserRole}/${userId}/profile` : `/${authUserRole}/profile`;
    navigate(profilePath);
    setShowUserDropdown(false);
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#4caf50';
      case 'in-progress':
        return '#ff9800';
      case 'pending':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <header className="dashboard-header">
      <div className="hamburger" onClick={onToggleSidebar}>
        <img src='/assets/icons/hamburger.svg' alt='Menu'/>
      </div>
      
      <div className="dashboard-logo">
        <img className='header-logo' src='/assets/images/primary_transparent.webp' alt='HReady'/>
      </div>
      
      <div className="header-actions">
        {/* Notifications Button */}
        <div className="header-action-item" ref={notificationsRef}>
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <img src="/assets/icons/notification.svg" alt="Notifications" />
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notification-popup">
              <div className="popup-header">
                <h3>Notifications</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowNotifications(false)}
                >
                  ×
                </button>
              </div>
              <div className="popup-content">
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                      {!notification.read && <div className="unread-indicator"></div>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tasks Button */}
        <div className="header-action-item" ref={tasksRef}>
          <button 
            className="tasks-btn"
            onClick={() => setShowTasks(!showTasks)}
          >
            <img src="/assets/icons/task.svg" alt="Tasks" />
          </button>
          
          {showTasks && (
            <div className="tasks-popup">
              <div className="popup-header">
                <h3>My Tasks</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowTasks(false)}
                >
                  ×
                </button>
              </div>
              <div className="popup-content">
                {tasks.length === 0 ? (
                  <div className="empty-state">
                    <p>No tasks assigned</p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div key={task._id} className="task-item">
                      <div className="task-content">
                        <h4>{task.title}</h4>
                        {task.description && (
                          <p className="task-description">{task.description}</p>
                        )}
                        <div className="task-meta">
                          <span 
                            className="task-status"
                            style={{ backgroundColor: getStatusColor(task.status) }}
                          >
                            {task.status}
                          </span>
                          <span className="task-due">Due: {formatDate(task.dueDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="header-action-item" ref={userDropdownRef}>
          <button 
            className="user-btn"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            <img src="/assets/images/profile.svg" alt="Profile" />
            <span className="username">{userName}</span>
          </button>
          
          {showUserDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <span className="user-name">{userName}</span>
                <span className="user-role">{authUserRole}</span>
              </div>
              <div className="dropdown-actions">
                <button 
                  className="dropdown-item"
                  onClick={handleProfileClick}
                >
                  <img src="/assets/icons/user.svg" alt="User Profile" />
                  Profile
                </button>
                <button 
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  <img src="/assets/icons/logout.svg" alt="Logout" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;