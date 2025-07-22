import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import './styles/EmployeeLeaves.css';
import api from '../../api/axios';
// import logo from '../../assets/primary_icon.webp';

const Card = ({ children }) => (
  <div className="leave-card">{children}</div>
);

const LoadingShimmer = () => (
  <div className="leave-loading-shimmer">
    <div className="shimmer-header">
      <div className="shimmer-status"></div>
      <div className="shimmer-type"></div>
    </div>
    <div className="shimmer-dates"></div>
    <div className="shimmer-reason"></div>
  </div>
);

const LeaveForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false,
    attachment: null,
  });
  const [showForm, setShowForm] = useState(false);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      halfDay: false,
      attachment: null,
    });
    setShowForm(false);
  };

  return (
    <Card>
      <div className="leave-form-header">
        <h3>Request Leave</h3>
        <button
          className="toggle-form-btn"
          onClick={() => setShowForm(!showForm)}
        >
          <i className={`fas ${showForm ? 'fa-minus' : 'fa-plus'}`}></i>
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="leave-form">
          <div className="form-row">
            <div className="form-field">
              <label>Leave Type</label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                required
                className="form-input"
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
              <label>Half Day</label>
              <div className="checkbox-field">
                <input
                  type="checkbox"
                  name="halfDay"
                  checked={formData.halfDay}
                  onChange={handleChange}
                  id="halfDay"
                />
                <label htmlFor="halfDay">Half Day Leave</label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-field">
            <label>Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="form-input"
              rows="3"
              placeholder="Please provide a reason for your leave request"
            />
          </div>

          <div className="form-field">
            <label>Attachment (Optional)</label>
            <input
              type="file"
              name="attachment"
              onChange={handleChange}
              className="form-input file-input"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="form-btn cancel"
              onClick={() => setShowForm(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="form-btn submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
};

const EmployeeLeaves = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const fetchLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/leaves', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data);
    } catch (err) {
      setError('Failed to fetch leave records');
      console.error('Error fetching leaves:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmitLeave = async (formData) => {
    setLoading(true);
    try {
      const payload = new FormData();
      payload.append('leaveType', formData.leaveType);
      payload.append('startDate', formData.startDate);
      payload.append('endDate', formData.endDate);
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
      fetchLeaves();
    } catch (err) {
      console.error('Error submitting leave:', err);
      alert('Error submitting leave request');
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '#4caf50';
      case 'rejected':
        return '#f44336';
      case 'pending':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
            <li><a onClick={() => navigate(`/employee/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/attendance`)}>Attendance</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/payroll`)}>My Payroll</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/tasks`)}>Tasks</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/employee/${id}/leave`)}>Leave</a></li>
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

        <div className="main-content-leaves">
          <div className="leaves-header">
            <h2>Leave Management</h2>
          </div>

          {error && (
            <div className="leaves-error">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <LeaveForm onSubmit={handleSubmitLeave} loading={loading} />

          <div className="leaves-section">
            <h3>Your Leave Records</h3>

            {loading && (
              <div className="leaves-loading-container">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <LoadingShimmer />
                  </Card>
                ))}
              </div>
            )}

            {!loading && leaves.length === 0 && (
              <div className="leaves-empty-state">
                <i className="fas fa-calendar-times"></i>
                <p>No leave records found</p>
              </div>
            )}

            {!loading && leaves.length > 0 && (
              <div className="leaves-list-container">
                {leaves.map((leave) => (
                  <Card key={leave._id}>
                    <div className="leave-card-header">
                      <span 
                        className="leave-status"
                        style={{ backgroundColor: getStatusColor(leave.status) }}
                      >
                        {leave.status}
                      </span>
                      {leave.attachment && (
                        <button className="attachment-btn" title="View Attachment">
                          <i className="fas fa-paperclip"></i>
                        </button>
                      )}
                    </div>

                    <div className="leave-details">
                      <div className="leave-detail-row">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{leave.leaveType}</span>
                      </div>

                      <div className="leave-detail-row">
                        <span className="detail-label">Dates:</span>
                        <span className="detail-value">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </span>
                      </div>

                      <div className="leave-detail-row">
                        <span className="detail-label">Half Day:</span>
                        <span className="detail-value">{leave.halfDay ? 'Yes' : 'No'}</span>
                      </div>

                      {leave.reason && (
                        <div className="leave-detail-row">
                          <span className="detail-label">Reason:</span>
                          <span className="detail-value">{leave.reason}</span>
                        </div>
                      )}

                      {leave.adminComment && (
                        <div className="leave-detail-row">
                          <span className="detail-label comment">Admin Comment:</span>
                          <span className="detail-value comment">{leave.adminComment}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLeaves;
