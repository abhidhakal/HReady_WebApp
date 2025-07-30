import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import './styles/EmployeeAnnouncements.css';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '/src/hooks/useAuth.js';
import { useToast } from '/src/hooks/useToast.js';
import Toast from '/src/components/Toast.jsx';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
// Import services
import { getAnnouncements } from '/src/services/index.js';

const Card = ({ children }) => (
  <div className="announcement-card">{children}</div>
);

const EmployeeAnnouncements = () => {
  const { id } = useParams();
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { getToken, logout } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const result = await getAnnouncements();
      if (result.success) {
        setAnnouncements(result.data);
      } else {
        showError('Failed to fetch announcements');
        console.error('Error fetching announcements:', result.error);
      }
    } catch (err) {
      showError('Failed to fetch announcements');
      console.error('Error fetching announcements:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="full-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      <DashboardHeader onToggleSidebar={toggleSidebar} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
          <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
            <li><a onClick={() => navigate(`/employee/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/attendance`)}>Attendance</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/payroll`)}>My Payroll</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/tasks`)}>Tasks</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/leave`)}>Leave</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/employee/${id}/announcements`)}>Announcements</a></li>
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

        <div className="main-content-announcements">
          <div className="announcements-header">
            <h2>Announcements</h2>
          </div>



          {loading && (
            <div className="announcements-loading-container">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <div style={{ padding: 16, border: '1px solid #e1e5e9', borderRadius: 8, marginBottom: 12 }}>
                    <Skeleton variant="text" width={180} height={24} style={{ marginBottom: 12 }} />
                    <Skeleton variant="text" width="100%" height={16} style={{ marginBottom: 8 }} />
                    <Skeleton variant="text" width="90%" height={16} style={{ marginBottom: 8 }} />
                    <Skeleton variant="text" width={120} height={14} />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!loading && announcements.length === 0 && (
            <div className="announcements-empty-state">
              <i className="fas fa-bullhorn"></i>
              <p>No announcements yet!</p>
            </div>
          )}

          {!loading && announcements.length > 0 && (
            <div className="announcements-list-container">
              {announcements.map((announcement) => (
                <Card key={announcement._id}>
                  <div className="announcement-card-header">
                    <div className="announcement-icon">
                      <i className="fas fa-bullhorn"></i>
                    </div>
                    <div className="announcement-content">
                      <h3 className="announcement-title">{announcement.title}</h3>
                      <div className="announcement-meta">
                        <span className="announcement-author">
                          <i className="fas fa-user"></i>
                          {announcement.postedBy || 'Admin'}
                        </span>
                        <span className="announcement-date">
                          <i className="fas fa-clock"></i>
                          {formatDate(announcement.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="announcement-message">
                    <p>{announcement.message}</p>
                  </div>
                </Card>
              ))}
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
};

export default EmployeeAnnouncements;
