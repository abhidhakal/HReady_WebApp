import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '/src/components/DashboardHeader.jsx';
import '/src/pages/css/Dashboard.css';

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      }
    } catch (error) {
      console.error('Invalid token:', error);
      navigate('/login');
    }
  }, [navigate]);

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
            <li><a href="#employees">Manage Employees</a></li>
            <li><a href="#attendance">Attendance Logs</a></li>
            <li><a href="#tasks">Manage Tasks</a></li>
            <li><a href="#leave">Leave Requests</a></li>
            <li><a href="#announcements">Announcements</a></li>
            <li><a href="#settings">Settings</a></li>
            <li><a className="nav-logout" href="/login">Log Out</a></li>
          </ul>
        </nav>

        <div className="main-content">
          <div className="welcome-banner">
            <div className="banner-left">
              <div className="profile-picture">
                <img src="/src/assets/profile.webp" alt="Admin Profile" />
              </div>
              <h2 className="employee-name">Hello, Admin Jane</h2>
            </div>
            <div className="banner-middle">
              <p>Your Today’s Attendance: <span className="status-not-done">NOT DONE</span></p>
              <small>click to complete attendance</small>
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

            <div className="news-section">
              <div className="news-header">
                <h2>News</h2>
                <button className="edit-news">Edit News</button>
              </div>
              <div className="news-box"></div>
              <div className="news-box"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
