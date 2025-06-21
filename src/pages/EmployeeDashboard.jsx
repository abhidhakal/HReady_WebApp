import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '/src/components/DashboardHeader.jsx';
import '/src/pages/css/Dashboard.css';
import api from '../api/axios';

function EmployeeDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState('Employee');
  const [position, setPosition] = useState('');
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
      if (decoded.role !== 'employee') {
        navigate('/login');
        return;
      }

      // ✅ fetch employee details from API
      api.get(`/employees/${decoded.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setName(res.data.name || 'Employee');
          setPosition(res.data.position || 'Employee');
        })
        .catch(() => {
          setName('Employee');
          setPosition('Employee');
        });
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
            <li><a className="nav-dashboard" href="/employee">Dashboard</a></li>
            <li><a href="#attendance">Attendance</a></li>
            <li><a href="#tasks">Tasks</a></li>
            <li><a href="#leave">Leave</a></li>
            <li><a href="#news">Announcements</a></li>
            <li><a href="#settings">Settings</a></li>
            <li><a className="nav-logout" href="/login">Log Out</a></li>
          </ul>
        </nav>

        <div className="main-content">
          <div className="welcome-banner">
            <div className="banner-left">
              <div className="profile-picture">
                <img src="/src/assets/profile.svg" alt="Profile Picture" />
              </div>
              <h2 className="employee-name">Hello, {name}</h2>
            </div>
            <div className="banner-middle">
              <p>Your Today’s Attendance: <span className="status-done">DONE</span></p>
              <small className='go-attendance-label'>click to complete attendance</small>
            </div>
            <div className="banner-right">
              <button className="edit-profile">Edit Your Profile</button>
            </div>
          </div>

          <div className="info-cards">
            <div className="info-card">
              <h2>Role</h2>
              <h1 className="employee-role">{position}</h1>
            </div>
            <div className="info-card">
              <h2>Leave Days Left</h2>
              <div className="info-card-leaves">
                <h1 className="employee-leaves-left">15</h1>
                <button className="request-leave-btn">Request Leave</button>
              </div>
            </div>
          </div>

          <div className="other-section">
            <div className="task-section">
              <div className="task-header">
                <h2>Task List</h2>
                <button className="edit-task">Edit Tasks</button>
              </div>
              <table className="task-table">
                <tbody>
                  <tr><td>Task Name</td><td className="doing">Doing</td><td><a href="#">Click to Edit</a></td></tr>
                  <tr><td>Task Name</td><td className="completed">Completed</td><td><a href="#">Click to Edit</a></td></tr>
                  <tr><td>Task Name</td><td className="pending">Pending</td><td><a href="#">Click to Edit</a></td></tr>
                </tbody>
              </table>
            </div>

            <div className="announcement-section">
              <div className="announcement-header">
                <h2>Recent Announcements</h2>
              </div>
              <div className="announcement-box">
                {announcements.length > 0 ? (
                  <ul>
                    {announcements.slice(0, 3).map((ann) => (
                      <li key={ann._id}>
                        <strong>{ann.title}:</strong>{' '}
                        {ann.message.length > 60 ? ann.message.substring(0, 60) + '...' : ann.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No announcements available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
