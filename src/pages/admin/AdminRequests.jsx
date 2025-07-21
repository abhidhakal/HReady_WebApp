import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '../../components/common/DashboardHeader.jsx';
import logo from '../../assets/primary_icon.webp';
import api from '../../api/axios';
import './styles/AdminRequests.css';

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
      className="request-status-chip"
      style={{ backgroundColor: getStatusColor(status) }}
    >
      {status}
    </span>
  );
};

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
    <div className="shimmer-meta"></div>
  </div>
);

function AdminRequests() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState({}); // { [requestId]: { mode: 'approve'|'reject'|null, comment: '' } }

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/requests', { headers: { Authorization: `Bearer ${token}` } });
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

  const handleActionClick = (id, mode) => {
    setActionState(s => ({ ...s, [id]: { mode, comment: '' } }));
  };

  const handleActionCancel = (id) => {
    setActionState(s => ({ ...s, [id]: { mode: null, comment: '' } }));
  };

  const handleCommentChange = (id, value) => {
    setActionState(s => ({ ...s, [id]: { ...s[id], comment: value } }));
  };

  const handleActionSubmit = async (id, status) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const comment = actionState[id]?.comment || '';
      await api.patch(`/requests/${id}/status`, { status, adminComment: comment }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActionState(s => ({ ...s, [id]: { mode: null, comment: '' } }));
      fetchRequests();
    } catch (err) {
      setError('Failed to update request');
      console.error('Error updating request:', err);
    }
    setLoading(false);
  };

  const handleAttachmentClick = (attachmentUrl) => {
    if (attachmentUrl) {
      window.open(attachmentUrl, '_blank');
    }
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}> 
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/employees`)}>Employees</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/payroll`)}>Payroll Management</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/attendance`)}>Attendance</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/tasks`)}>Tasks</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/leaves`)}>Leaves</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/announcements`)}>Announcements</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}/requests`)}>Requests</a></li>
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
        
        <div className="main-content-requests">
          <div className="requests-header">
            <h2>All Employee Requests</h2>
          </div>

          {loading && (
            <div className="requests-loading-container">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <LoadingShimmer />
                </Card>
              ))}
            </div>
          )}

          {error && (
            <div className="requests-error">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {!loading && requests.length === 0 && !error && (
            <div className="requests-empty-state">
              <i className="fas fa-inbox"></i>
              <p>No requests found.</p>
            </div>
          )}

          {!loading && requests.length > 0 && (
            <div className="requests-list-container">
              {requests.map(r => (
                <Card key={r._id}>
                  <div className="request-card-header">
                    <span className="request-title">{r.title}</span>
                    <StatusChip status={r.status} />
                  </div>
                  
                  <div className="request-type">{r.type}</div>
                  
                  <div className="request-message">{r.message}</div>
                  
                  <div className="request-meta">
                    <span className="request-creator">
                      <i className="fas fa-user"></i>
                      By: {r.createdBy?.name || r.createdBy?.email || 'Unknown'}
                    </span>
                    <span className="request-date">
                      <i className="fas fa-calendar-alt"></i>
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {r.attachment && (
                    <div className="request-attachment">
                      <button 
                        className="attachment-btn"
                        onClick={() => handleAttachmentClick(r.attachment)}
                      >
                        <i className="fas fa-paperclip"></i>
                        View Attachment
                      </button>
                    </div>
                  )}

                  {r.adminComment && (
                    <div className="request-admin-comment">
                      <i className="fas fa-comment"></i>
                      <span><strong>Admin:</strong> {r.adminComment}</span>
                    </div>
                  )}

                  {r.status === 'pending' && (
                    <div className="request-actions">
                      {actionState[r._id]?.mode ? (
                        <div className="request-action-form">
                          <input
                            className="request-comment-input"
                            type="text"
                            placeholder="Add a comment (optional)"
                            value={actionState[r._id]?.comment || ''}
                            onChange={e => handleCommentChange(r._id, e.target.value)}
                            disabled={loading}
                          />
                          <button 
                            type="button" 
                            className={`request-action-btn ${actionState[r._id].mode === 'approve' ? 'approve' : 'reject'}`}
                            onClick={() => handleActionSubmit(r._id, actionState[r._id].mode === 'approve' ? 'approved' : 'rejected')}
                            disabled={loading}
                          >
                            {loading ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              actionState[r._id].mode === 'approve' ? 'Approve' : 'Reject'
                            )}
                          </button>
                          <button 
                            type="button" 
                            className="request-action-btn cancel"
                            onClick={() => handleActionCancel(r._id)}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="request-action-buttons">
                          <button 
                            className="request-action-btn approve"
                            onClick={() => handleActionClick(r._id, 'approve')}
                            disabled={loading}
                          >
                            <i className="fas fa-check"></i>
                            Approve
                          </button>
                          <button 
                            className="request-action-btn reject"
                            onClick={() => handleActionClick(r._id, 'reject')}
                            disabled={loading}
                          >
                            <i className="fas fa-times"></i>
                            Reject
                          </button>
                        </div>
                      )}
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

export default AdminRequests; 