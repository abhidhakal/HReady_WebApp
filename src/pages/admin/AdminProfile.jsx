import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import api from '/src/api/api.js';
import './styles/AdminProfile.css';
import Toast from '/src/components/Toast.jsx';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '/src/hooks/useAuth.js';
import { useToast } from '/src/hooks/useToast.js';
import { getApiBaseUrl } from '/src/utils/env.js';
// Import services
import { getAdminProfile, updateAdminProfile, uploadAdminProfilePicture, changeAdminPassword, deleteAdminAccount } from '/src/services/index.js';

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

const AdminProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    contactNo: '',
    profilePicture: '',
    role: 'Admin',
  });
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { getToken, fetchUserData, logout } = useAuth();
  const { toast, showToast, showSuccess, showError, hideToast } = useToast();
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const result = await getAdminProfile();
      if (result.success) {
        const userData = result.data;
        setProfile({
          name: userData.name,
          email: userData.email,
          contactNo: userData.contactNo || '',
          profilePicture: userData.profilePicture || '',
          role: userData.role || 'Admin',
        });
      } else {
        showError('Failed to fetch profile');
        console.error('Error fetching profile:', result.error);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      showError('Failed to fetch profile');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const resolveProfilePicture = (picture) => {
    if (!picture) return '/assets/images/profile.svg';
    
    // If it's already a full URL (Cloudinary), return it directly
    if (picture.startsWith('http')) return picture;
    
    // If it's a local path (legacy), try to construct the full URL
    if (picture.startsWith('/uploads')) {
      const base = getApiBaseUrl().replace(/\/api$/, '');
      const apiPath = `${base}/api${picture}`;
      const directPath = `${base}${picture}`;
      console.log('Legacy path detected, trying:', apiPath);
      return apiPath;
    }
    
    return '/assets/images/profile.svg';
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        showError('File is too large. Maximum size is 2 MB.');
        return;
      }

      console.log('Frontend: File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      setUploading(true);
      
      try {
        const result = await uploadAdminProfilePicture(file);
        if (result.success) {
          console.log('Frontend: Upload successful:', result.data);
          showSuccess('Profile picture updated successfully');
          fetchProfile();
        } else {
          showError('Failed to upload picture');
          console.error('Frontend: Error uploading profile picture:', result.error);
        }
      } catch (err) {
        console.error('Frontend: Error uploading profile picture:', err);
        showError('Failed to upload picture');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const result = await updateAdminProfile({
        name: profile.name,
        email: profile.email,
        contactNo: profile.contactNo,
      });
      
      if (result.success) {
        setEditing(false);
        showSuccess('Profile updated successfully');
        fetchProfile();
      } else {
        showError('Failed to update profile');
        console.error('Error updating profile:', result.error);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      showError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (passwords) => {
    if (passwords.new !== passwords.confirm) {
      showError('New passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      const result = await changeAdminPassword(passwords.current, passwords.new);
      
      if (result.success) {
        setShowPasswordModal(false);
        showSuccess('Password changed successfully');
      } else {
        showError('Failed to change password');
        console.error('Error changing password:', result.error);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      showError('Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) return;
    try {
      const result = await deleteAdminAccount();
      if (result.success) {
        localStorage.clear();
        navigate('/login');
      } else {
        showError('Failed to deactivate account');
        console.error('Error deactivating account:', result.error);
      }
    } catch (err) {
      console.error('Error deactivating account:', err);
      showError('Failed to deactivate account.');
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

  return (
    <div className="full-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      <DashboardHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} userRole="admin" />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/payroll`)}>Payroll Management</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/attendance`)}>Admin Attendance</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/tasks`)}>Manage Tasks</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/leaves`)}>Manage Leaves</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/announcements`)}>Manage Announcements</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/requests`)}>Requests</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}/profile`)}>Profile</a></li>
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
                        onError={(e) => {
                          console.log('Profile image failed to load:', e.target.src);
                          // Try direct path if API path failed
                          if (e.target.src.includes('/api/uploads')) {
                            const directPath = e.target.src.replace('/api/uploads', '/uploads');
                            console.log('Trying direct path:', directPath);
                            e.target.src = directPath;
                          } else {
                            e.target.src = '/assets/images/profile.svg';
                          }
                        }}
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
                      <button
                        className="profile-btn deactivate"
                        onClick={handleDeactivate}
                      >
                        <i className="fas fa-user-times"></i>
                        Deactivate Account
                      </button>
                    </div>
                  )}
                </div>

                <div className="profile-permissions-section">
                  <h4>Role Permissions</h4>
                  <div className="permissions-list">
                    <div className="permission-item">
                      <i className="fas fa-users"></i>
                      <span>Manage Employees</span>
                    </div>
                    <div className="permission-item">
                      <i className="fas fa-calendar-check"></i>
                      <span>View Attendance</span>
                    </div>
                    <div className="permission-item">
                      <i className="fas fa-bullhorn"></i>
                      <span>Manage Announcements</span>
                    </div>
                    <div className="permission-item">
                      <i className="fas fa-tasks"></i>
                      <span>Manage Tasks</span>
                    </div>
                    <div className="permission-item">
                      <i className="fas fa-calendar-alt"></i>
                      <span>Manage Leaves</span>
                    </div>
                    <div className="permission-item">
                      <i className="fas fa-clipboard-list"></i>
                      <span>Handle Requests</span>
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
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
};

export default AdminProfile;
