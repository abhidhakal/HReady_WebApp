import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import './styles/EmployeeAnnouncements.css';
import logo from '/src/assets/primary_icon.webp';

const Card = ({ children }) => (
  <div className="announcement-card">{children}</div>
);

const LoadingShimmer = () => (
  <div className="announcement-loading-shimmer">
    <div className="shimmer-header">
      <div className="shimmer-icon"></div>
      <div className="shimmer-content">
        <div className="shimmer-title"></div>
        <div className="shimmer-meta"></div>
      </div>
    </div>
    <div className="shimmer-message"></div>
  </div>
);

const EmployeeAnnouncements = () => {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      <DashboardHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a onClick={() => navigate(`/employee/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/attendance`)}>Attendance</a></li>
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
                  <LoadingShimmer />
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
