import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
// import logo from '../../assets/primary_icon.webp';
import api from '/src/api/api.js';
import './styles/AdminRequests.css';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '/src/hooks/useAuth.js';
import { useToast } from '/src/hooks/useToast.js';
import Toast from '/src/components/Toast.jsx';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
// Import services
import { getRequests, updateRequestStatus } from '/src/services/index.js';

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
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState({}); // { [requestId]: { mode: 'approve'|'reject'|null, comment: '' } }
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { getToken, logout } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getRequests(true); // true for admin
      if (result.success) {
        console.log('Fetched requests:', result.data);
        setRequests(result.data);
      } else {
        setError('Failed to fetch requests');
        showError('Failed to fetch requests');
        console.error('Error fetching requests:', result.error);
      }
    } catch (err) {
      setError('Failed to fetch requests');
      showError('Failed to fetch requests');
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
      const comment = actionState[id]?.comment || '';
      console.log('Submitting action:', { id, status, comment });
      const result = await updateRequestStatus(id, status, comment);
      
      if (result.success) {
        showSuccess(`Request ${status} successfully`);
        setActionState(s => ({ ...s, [id]: { mode: null, comment: '' } }));
        fetchRequests();
      } else {
        setError('Failed to update request');
        showError('Failed to update request');
        console.error('Error updating request:', result.error);
      }
    } catch (err) {
      setError('Failed to update request');
      showError('Failed to update request');
      console.error('Error updating request:', err);
    }
    setLoading(false);
  };

  const handleAttachmentClick = (attachmentUrl) => {
    if (attachmentUrl) {
      window.open(attachmentUrl, '_blank');
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout(
      navigate,
      () => showSuccess('Logged out successfully'),
      (error) => showError('Logout completed with warnings')
    );
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  // Filter requests based on status
  const filteredRequests = requests.filter(request => {
    if (statusFilter === 'all') return true;
    return (request.status === statusFilter || request.status === statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1));
  });

  // Get counts for each status
  const getStatusCount = (status) => {
    return requests.filter(request => 
      request.status === status || request.status === status.charAt(0).toUpperCase() + status.slice(1)
    ).length;
  };

  return (
    <div className="full-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      <DashboardHeader onToggleSidebar={toggleSidebar} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}> 
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
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
                onClick={handleLogoutClick}
              >
                Log Out
              </a>
            </li>
          </ul>
        </nav>
        
        <div className="main-content-requests">
          <div className="requests-header">
            <h2>All Employee Requests</h2>
            <div className="requests-filter">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter-select"
              >
                <option value="all">All Requests ({requests.length})</option>
                <option value="pending">Pending ({getStatusCount('pending')})</option>
                <option value="approved">Approved ({getStatusCount('approved')})</option>
                <option value="rejected">Rejected ({getStatusCount('rejected')})</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="requests-list-container">
              {[1,2,3,4].map(i => (
                <div className="request-card" key={i}>
                  <div className="request-header">
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="30%" height={18} />
                  </div>
                  <Skeleton variant="text" width="80%" height={18} />
                  <Skeleton variant="rectangular" width="100%" height={40} style={{ margin: '12px 0' }} />
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="requests-empty-state">
              <i className="fas fa-inbox"></i>
              <p>No requests found.</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="requests-empty-state">
              <i className="fas fa-inbox"></i>
              <p>No requests found.</p>
            </div>
          ) : (
            <div className="requests-list-container">
              {filteredRequests.map(request => (
                <div className="request-card" key={request._id}>
                  <div className="request-card-header">
                    <span className="request-title">{request.title}</span>
                    <StatusChip status={request.status} />
                  </div>
                  
                  <div className="request-type">{request.type}</div>
                  
                  <div className="request-message">{request.message}</div>
                  
                  <div className="request-meta">
                    <span className="request-creator">
                      <i className="fas fa-user"></i>
                      By: {request.createdBy?.name || request.createdBy?.email || 'Unknown'}
                    </span>
                    <span className="request-date">
                      <i className="fas fa-calendar-alt"></i>
                      {new Date(request.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {request.attachment && (
                    <div className="request-attachment">
                      <button 
                        className="attachment-btn"
                        onClick={() => handleAttachmentClick(request.attachment)}
                      >
                        <i className="fas fa-paperclip"></i>
                        View Attachment
                      </button>
                    </div>
                  )}

                  {request.adminComment && (
                    <div className="request-admin-comment">
                      <i className="fas fa-comment"></i>
                      <span><strong>Admin:</strong> {request.adminComment}</span>
                    </div>
                  )}

                  {(request.status === 'pending' || request.status === 'Pending') && (
                    <div className="request-actions">
                      {actionState[request._id]?.mode ? (
                        <div className="request-action-form">
                          <input
                            className="request-comment-input"
                            type="text"
                            placeholder="Add a comment (optional)"
                            value={actionState[request._id]?.comment || ''}
                            onChange={e => handleCommentChange(request._id, e.target.value)}
                            disabled={loading}
                          />
                          <button 
                            type="button" 
                            className={`request-action-btn ${actionState[request._id].mode === 'approve' ? 'approve' : 'reject'}`}
                            onClick={() => handleActionSubmit(request._id, actionState[request._id].mode === 'approve' ? 'approved' : 'rejected')}
                            disabled={loading}
                          >
                            {loading ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              actionState[request._id].mode === 'approve' ? 'Approve' : 'Reject'
                            )}
                          </button>
                          <button 
                            type="button" 
                            className="request-action-btn cancel"
                            onClick={() => handleActionCancel(request._id)}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="request-action-buttons">
                          <button 
                            className="request-action-btn approve"
                            onClick={() => handleActionClick(request._id, 'approve')}
                            disabled={loading}
                          >
                            <i className="fas fa-check"></i>
                            Approve
                          </button>
                          <button 
                            className="request-action-btn reject"
                            onClick={() => handleActionClick(request._id, 'reject')}
                            disabled={loading}
                          >
                            <i className="fas fa-times"></i>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
}

export default AdminRequests; 