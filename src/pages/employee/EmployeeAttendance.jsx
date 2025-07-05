import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import api from '../../api/axios';
import '/src/pages/css/EmployeeAttendance.css';

const EmployeeAttendance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [todayStatus, setTodayStatus] = useState('Not Checked In');
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchAttendance = async () => {
      try {
        const res = await api.get('/attendance/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendanceRecord(res.data);

        // Set today's status
        if (res.data.check_in_time && !res.data.check_out_time) {
          setTodayStatus('Checked In');
        } else if (res.data.check_in_time && res.data.check_out_time) {
          setTodayStatus('Checked Out');
        } else {
          setTodayStatus('Not Checked In');
        }
      } catch (err) {
        console.error('Error fetching attendance:', err);
        setAttendanceRecord(null);
      }
    };

    fetchAttendance();
  }, [navigate]);

  const handleCheckIn = async () => {
    try {
      await api.post('/attendance/checkin', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTodayStatus('Checked In');
      window.location.reload();
    } catch (err) {
      console.error('Error during check-in:', err);
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.put('/attendance/checkout', { date: new Date() }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTodayStatus('Checked Out');
      window.location.reload();
    } catch (err) {
      console.error('Error during check-out:', err);
    }
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={toggleSidebar} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src="/src/assets/light_noicon.png" alt="Logo" /></li>
            <li><a onClick={() => navigate('/employee')}>Dashboard</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate('/employee/attendance')}>Attendance</a></li>
            <li><a href="#tasks">Tasks</a></li>
            <li><a href="#leave">Leave</a></li>
            <li><a onClick={() => navigate('/employee/announcements')}>Announcements</a></li>
            <li><a href="#settings">Settings</a></li>
            <li><a className="nav-logout" onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              navigate('/login');
            }}>Log Out</a></li>
          </ul>
        </nav>

        <div className="main-content attendance-page">
          <h2>My Attendance</h2>
          <p>Status Today: <strong>{todayStatus}</strong></p>
          <div className="attendance-buttons">
            <button onClick={handleCheckIn} disabled={todayStatus !== 'Not Checked In'}>Check In</button>
            <button onClick={handleCheckOut} disabled={todayStatus !== 'Checked In'}>Check Out</button>
          </div>

          <h3>Today’s Record</h3>
          {attendanceRecord ? (
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{new Date(attendanceRecord.date).toLocaleDateString()}</td>
                  <td>{attendanceRecord.check_in_time ? new Date(attendanceRecord.check_in_time).toLocaleTimeString() : '-'}</td>
                  <td>{attendanceRecord.check_out_time ? new Date(attendanceRecord.check_out_time).toLocaleTimeString() : '-'}</td>
                  <td>{attendanceRecord.status}</td>
                  <td>{attendanceRecord.total_hours ? attendanceRecord.total_hours.toFixed(2) : '-'}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>No record for today.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
