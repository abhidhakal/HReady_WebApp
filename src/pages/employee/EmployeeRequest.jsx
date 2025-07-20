import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import logo from '/src/assets/primary_icon.webp';
import api from '../../api/axios';
import './styles/EmployeeRequest.css';

const Card = ({ children }) => (
  <div className="request-card">{children}</div>
);

const LoadingShimmer = () => (
  <div className="request-loading-shimmer">
    <div className="shimmer-header">
      <div className="shimmer-title"></div>
      <div className="shimmer-status"></div>
    </div>
    <div className="shimmer-type"></div>
    <div className="shimmer-message"></div>
  </div>
);

const RequestForm = ({ onSubmit, loading }) => {
  const [form, setForm] = useState({ 
    title: '', 
    message: '', 
    type: 'request', 
    attachment: null 
  });
  const [showForm, setShowForm] = useState(false);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ title: '', message: '', type: 'request', attachment: null });
    setShowForm(false);
  };

  return (
    <Card>
      <div className="request-form-header">
        <h3>New Request/Report</h3>
        <button
          className="toggle-form-btn"
          onClick={() => setShowForm(!showForm)}
        >
          <i className={`fas ${showForm ? 'fa-minus' : 'fa-plus'}`}></i>
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-row">
            <div className="form-field">
              <label>Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter a title"
                required
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label>Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="form-input"
              >
                <option value="request">Request</option>
                <option value="report">Report</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Describe your request or report"
              required
              className="form-input"
              rows="4"
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
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </button>
          </div>
        </form>
      )}
    </Card>
  );
};

const EmployeeRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/requests/my', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setRequests(res.data);
    } catch (err) {
      setError('Failed to fetch requests');
      console.error('Error fetching requests:', err);
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchRequests(); 
  }, []);

  const handleSubmitRequest = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('title', formData.title);
      data.append('message', formData.message);
      data.append('type', formData.type);
      if (formData.attachment) data.append('attachment', formData.attachment);
      
      await api.post('/requests', data, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        }
      });
      
      alert('Request sent successfully');
      fetchRequests();
    } catch (err) {
      setError('Failed to send request');
      console.error('Error sending request:', err);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a onClick={() => navigate(`/employee/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/attendance`)}>Attendance</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/tasks`)}>Tasks</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/leave`)}>Leave</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/announcements`)}>Announcements</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/employee/${id}/requests`)}>Requests</a></li>
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

        <div className="main-content-requests">
          <div className="requests-header">
            <h2>Requests & Reports</h2>
          </div>

          {error && (
            <div className="requests-error">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <RequestForm onSubmit={handleSubmitRequest} loading={loading} />

          <div className="requests-section">
            <h3>My Requests</h3>

            {loading && (
              <div className="requests-loading-container">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i}>
                    <LoadingShimmer />
                  </Card>
                ))}
              </div>
            )}

            {!loading && requests.length === 0 && (
              <div className="requests-empty-state">
                <i className="fas fa-clipboard-list"></i>
                <p>No requests yet</p>
              </div>
            )}

            {!loading && requests.length > 0 && (
              <div className="requests-list-container">
                {requests.map(request => (
                  <Card key={request._id}>
                    <div className="request-card-header">
                      <h4 className="request-title">{request.title}</h4>
                      <span 
                        className="request-status"
                        style={{ backgroundColor: getStatusColor(request.status) }}
                      >
                        {request.status}
                      </span>
                    </div>

                    <div className="request-meta">
                      <span className="request-type">
                        <i className={`fas ${request.type === 'report' ? 'fa-flag' : 'fa-clipboard-list'}`}></i>
                        {request.type}
                      </span>
                      <span className="request-date">
                        <i className="fas fa-clock"></i>
                        {formatDate(request.createdAt)}
                      </span>
                    </div>

                    <div className="request-message">
                      <p>{request.message}</p>
                    </div>

                    {request.attachment && (
                      <div className="request-attachment">
                        <a 
                          href={request.attachment} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="attachment-link"
                        >
                          <i className="fas fa-paperclip"></i>
                          View Attachment
                        </a>
                      </div>
                    )}

                    {request.adminComment && (
                      <div className="request-admin-comment">
                        <div className="comment-header">
                          <i className="fas fa-comment"></i>
                          <span>Admin Response</span>
                        </div>
                        <p>{request.adminComment}</p>
                      </div>
                    )}
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

export default EmployeeRequest; 