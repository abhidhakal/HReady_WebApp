import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import '/src/pages/admin/styles/Dashboard.css';
import api from '../../api/axios';
import logo from '/src/assets/primary_icon.webp';

function EmployeeDashboard() {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState('Employee');
  const [position, setPosition] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState('Not Done');
  const navigate = useNavigate();

  const resolveProfilePicture = (picture) => {
    if (!picture) return '/src/assets/profile.svg';
    if (picture.startsWith('/')) return `${import.meta.env.VITE_API_BASE_URL}${picture}`;
    if (picture.startsWith('http')) return picture;
    return '/src/assets/profile.svg';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchEmployee = async () => {
      try {
        const res = await api.get('/employees/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setName(res.data.name || 'Employee');
        setPosition(res.data.position || 'Employee');
        setProfilePicture(res.data.profilePicture || '');
      } catch (err) {
        console.error('Error fetching employee:', err);
      }
    };

    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          if (res.data.check_out_time) {
            setAttendanceStatus('Checked Out');
          } else if (res.data.check_in_time) {
            setAttendanceStatus('Checked In');
          } else {
            setAttendanceStatus('Not Done');
          }
        } else {
          setAttendanceStatus('Not Done');
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setAttendanceStatus('Not Done');
        } else {
          console.error('Error fetching attendance:', err);
        }
      }
    };

    fetchEmployee();
    fetchAttendance();
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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get('/tasks/my', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    };
    fetchTasks();
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
            <li><img src={logo} alt="Logo" /></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/employee/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/attendance`)}>Attendance</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/tasks`)}>Tasks</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/leave`)}>Leave</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/announcements`)}>Announcements</a></li>
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

        <div className="main-content">
          <div className="welcome-banner">
            <div className="banner-left">
              <div className="profile-picture">
                <img
                  src={resolveProfilePicture(profilePicture)}
                  alt="Profile"
                />
              </div>
              <h2 className="employee-name">Welcome, {name}</h2>
            </div>
            <div className="banner-middle">
              <p>
                Your Today’s Attendance:{" "}
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
                onClick={() => navigate(`/employee/${id}/attendance`)}
              >
                click here to complete attendance
              </small>
            </div>
            <div className="banner-right">
              <button
                className="edit-profile"
                onClick={() => navigate(`/employee/${id}/profile`)}
              >
                Edit Employee Profile
              </button>
            </div>
          </div>

          <div className="info-cards">
            <div className="info-card">
              <h2>Position</h2>
              <h1 className="employee-role">{position}</h1>
            </div>
            <div className="info-card">
              <h2>Leave Days Left</h2>
              <div className="info-card-leaves">
                <h1 className="employee-leaves-left">15</h1>
                <button 
                  className="request-leave-btn"
                  onClick={() => navigate(`/employee/${id}/leave`)}
                >
                  Request Leave
                </button>
              </div>
            </div>
          </div>

          <div className="other-section">
            <div className="task-section">
              <div className="task-header">
                <h2>Task List</h2>
                <button
                  className="edit-task"
                  onClick={() => navigate(`/employee/${id}/tasks`)}
                >
                  View Tasks
                </button>
              </div>
              <table className="task-table">
                <tbody>
                  {tasks.length > 0 ? (
                    tasks.slice(0, 3).map((task) => (
                      <tr key={task._id}>
                        <td><strong>Task Name:</strong> {task.title}</td>
                        <td>
                          <span className={
                            `status-label ${
                              task.status === 'Pending'
                                ? 'pending'
                                : task.status === 'In Progress'
                                ? 'doing'
                                : 'completed'
                            }`
                          }>
                            {task.status}
                          </span>
                        </td>
                        <td>
                          <a onClick={() => navigate(`/employee/${id}/tasks`)}>Details</a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: '#666' }}>No tasks assigned to you.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="announcement-section">
              <div className="announcement-header">
                <h2>Recent Announcements</h2>
                <button
                  className="edit-announcement"
                  onClick={() => navigate(`/employee/${id}/announcements`)}
                >
                  View All
                </button>
              </div>
              <div className="announcement-box-cards scrollable-announcements">
                {announcements.length > 0 ? (
                  announcements.map((ann) => (
                    <div className="announcement-card" key={ann._id}>
                      <h3>{ann.title}</h3>
                      <p>
                        {ann.message.length > 100
                          ? ann.message.substring(0, 100) + "..."
                          : ann.message}
                      </p>
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
    </div>
  );
}

export default EmployeeDashboard;
