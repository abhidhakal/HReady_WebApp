import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import logo from '/src/assets/primary_icon.webp';
import api from '../../api/axios';
import './styles/AdminLeaves.css';

const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
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

  return (
    <span 
      className="leave-status-chip"
      style={{ backgroundColor: getStatusColor(status) }}
    >
      {status}
    </span>
  );
};

const Card = ({ children }) => (
  <div className="leave-card">{children}</div>
);

const LoadingShimmer = () => (
  <div className="leave-loading-shimmer">
    <div className="shimmer-header">
      <div className="shimmer-title"></div>
      <div className="shimmer-status"></div>
    </div>
    <div className="shimmer-details">
      <div className="shimmer-row"></div>
      <div className="shimmer-row"></div>
    </div>
    <div className="shimmer-reason"></div>
  </div>
);

function AdminLeaves() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false,
    attachment: null,
  });

  const token = localStorage.getItem('token');

  const fetchLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/leaves/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data);
    } catch (err) {
      setError('Failed to fetch leave requests');
      console.error('Error fetching leaves:', err);
    }
    setLoading(false);
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
    setFormLoading(true);
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

      await api.post('/leaves/admin', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Leave created successfully.');
      setFormData({
        leaveType: '',
        startDate: '',
        endDate: '',
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
    setFormLoading(false);
  };

  const handleAttachmentClick = (attachmentUrl) => {
    if (attachmentUrl) {
      window.open(`${import.meta.env.VITE_API_BASE_URL}/${attachmentUrl}`, '_blank');
    }
  };

  const resetForm = () => {
    setFormData({
      leaveType: '',
      startDate: '',
      endDate: '',
      reason: '',
      halfDay: false,
      attachment: null,
    });
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/attendance`)}>Admin Attendance</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/tasks`)}>Manage Tasks</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}/leaves`)}>Leaves</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/announcements`)}>Manage Announcements</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/requests`)}>Requests</a></li>
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

        <div className="main-content-leaves">
          <div className="leaves-header">
            <h2>All Leave Requests</h2>
            <button
              className="add-leave-btn"
              onClick={() => {
                if (showForm) {
                  setShowForm(false);
                  resetForm();
                } else {
                  setShowForm(true);
                }
              }}
            >
              <i className="fas fa-plus"></i>
              {showForm ? 'Close Form' : 'Request Leave for Myself'}
            </button>
          </div>

          {error && (
            <div className="leaves-error">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {showForm && (
            <Card>
              <div className="leave-form-header">
                <h3>Request Leave for Myself</h3>
              </div>
              <form onSubmit={handleSubmit} className="leave-form">
                <div className="form-grid">
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

                  <div className="form-field">
                    <label>Reason</label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      required
                      className="form-input"
                      rows="3"
                      placeholder="Enter reason for leave"
                    />
                  </div>

                  <div className="form-field checkbox-field">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="halfDay"
                        checked={formData.halfDay}
                        onChange={handleChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Half Day</span>
                    </label>
                  </div>

                  <div className="form-field">
                    <label>Attachment (optional)</label>
                    <input
                      type="file"
                      name="attachment"
                      onChange={handleChange}
                      className="form-input file-input"
                    />
                  </div>

                  <div className="form-field full-width">
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="form-btn cancel"
                        onClick={() => {
                          setShowForm(false);
                          resetForm();
                        }}
                        disabled={formLoading}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="form-btn submit"
                        disabled={formLoading}
                      >
                        {formLoading ? (
                          <>
                            <i className="fas fa-spinner fa-spin"></i>
                            Submitting...
                          </>
                        ) : (
                          'Submit Leave'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </Card>
          )}

          {loading && (
            <div className="leaves-loading-container">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <LoadingShimmer />
                </Card>
              ))}
            </div>
          )}

          {!loading && leaves.length === 0 && !error && (
            <div className="leaves-empty-state">
              <i className="fas fa-calendar-times"></i>
              <p>No leave requests found.</p>
            </div>
          )}

          {!loading && leaves.length > 0 && (
            <div className="leaves-list-container">
              {leaves.map((leave) => (
                <Card key={leave._id}>
                  <div className="leave-card-header">
                    <span className="leave-employee">
                      {leave.requestedBy?.name || leave.requestedBy?.email || 'Unknown Employee'}
                    </span>
                    <StatusChip status={leave.status} />
                  </div>
                  
                  <div className="leave-details">
                    <div className="leave-detail-row">
                      <span className="leave-detail-item">
                        <i className="fas fa-tag"></i>
                        <strong>Type:</strong> {leave.leaveType}
                      </span>
                      <span className="leave-detail-item">
                        <i className="fas fa-clock"></i>
                        <strong>Half Day:</strong> {leave.halfDay ? 'Yes' : 'No'}
                      </span>
                    </div>
                    
                    <div className="leave-detail-row">
                      <span className="leave-detail-item">
                        <i className="fas fa-calendar-alt"></i>
                        <strong>Start:</strong> {new Date(leave.startDate).toLocaleDateString()}
                      </span>
                      <span className="leave-detail-item">
                        <i className="fas fa-calendar-check"></i>
                        <strong>End:</strong> {new Date(leave.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="leave-reason">
                    <strong>Reason:</strong>
                    <p>{leave.reason}</p>
                  </div>

                  {leave.attachment && (
                    <div className="leave-attachment">
                      <button 
                        className="attachment-btn"
                        onClick={() => handleAttachmentClick(leave.attachment)}
                      >
                        <i className="fas fa-paperclip"></i>
                        View Attachment
                      </button>
                    </div>
                  )}

                  {leave.status === 'Pending' && (
                    <div className="leave-actions">
                      <button
                        className="leave-action-btn approve"
                        onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                      >
                        <i className="fas fa-check"></i>
                        Approve
                      </button>
                      <button
                        className="leave-action-btn reject"
                        onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                      >
                        <i className="fas fa-times"></i>
                        Reject
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminLeaves;
