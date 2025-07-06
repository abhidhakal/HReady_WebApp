import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import '/src/pages/admin/styles/AdminAttendance.css';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import logo from '/src/assets/primary_icon.webp';

const AdminAttendance = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [myRecord, setMyRecord] = useState(null);
  const [todayStatus, setTodayStatus] = useState('Not Checked In');
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // All records for employees
      const resAll = await api.get('/attendance/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAttendanceRecords(resAll.data);
    } catch (err) {
      console.error('Error fetching all attendance:', err);
      setAttendanceRecords([]);
    }

    try {
      // My own attendance record for today
      const resMine = await api.get('/attendance/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyRecord(resMine.data);

      if (resMine.data.check_in_time && !resMine.data.check_out_time) {
        setTodayStatus('Checked In');
      } else if (resMine.data.check_in_time && resMine.data.check_out_time) {
        setTodayStatus('Checked Out');
      } else {
        setTodayStatus('Not Checked In');
      }
    } catch (err) {
      console.error('Error fetching my attendance:', err);
      setMyRecord(null);
    }
  };

  useEffect(() => {
    fetchData();
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
            <li><img src={logo} alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate('/admin/employees')}>Manage Employees</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate('/admin/attendance')}>Admin Attendance</a></li>
            <li><a href="#">Manage Tasks</a></li>
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

        <div className="main-content attendance-page">
          <h2>My Attendance</h2>
          <p>Status Today: <strong>{todayStatus}</strong></p>
          <div className="attendance-buttons">
            <button onClick={handleCheckIn} disabled={todayStatus !== 'Not Checked In'}>Check In</button>
            <button onClick={handleCheckOut} disabled={todayStatus !== 'Checked In'}>Check Out</button>
          </div>

          <h3>Today’s Record</h3>
          {myRecord ? (
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
                  <td>{new Date(myRecord.date).toLocaleDateString()}</td>
                  <td>{myRecord.check_in_time ? new Date(myRecord.check_in_time).toLocaleTimeString() : '-'}</td>
                  <td>{myRecord.check_out_time ? new Date(myRecord.check_out_time).toLocaleTimeString() : '-'}</td>
                  <td>{myRecord.status}</td>
                  <td>{myRecord.total_hours ? myRecord.total_hours.toFixed(2) : '-'}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>No record for today.</p>
          )}

          <h2 style={{ marginTop: '40px' }}>Employee Attendance Records</h2>
          {attendanceRecords.length > 0 ? (
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map(record => (
                  <tr key={record._id}>
                    <td>{record.employeeId?.userId?.name || 'N/A'}</td>
                    <td>{record.employeeId?.userId?.email || '-'}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.check_in_time ? new Date(record.check_in_time).toLocaleTimeString() : '-'}</td>
                    <td>{record.check_out_time ? new Date(record.check_out_time).toLocaleTimeString() : '-'}</td>
                    <td>{record.status}</td>
                    <td>{record.total_hours ? record.total_hours.toFixed(2) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No employee attendance records found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
