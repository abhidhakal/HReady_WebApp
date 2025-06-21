import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '/src/components/DashboardHeader.jsx';
import '/src/pages/css/Dashboard.css';
import api from '../api/axios';

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState('Admin');
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'admin') {
        navigate('/login');
        return;
      }
      setName(decoded.name || 'Admin');
    } catch (error) {
      console.error('Invalid token:', error);
      navigate('/login');
    }
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

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={toggleSidebar} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src="/src/assets/light_noicon.png" alt="Logo" /></li>
            <li><a className="nav-dashboard" href="/admin">Dashboard</a></li>
            <li><a onClick={() => navigate('/admin/employees')}>Manage Employees</a></li>
            <li><a href="#attendance">Attendance Logs</a></li>
            <li><a href="#tasks">Manage Tasks</a></li>
            <li><a href="#leave">Leave Requests</a></li>
            <li><a onClick={() => navigate('/admin/announcements')}>Manage Announcements</a></li>
            <li><a href="#settings">Settings</a></li>
            <li><a className="nav-logout" href="/login">Log Out</a></li>
          </ul>
        </nav>

        <div className="main-content">
          <div className="welcome-banner">
            <div className="banner-left">
              <div className="profile-picture">
                <img src="/src/assets/profile.svg" alt="Admin Profile" />
              </div>
              <h2 className="employee-name">Hello, {name}</h2>
            </div>
            <div className="banner-middle">
              <p>Your Today’s Attendance: <span className="status-not-done">NOT DONE</span></p>
              <small className='go-attendance-label'>click to complete attendance</small>
            </div>
            <div className="banner-right">
              <button className="edit-profile">Edit Admin Profile</button>
            </div>
          </div>

          <div className="info-cards">
            <div className="info-card">
              <h2>Today’s Overview</h2>
              <p><strong>Active Employees:</strong> 45</p>
              <p><strong>On Leave:</strong> 4</p>
              <p><strong>Absent:</strong> 9</p>
            </div>
            <div className="info-card">
              <h2>Total Employees</h2>
              <h1 className="employee-role">58</h1>
            </div>
            <div className="info-card">
              <h2>Pending Leave Requests</h2>
              <div className="info-card-leaves">
                <h1 className="employee-leaves-left">4</h1>
                <button className="request-leave-btn">Review Now</button>
              </div>
            </div>
          </div>

          <div className="other-section">
            <div className="task-section">
              <div className="task-header">
                <h2>Task Overview</h2>
                <button className="edit-task">Manage Tasks</button>
              </div>
              <table className="task-table">
                <tbody>
                  <tr><td>Development</td><td className="doing">In Progress</td><td><a href="#">Edit</a></td></tr>
                  <tr><td>Design Review</td><td className="completed">Completed</td><td><a href="#">Edit</a></td></tr>
                  <tr><td>HR Review</td><td className="pending">Pending</td><td><a href="#">Edit</a></td></tr>
                </tbody>
              </table>
            </div>

            <div className="announcement-section">
              <div className="announcement-header">
                <h2>Recent Announcements</h2>
                <button className="edit-announcement" onClick={() => navigate('/admin/announcements')}>Manage</button>
              </div>
              <div className="announcement-box">
                {announcements.length > 0 ? (
                  <ul>
                    {announcements.slice(0, 3).map((ann) => (
                      <li key={ann._id}><strong>{ann.title}:</strong> {ann.message.length > 60 ? ann.message.substring(0, 60) + '...' : ann.message}</li>
                    ))}
                  </ul>
                ) : <p>No announcements available.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
