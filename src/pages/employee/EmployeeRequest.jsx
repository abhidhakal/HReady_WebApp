import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
// import logo from '../../assets/primary_icon.webp';
import api from '/src/api/api.js';
import './styles/EmployeeRequest.css';
import Skeleton from '@mui/material/Skeleton';

// Validation schema for request form
const RequestSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters'),
  message: Yup.string()
    .required('Message is required')
    .min(10, 'Message must be at least 10 characters'),
  type: Yup.string()
    .required('Type is required')
    .oneOf(['request', 'report'], 'Invalid type'),
});

const Card = ({ children }) => (
  <div className="request-card">{children}</div>
);

const RequestForm = ({ onSubmit, loading }) => {
  const [showForm, setShowForm] = useState(false);

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
        <Formik
          initialValues={{
            title: '',
            message: '',
            type: 'request',
            attachment: null,
          }}
          validationSchema={RequestSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            onSubmit(values);
            resetForm();
            setShowForm(false);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, errors, touched, setFieldValue }) => (
            <Form className="request-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Title</label>
                  <Field
                    name="title"
                    placeholder="Enter a title"
                    className={`form-input ${errors.title && touched.title ? 'error' : ''}`}
                  />
                  <ErrorMessage name="title" component="div" className="error-message" />
                </div>

                <div className="form-field">
                  <label>Type</label>
                  <Field
                    as="select"
                    name="type"
                    className={`form-input ${errors.type && touched.type ? 'error' : ''}`}
                  >
                    <option value="request">Request</option>
                    <option value="report">Report</option>
                  </Field>
                  <ErrorMessage name="type" component="div" className="error-message" />
                </div>
              </div>

              <div className="form-field">
                <label>Message</label>
                <Field
                  as="textarea"
                  name="message"
                  placeholder="Describe your request or report"
                  className={`form-input ${errors.message && touched.message ? 'error' : ''}`}
                  rows="4"
                />
                <ErrorMessage name="message" component="div" className="error-message" />
              </div>

              <div className="form-field">
                <label>Attachment (Optional)</label>
                <input
                  type="file"
                  onChange={(event) => {
                    setFieldValue("attachment", event.currentTarget.files[0]);
                  }}
                  className="form-input file-input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="form-btn cancel"
                  onClick={() => setShowForm(false)}
                  disabled={loading || isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="form-btn submit"
                  disabled={loading || isSubmitting}
                >
                  {loading || isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    'Send Request'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
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
            <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
            <li><a onClick={() => navigate(`/employee/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/attendance`)}>Attendance</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/payroll`)}>My Payroll</a></li>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="30%" height={18} />
                      <Skeleton variant="text" width="80%" height={18} />
                      <Skeleton variant="rectangular" width="100%" height={40} style={{ margin: '12px 0' }} />
                    </div>
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