import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '/src/api/api.js';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import './styles/EmployeeAnnouncements.css';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';

const Card = ({ children }) => (
  <div className="announcement-card">{children}</div>
);

const EmployeeAnnouncements = () => {
  const { id } = useParams();
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/announcements', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setAnnouncements(res.data);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error('Error fetching announcements:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

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

        <div className="main-content-announcements">
          <div className="announcements-header">
            <h2>Announcements</h2>
          </div>

          {error && (
            <div className="announcements-error">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {loading && (
            <div className="announcements-loading-container">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="30%" height={18} />
                    <Skeleton variant="text" width="80%" height={18} />
                    <Skeleton variant="rectangular" width="100%" height={40} style={{ margin: '12px 0' }} />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!loading && announcements.length === 0 && !error && (
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
    </div>
  );
};

export default EmployeeAnnouncements;
