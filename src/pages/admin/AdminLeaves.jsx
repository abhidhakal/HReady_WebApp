import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import api from '/src/api/api.js';
import './styles/AdminLeaves.css';
import Skeleton from '@mui/material/Skeleton';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '/src/hooks/useAuth.js';

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

// Validation schema for admin leave form
const AdminLeaveSchema = Yup.object().shape({
  leaveType: Yup.string()
    .required('Leave type is required'),
  startDate: Yup.date()
    .required('Start date is required')
    .min(new Date(), 'Start date cannot be in the past'),
  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date must be after start date'),
  reason: Yup.string()
    .required('Reason is required')
    .min(10, 'Reason must be at least 10 characters long'),
});

const Card = ({ children }) => (
  <div className="leave-card">{children}</div>
);

function AdminLeaves() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const [leaves, setLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const { getToken } = useAuth();

  const fetchLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/leaves/all', {
        headers: { Authorization: `Bearer ${getToken()}` },
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
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      fetchLeaves();
    } catch (err) {
      console.error(`Error updating leave status:`, err);
      alert('Failed to update leave status.');
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setFormLoading(true);
    try {
      const payload = new FormData();
      payload.append('leaveType', values.leaveType);
      payload.append('startDate', values.startDate);
      payload.append('endDate', values.endDate);
      payload.append('reason', values.reason);
      payload.append('halfDay', values.halfDay);
      if (values.attachment) {
        payload.append('attachment', values.attachment);
      }

      await api.post('/leaves/admin', payload, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Leave created successfully.');
      resetForm();
      setShowForm(false);
      fetchLeaves();
    } catch (err) {
      console.error('Error submitting leave:', err);
      alert('Error creating leave.');
    }
    setFormLoading(false);
    setSubmitting(false);
  };

  const handleAttachmentClick = (attachmentUrl) => {
    if (attachmentUrl) {
      window.open(`${import.meta.env.VITE_API_BASE_URL}/${attachmentUrl}`, '_blank');
    }
  };



  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={() => toggleSidebar()} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
          <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/payroll`)}>Payroll Management</a></li>
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
                setShowForm(!showForm);
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
              <Formik
                initialValues={{
                  leaveType: '',
                  startDate: '',
                  endDate: '',
                  reason: '',
                  halfDay: false,
                  attachment: null,
                }}
                validationSchema={AdminLeaveSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, errors, touched, setFieldValue, values }) => (
                  <Form className="leave-form">
                    <div className="form-grid">
                      <div className="form-field">
                        <label>Leave Type</label>
                        <Field
                          as="select"
                          name="leaveType"
                          className={`form-input ${errors.leaveType && touched.leaveType ? 'error' : ''}`}
                        >
                          <option value="">Select Leave Type</option>
                          <option value="Casual">Casual</option>
                          <option value="Sick">Sick</option>
                          <option value="Emergency">Emergency</option>
                          <option value="Annual">Annual</option>
                          <option value="Other">Other</option>
                        </Field>
                        <ErrorMessage name="leaveType" component="div" className="error-message" />
                      </div>

                      <div className="form-field">
                        <label>Start Date</label>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="Start Date"
                            value={values.startDate ? new Date(values.startDate) : null}
                            onChange={date => setFieldValue('startDate', date ? date.toISOString().split('T')[0] : '')}
                            renderInput={params => (
                              <TextField {...params} className={`form-input ${errors.startDate && touched.startDate ? 'error' : ''}`} />
                            )}
                          />
                        </LocalizationProvider>
                        <ErrorMessage name="startDate" component="div" className="error-message" />
                      </div>

                      <div className="form-field">
                        <label>End Date</label>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            label="End Date"
                            value={values.endDate ? new Date(values.endDate) : null}
                            onChange={date => setFieldValue('endDate', date ? date.toISOString().split('T')[0] : '')}
                            renderInput={params => (
                              <TextField {...params} className={`form-input ${errors.endDate && touched.endDate ? 'error' : ''}`} />
                            )}
                          />
                        </LocalizationProvider>
                        <ErrorMessage name="endDate" component="div" className="error-message" />
                      </div>

                      <div className="form-field">
                        <label>Reason</label>
                        <Field
                          as="textarea"
                          name="reason"
                          className={`form-input ${errors.reason && touched.reason ? 'error' : ''}`}
                          rows="3"
                          placeholder="Enter reason for leave"
                        />
                        <ErrorMessage name="reason" component="div" className="error-message" />
                      </div>

                      <div className="form-field checkbox-field">
                        <label className="checkbox-label">
                          <Field
                            type="checkbox"
                            name="halfDay"
                            className="checkbox-input"
                          />
                          <span className="checkbox-text">Half Day</span>
                        </label>
                      </div>

                      <div className="form-field">
                        <label>Attachment (optional)</label>
                        <input
                          type="file"
                          onChange={(event) => {
                            setFieldValue("attachment", event.currentTarget.files[0]);
                          }}
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
                            }}
                            disabled={formLoading || isSubmitting}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            className="form-btn submit"
                            disabled={formLoading || isSubmitting}
                          >
                            {formLoading || isSubmitting ? (
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
                  </Form>
                )}
              </Formik>
            </Card>
          )}

          {loading && (
            <div className="leaves-loading-container">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={18} />
                    <Skeleton variant="text" width="80%" height={18} />
                    <Skeleton variant="rectangular" width="100%" height={40} style={{ margin: '12px 0' }} />
                  </div>
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
