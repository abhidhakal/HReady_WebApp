import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import logo from '/src/assets/primary_icon.webp';
import api from '../../api/axios';
import './styles/EmployeeRequest.css';

function EmployeeRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', type: 'request', attachment: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/requests/my', { headers: { Authorization: `Bearer ${token}` } });
      setRequests(res.data);
    } catch (err) {
      setError('Failed to fetch requests');
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('title', form.title);
      data.append('message', form.message);
      data.append('type', form.type);
      if (form.attachment) data.append('attachment', form.attachment);
      await api.post('/requests', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setForm({ title: '', message: '', type: 'request', attachment: null });
      fetchRequests();
    } catch (err) {
      setError('Failed to send request');
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
        <div className="main-content">
          <div className="employee-request-container">
            <h2>Request / Report to Admin</h2>
            <div className="employee-request-form-card">
              <form className="employee-request-form" onSubmit={handleSubmit}>
                <div className="employee-request-form-section">
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Title"
                    required
                    className="employee-request-input"
                  />
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="employee-request-select"
                  >
                    <option value="request">Request</option>
                    <option value="report">Report</option>
                  </select>
                </div>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Message"
                  required
                  className="employee-request-textarea"
                  style={{ gridColumn: '1 / -1' }}
                />
                <div className="employee-request-form-section">
                  <input
                    type="file"
                    name="attachment"
                    onChange={handleChange}
                    className="employee-request-file"
                  />
                  <button type="submit" disabled={loading} className="employee-request-submit">
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
                {error && <div className="employee-request-error">{error}</div>}
              </form>
            </div>
            <hr className="employee-request-divider" />
            <h3>My Requests</h3>
            <div className="employee-request-list">
              {requests.length === 0 && <div className="employee-request-empty">No requests yet.</div>}
              {requests.map(r => (
                <div className="employee-request-card" key={r._id}>
                  <div className="employee-request-card-header">
                    <span className="employee-request-card-title">{r.title}</span>
                    <span className={`employee-request-card-status status-${(r.status || '').toLowerCase()}`}>{r.status}</span>
                  </div>
                  <div className="employee-request-card-type">{r.type}</div>
                  <div className="employee-request-card-message">{r.message}</div>
                  {r.attachment && <a href={r.attachment} target="_blank" rel="noopener noreferrer">Attachment</a>}
                  {r.adminComment && <div className="employee-request-card-admin"><em>Admin: {r.adminComment}</em></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeRequest; 