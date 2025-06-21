import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import DashboardHeader from '/src/components/DashboardHeader.jsx';
import '/src/pages/css/Dashboard.css';
import logo from '/src/assets/light_noicon.png';

const EmployeeAnnouncements = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await api.get('/announcements', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setAnnouncements(res.data);
      } catch (err) {
        console.error('Error fetching announcements:', err);
      }
    };
    fetchAnnouncements();
  }, []);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={toggleSidebar} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a onClick={() => navigate('/employee')}>Dashboard</a></li>
            <li><a href="#attendance">Attendance</a></li>
            <li><a href="#tasks">Tasks</a></li>
            <li><a href="#leave">Leave</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate('/employee/announcements')}>Announcements</a></li>
            <li><a href="#settings">Settings</a></li>
            <li><a className="nav-logout" onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    navigate('/login');
            }}>Log Out</a></li>
          </ul>
        </nav>

        <div className="main-content">
          <h2 style={{ color: '#042F46', marginTop:'20px', marginBottom: '20px' }}>All Announcements</h2>
          {announcements.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {announcements.map((ann) => (
                <div key={ann._id} style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #ccc',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <h3 style={{ color:"#333", margin: 0 }}>{ann.title}</h3>
                  <p style={{ marginTop: '10px' }}>{ann.message}</p>
                  <small style={{ color: '#555' }}>
                    Posted by: <strong>{ann.postedBy}</strong> | {new Date(ann.createdAt).toLocaleString()}
                  </small>
                </div>
              ))}
            </div>
          ) : (
            <p>No announcements available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAnnouncements;
