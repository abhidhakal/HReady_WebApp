import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import logo from '/src/assets/primary_icon.webp';
import api from '../../api/axios';
import './styles/AdminRequests.css';

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
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

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
    }
    setLoading(false);
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
        <div className="main-content">
          <div className="admin-requests-container">
            <h2>All Employee Requests</h2>
            {loading && <div className="admin-requests-loading">Loading...</div>}
            {error && <div className="admin-requests-error">{error}</div>}
            <div className="admin-requests-list">
              {requests.length === 0 && !loading && <div className="admin-requests-empty">No requests found.</div>}
              {requests.map(r => (
                <div className="admin-requests-card" key={r._id}>
                  <div className="admin-requests-card-header">
                    <span className="admin-requests-card-title">{r.title}</span>
                    <span className={`admin-requests-card-status status-${(r.status || '').toLowerCase()}`}>{r.status}</span>
                  </div>
                  <div className="admin-requests-card-type">{r.type}</div>
                  <div className="admin-requests-card-message">{r.message}</div>
                  <div className="admin-requests-card-meta">
                    <span>By: {r.createdBy?.name || r.createdBy?.email || 'Unknown'}</span>
                    <span>{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                  {r.attachment && <a href={r.attachment} target="_blank" rel="noopener noreferrer">Attachment</a>}
                  {r.adminComment && <div className="admin-requests-card-admin"><em>Admin: {r.adminComment}</em></div>}
                  {r.status === 'pending' && (
                    <div className="admin-requests-actions">
                      {actionState[r._id]?.mode ? (
                        <form className="admin-requests-action-form" onSubmit={e => { e.preventDefault(); handleActionSubmit(r._id, actionState[r._id].mode === 'approve' ? 'approved' : 'rejected'); }}>
                          <input
                            className="admin-requests-action-input"
                            type="text"
                            placeholder="Add a comment (optional)"
                            value={actionState[r._id]?.comment || ''}
                            onChange={e => handleCommentChange(r._id, e.target.value)}
                          />
                          <button type="submit" className={actionState[r._id].mode === 'approve' ? 'admin-requests-approve' : 'admin-requests-reject'}>
                            {actionState[r._id].mode === 'approve' ? 'Approve' : 'Reject'}
                          </button>
                          <button type="button" className="admin-requests-cancel" onClick={() => handleActionCancel(r._id)}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          <button className="admin-requests-approve" onClick={() => handleActionClick(r._id, 'approve')}>Approve</button>
                          <button className="admin-requests-reject" onClick={() => handleActionClick(r._id, 'reject')}>Reject</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRequests; 