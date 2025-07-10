import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import '/src/pages/admin/styles/Dashboard.css';
import api from '../../api/axios';
import logo from '/src/assets/primary_icon.webp';
import '/src/pages/admin/styles/AdminLeaves.css';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';

function AdminLeaves() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: null,
    endDate: null,
    reason: '',
    halfDay: false,
    attachment: null,
  });

  const token = localStorage.getItem('token');
  const id = localStorage.getItem('userId');

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves/all', {
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

  const handleUpdateStatus = async (leaveId, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave?`)) return;

    try {
      await api.put(`/leaves/${leaveId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeaves();
    } catch (err) {
      console.error(`Error updating leave status:`, err);
      alert('Failed to update leave status.');
    }
  };

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

      await api.post('/leaves/admin', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Leave created successfully.');
      setFormData({
        leaveType: '',
        startDate: null,
        endDate: null,
        reason: '',
        halfDay: false,
        attachment: null,
      });
      setShowForm(false);
      fetchLeaves();
    } catch (err) {
      console.error('Error submitting leave:', err);
      alert('Error creating leave.');
    }
    setLoading(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
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
            <li><a onClick={() => navigate('/admin/attendance')}>Admin Attendance</a></li>
            <li><a onClick={() => navigate('/admin/tasks')}>Manage Tasks</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate('/admin/leaves')}>Manage Leaves</a></li>
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
          <div className="admin-leaves">
            <h2>All Leave Requests</h2>

            <button
              className="admin-leave-toggle"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Close My Leave Form' : 'Request Leave for Myself'}
            </button>

            {showForm && (
              <form onSubmit={handleSubmit} className="admin-leave-form">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Leave Type</label>
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
                  </div>

                  <div className="form-field">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(date) =>
                          setFormData((prev) => ({ ...prev, startDate: date }))
                        }
                        renderInput={(params) => (
                          <TextField {...params} required size="small" />
                        )}
                      />
                    </LocalizationProvider>
                  </div>

                  <div className="form-field">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="End Date"
                        value={formData.endDate}
                        onChange={(date) =>
                          setFormData((prev) => ({ ...prev, endDate: date }))
                        }
                        renderInput={(params) => (
                          <TextField {...params} required size="small" />
                        )}
                      />
                    </LocalizationProvider>
                  </div>

                  <div className="form-field">
                    <TextField
                      label="Reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      size="small"
                      fullWidth
                    />
                  </div>

                  <div className="form-field checkbox-field">
                    <label>
                      <input
                        type="checkbox"
                        name="halfDay"
                        checked={formData.halfDay}
                        onChange={handleChange}
                      />
                      Half Day
                    </label>
                  </div>

                  <div className="form-field">
                    <label>Attachment (optional)</label>
                    <input
                      type="file"
                      name="attachment"
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-field full-width">
                    <button type="submit" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Leave'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Half Day</th>
                  <th>Status</th>
                  <th>Attachment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        {leave.requestedBy
                          ? `${leave.requestedBy.name} (${leave.requestedBy.email})`
                          : '—'}
                      </td>
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
                      <td>
                        {leave.status === 'Pending' ? (
                          <div className="action-buttons">
                            <button
                              onClick={() =>
                                handleUpdateStatus(leave._id, 'Approved')
                              }
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateStatus(leave._id, 'Rejected')
                              }
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No leave records found.</td>
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

export default AdminLeaves;
