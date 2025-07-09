import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import '/src/pages/admin/styles/Dashboard.css';
import api from '../../api/axios';
import Toast from '../../components/common/Toast';
import logo from '/src/assets/primary_icon.webp';

function AdminDashboard() {
  const { id } = useParams();
  const [employeeCount, setEmployeeCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState('Admin');
  const [profilePicture, setProfilePicture] = useState('');
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState('Not Done');
  const [toast, setToast] = useState({ message: '', type: '' });
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

      api.get(`/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          setName(res.data.name || 'Admin');
          setProfilePicture(res.data.profilePicture || '');
        })
        .catch(err => {
          console.error('Error fetching admin:', err);
          setName('Admin');
          setProfilePicture('');
        });
    } catch (error) {
      console.error('Invalid token:', error);
      navigate('/login');
    }
  }, [navigate, id]);

  useEffect(() => {
    const fetchAttendance = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await api.get('/attendance/me', {
          headers: { Authorization: `Bearer ${token}` },
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

    fetchAttendance();
  }, []);

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
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/employees', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setEmployeeCount(res.data.length);
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };

    fetchEmployees();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setToast({ message: 'Logged out successfully', type: 'success' });
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  return (
    <div className="full-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      <DashboardHeader onToggleSidebar={toggleSidebar} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate('/admin/employees')}>Manage Employees</a></li>
            <li><a onClick={() => navigate('/admin/attendance')}>Admin Attendance</a></li>
            <li><a onClick={() => navigate('/admin/tasks')}>Manage Tasks</a></li>
            <li><a href="#">Leave Requests</a></li>
            <li><a onClick={() => navigate('/admin/announcements')}>Manage Announcements</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/profile`)}>Profile</a></li>
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
                  src={
                    profilePicture
                      ? profilePicture.startsWith('PHN2Zy')
                        ? `data:image/svg+xml;base64,${profilePicture}`
                        : profilePicture.startsWith('/')
                          ? `${import.meta.env.VITE_API_BASE_URL}${profilePicture}`
                          : profilePicture.startsWith('http')
                            ? profilePicture
                            : `data:image/png;base64,${profilePicture}`
                      : '/src/assets/profile.svg'
                  }
                  alt="Admin Profile"
                />
              </div>
              <h2 className="employee-name">Hello, {name}</h2>
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
                onClick={() => navigate('/admin/attendance')}
              >
                Click to complete attendance
              </small>
            </div>
            <div className="banner-right">
              <button className="edit-profile" onClick={() => navigate(`/admin/${id}/profile`)}>
                Edit Admin Profile
              </button>
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
              <h1 className="employee-role">{employeeCount}</h1>
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
                      <li key={ann._id}>
                        <strong>{ann.title}:</strong>{" "}
                        {ann.message.length > 60
                          ? ann.message.substring(0, 60) + "..."
                          : ann.message}
                      </li>
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
