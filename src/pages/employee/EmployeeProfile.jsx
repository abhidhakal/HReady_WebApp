import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import api from '/src/api/api.js';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import './styles/EmployeeProfile.css';
import Toast from '/src/components/Toast.jsx';
import { getApiBaseUrl } from '../../utils/env';
import Skeleton from '@mui/material/Skeleton';

// Validation schema for password change
const PasswordSchema = Yup.object().shape({
  current: Yup.string()
    .required('Current password is required'),
  new: Yup.string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirm: Yup.string()
    .required('Please confirm your new password')
    .oneOf([Yup.ref('new'), null], 'Passwords must match'),
});

const Card = ({ children }) => (
  <div className="profile-card">{children}</div>
);

const PasswordModal = ({ open, onClose, onSubmit, loading }) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!open) return null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-content">
        <div className="profile-modal-header">
          <h3>
            <i className="fas fa-lock"></i>
            Change Password
          </h3>
          <button className="profile-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <Formik
          initialValues={{
            current: '',
            new: '',
            confirm: '',
          }}
          validationSchema={PasswordSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            onSubmit(values);
            resetForm();
            setShowCurrent(false);
            setShowNew(false);
            setShowConfirm(false);
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="password-form">
              <div className="form-field">
                <label>Current Password</label>
                <div className="password-input-group">
                  <Field
                    type={showCurrent ? 'text' : 'password'}
                    name="current"
                    placeholder="Enter current password"
                    className={`form-input ${errors.current && touched.current ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    className="toggle-visibility-btn"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    <i className={`fas ${showCurrent ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                </div>
                <ErrorMessage name="current" component="div" className="error-message" />
              </div>

              <div className="form-field">
                <label>New Password</label>
                <div className="password-input-group">
                  <Field
                    type={showNew ? 'text' : 'password'}
                    name="new"
                    placeholder="Enter new password"
                    className={`form-input ${errors.new && touched.new ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    className="toggle-visibility-btn"
                    onClick={() => setShowNew(!showNew)}
                  >
                    <i className={`fas ${showNew ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                </div>
                <ErrorMessage name="new" component="div" className="error-message" />
              </div>

              <div className="form-field">
                <label>Confirm New Password</label>
                <div className="password-input-group">
                  <Field
                    type={showConfirm ? 'text' : 'password'}
                    name="confirm"
                    placeholder="Confirm new password"
                    className={`form-input ${errors.confirm && touched.confirm ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    className="toggle-visibility-btn"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    <i className={`fas ${showConfirm ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                  </button>
                </div>
                <ErrorMessage name="confirm" component="div" className="error-message" />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="form-btn cancel"
                  onClick={onClose}
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
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

const EmployeeProfile = () => {
  const { id } = useParams();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    contactNo: '',
    profilePicture: '',
    role: 'employee',
  });
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const resolveProfilePicture = (picture) => {
    if (!picture) return '/assets/images/profile.svg';
    const base = getApiBaseUrl().replace(/\/api$/, '');
    if (picture.startsWith('/uploads')) return `${base}/api${picture}`;
    if (picture.startsWith('http')) return picture;
    return '/assets/images/profile.svg';
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile({
        name: res.data.name,
        email: res.data.email,
        contactNo: res.data.contactNo || '',
        profilePicture: res.data.profilePicture || '',
        role: res.data.role || 'employee',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setToast({ message: 'Failed to fetch profile', type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setToast({ message: 'File is too large. Maximum size is 2 MB.', type: 'error' });
        return;
      }

      setUploading(true);
      const formData = new FormData();
      formData.append('profilePicture', file);

      try {
        await api.put('/employees/upload-profile-picture', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setToast({ message: 'Profile picture updated successfully.', type: 'success' });
        fetchProfile();
      } catch (err) {
        console.error('Error uploading profile picture:', err);
        setToast({ message: 'Failed to upload picture.', type: 'error' });
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await api.put('/employees/me', {
        name: profile.name,
        email: profile.email,
        contactNo: profile.contactNo,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditing(false);
      setToast({ message: 'Profile updated successfully.', type: 'success' });
      fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      setToast({ message: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (passwords) => {
    if (passwords.new !== passwords.confirm) {
      setToast({ message: 'New passwords do not match.', type: 'error' });
      return;
    }
    try {
      setLoading(true);
      await api.put('/employees/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowPasswordModal(false);
      setToast({ message: 'Password changed successfully.', type: 'success' });
    } catch (err) {
      console.error('Error changing password:', err);
      setToast({ message: 'Failed to change password.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      <DashboardHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} userRole="employee" />
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
            <li><a onClick={() => navigate(`/employee/${id}/requests`)}>Requests</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/employee/${id}/profile`)}>Profile</a></li>
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

        <div className="main-content-profile">
          {loading && !editing ? (
            <div className="profile-loading-container">
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <Skeleton variant="circular" width={80} height={80} />
                  <div>
                    <Skeleton variant="text" width={180} height={32} />
                    <Skeleton variant="text" width={220} height={24} />
                    <Skeleton variant="text" width={120} height={20} />
                  </div>
                </div>
                <div style={{ marginTop: 32 }}>
                  <Skeleton variant="rectangular" width="100%" height={60} style={{ marginBottom: 16 }} />
                  <Skeleton variant="rectangular" width="100%" height={40} />
                </div>
              </Card>
            </div>
          ) : (
            <div className="profile-content">
              <Card>
                <div className="profile-main-section">
                  <div className="profile-avatar-section">
                    <div className="profile-avatar-container">
                      <img
                        src={resolveProfilePicture(profile.profilePicture)}
                        alt="Profile"
                        className="profile-avatar"
                      />
                      {editing && (
                        <>
                          <label htmlFor="profilePicUpload" className="profile-avatar-overlay">
                            <i className="fas fa-camera"></i>
                          </label>
                          <input
                            id="profilePicUpload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                          />
                        </>
                      )}
                    </div>
                    
                    <div className="profile-info">
                      <h3 className="profile-name">{profile.name}</h3>
                      <p className="profile-email">{profile.email}</p>
                      <p className="profile-role">Role: {profile.role}</p>
                      {profile.contactNo && (
                        <p className="profile-contact">Contact: {profile.contactNo}</p>
                      )}
                    </div>
                  </div>

                  {editing ? (
                    <div className="profile-edit-section">
                      <div className="form-field">
                        <label>Name</label>
                        <input
                          type="text"
                          name="name"
                          value={profile.name}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your name"
                        />
                      </div>
                      
                      <div className="form-field">
                        <label>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profile.email}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your email"
                        />
                      </div>
                      
                      <div className="form-field">
                        <label>Contact Number</label>
                        <input
                          type="text"
                          name="contactNo"
                          value={profile.contactNo}
                          onChange={handleChange}
                          className="form-input"
                          placeholder="Enter your contact number"
                        />
                      </div>

                      <div className="profile-edit-actions">
                        <button
                          className="profile-btn cancel"
                          onClick={() => {
                            setEditing(false);
                            fetchProfile();
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          className="profile-btn save"
                          onClick={handleSaveProfile}
                          disabled={loading || uploading}
                        >
                          {loading ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="profile-actions">
                      <button
                        className="profile-btn edit"
                        onClick={() => setEditing(true)}
                      >
                        <i className="fas fa-edit"></i>
                        Edit Profile
                      </button>
                      <button
                        className="profile-btn password"
                        onClick={() => setShowPasswordModal(true)}
                      >
                        <i className="fas fa-lock"></i>
                        Change Password
                      </button>
                    </div>
                  )}
                </div>

                <div className="profile-permissions-section">
                  <h4>Employee Permissions</h4>
                  <div className="permissions-list">
                    <div className="permission-item">
                      <i className="fas fa-calendar-check"></i>
                      <span>View Attendance</span>
                    </div>
                    <div className="permission-item">
                      <i className="fas fa-tasks"></i>
                      <span>View Tasks</span>
                    </div>
                    <div className="permission-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>Request Leaves</span>
                    </div>
                    <div className="permission-item">
                      <i className="fas fa-bullhorn"></i>
                      <span>View Announcements</span>
                    </div>
                    <div className="permission-item">
                      <i className="fas fa-clipboard-list"></i>
                      <span>Submit Requests</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <PasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handleChangePassword}
        loading={loading}
      />
    </div>
  );
};

export default EmployeeProfile;
