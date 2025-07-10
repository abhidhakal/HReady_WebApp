import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import '/src/pages/admin/styles/Dashboard.css';
import api from '../../api/axios';
import logo from '/src/assets/primary_icon.webp';
import '/src/pages/employee/styles/EmployeeLeaves.css';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';

function EmployeeLeaves() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState('Employee');
  const [position, setPosition] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: null,
    endDate: null,
    reason: '',
    halfDay: false,
    attachment: null,
  });
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const resolveProfilePicture = (picture) => {
    if (!picture) return '/src/assets/profile.svg';
    if (picture.startsWith('PHN2Zy')) return `data:image/svg+xml;base64,${picture}`;
    if (picture.startsWith('/')) return `${import.meta.env.VITE_API_BASE_URL}${picture}`;
    if (picture.startsWith('http')) return picture;
    return `data:image/png;base64,${picture}`;
  };

  useEffect(() => {
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

    fetchEmployee();
  }, [navigate]);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('leaveType', formData.leaveType);
      payload.append('startDate', formData.startDate.toISOString());
      payload.append('endDate', formData.endDate.toISOString());
      payload.append('reason', formData.reason);
      payload.append('halfDay', formData.halfDay);
      if (formData.attachment) {
        payload.append('attachment', formData.attachment);
      }

      await api.post('/leaves', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Leave requested successfully');
      setFormData({
        leaveType: '',
        startDate: null,
        endDate: null,
        reason: '',
        halfDay: false,
        attachment: null,
      });
      fetchLeaves();
    } catch (err) {
      console.error('Error submitting leave:', err);
      alert('Error submitting leave request');
    }
    setLoading(false);
  };

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
            <li><a onClick={() => navigate(`/employee/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/attendance`)}>Attendance</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/tasks`)}>Tasks</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/employee/${id}/leave`)}>Leave</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/announcements`)}>Announcements</a></li>
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
          <div className="employee-leaves">
            <h2>Leave Request</h2>
            <form onSubmit={handleSubmit}>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                required
              >
                <option value="">Select Leave Type</option>
                <option value="Casual">Casual</option>
                <option value="Sick">Sick</option>
                <option value="Emergency">Emergency</option>
                <option value="Annual">Annual</option>
                <option value="Other">Other</option>
              </select>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.startDate}
                  onChange={(date) => setFormData((prev) => ({ ...prev, startDate: date }))}
                  renderInput={(params) => (
                    <TextField {...params} required size="small" />
                  )}
                />
              </LocalizationProvider>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.endDate}
                  onChange={(date) => setFormData((prev) => ({ ...prev, endDate: date }))}
                  renderInput={(params) => (
                    <TextField {...params} required size="small" />
                  )}
                />
              </LocalizationProvider>

              <input
                type="text"
                name="reason"
                placeholder="Reason"
                value={formData.reason}
                onChange={handleChange}
                required
              />
              <label className="half-day-checkbox">
                <input
                  type="checkbox"
                  name="halfDay"
                  checked={formData.halfDay}
                  onChange={handleChange}
                />
                Half Day
              </label>
              <input
                type="file"
                name="attachment"
                onChange={handleChange}
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Request Leave'}
              </button>
            </form>

            <h2>Your Leave Records</h2>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Half Day</th>
                  <th>Status</th>
                  <th>Attachment</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>{leave.leaveType}</td>
                      <td>
                        {new Date(leave.startDate).toLocaleDateString()} -{' '}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td>{leave.halfDay ? 'Yes' : 'No'}</td>
                      <td>{leave.status}</td>
                      <td>
                        {leave.attachment ? (
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL}/${leave.attachment}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{leave.adminComment || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">No leave records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeLeaves;
