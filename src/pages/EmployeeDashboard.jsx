import React, { useState } from 'react';
import DashboardHeader from '/src/components/DashboardHeader.jsx';
import '/src/pages/css/Dashboard.css';

function EmployeeDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={toggleSidebar} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src='src/assets/light_noicon.png'/></li>
            <li><a className='nav-dashboard' href="/employee">Dashboard</a></li>
            <li><a href="#attendance">Attendance</a></li>
            <li><a href="#tasks">Tasks</a></li>
            <li><a href="#leave">Leave</a></li>
            <li><a href="#news">News</a></li>
            <li><a href="#settings">Settings</a></li>
            <li><a className='nav-logout' href="/login">Log Out</a></li>
          </ul>
        </nav>

        {/* Main content */}
        <div className="main-content">
          <div className="welcome-banner">
            <div className='banner-left'>
                <div className="profile-picture">
                    <img src='src/assets/profile.webp' alt='Profile Picture'/>
                </div>
                <h2 className='employee-name'>Hello, John Doe</h2>
            </div>
            <div className='banner-middle'>
              <p>Your Today’s Attendance: <span className="status-done">DONE</span></p>
              <small>click to complete attendance</small>
            </div>
            <div className='banner-right'>
                <button className="edit-profile">Edit Your Profile</button>
            </div>
          </div>

          <div className="info-cards">
            <div className="info-card">
              <h2>Role</h2>
              <h1 className='employee-role'>Web Developer</h1>
            </div>
            <div className="info-card">
              <h2>Leave Days Left</h2>
              <div className='info-card-leaves'>
                <h1 className='employee-leaves-left'>15</h1>
                <button className='request-leave-btn' >Request Leave</button>
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

            <div className="news-section">
              <h2>News/ Announcements</h2>
              <div className="news-box"></div>
              <div className="news-box"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
