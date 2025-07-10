import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import '/src/pages/admin/styles/AdminProfile.css';
import Toast from '/src/components/common/Toast.jsx';
import logo from '/src/assets/primary_icon.webp';

const AdminProfile = () => {
  const { id } = useParams();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    contactNo: '',
    profilePicture: '',
    role: 'admin',
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false,
  });
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/admins/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile({
        name: res.data.name,
        email: res.data.email,
        contactNo: res.data.contactNo || '',
        profilePicture: res.data.profilePicture || '',
        role: res.data.role || 'Admin',
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const resolveProfilePicture = (picture) => {
    if (!picture) return '/src/assets/profile.svg';
    if (picture.startsWith('PHN2Zy')) return `data:image/svg+xml;base64,${picture}`;
    if (picture.startsWith('/')) return `${import.meta.env.VITE_API_BASE_URL}${picture}`;
    if (picture.startsWith('http')) return picture;
    return `data:image/png;base64,${picture}`;
  };

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
        await api.put('/admins/upload-profile-picture', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setToast({ message: 'Profile picture updated.', type: 'success' });
        fetchProfile();
      } catch (err) {
        console.error('Error uploading profile picture:', err);
        setToast({ message: 'Failed to upload picture.', type: 'error' });
      } finally {
        setUploading(false);
      }
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await api.put(
        '/admins/me',
        {
          name: profile.name,
          email: profile.email,
          contactNo: profile.contactNo,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setToast({ message: 'New passwords do not match.', type: 'error' });
      return;
    }
    try {
      setLoading(true);
      await api.put(
        '/admins/change-password',
        {
          currentPassword: passwords.current,
          newPassword: passwords.new,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPasswords({
        current: '',
        new: '',
        confirm: '',
        showCurrent: false,
        showNew: false,
        showConfirm: false,
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

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate your account?')) return;
    try {
      await api.delete('/admins/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      console.error('Error deactivating account:', err);
      setToast({ message: 'Failed to deactivate account.', type: 'error' });
    }
  };

  return (
    <div className="full-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      <DashboardHeader onToggleSidebar={toggleSidebar} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate('/admin/employees')}>Manage Employees</a></li>
            <li><a onClick={() => navigate('/admin/attendance')}>Admin Attendance</a></li>
            <li><a href="#">Manage Tasks</a></li>
            <li><a href="#">Leave Requests</a></li>
            <li><a onClick={() => navigate('/admin/announcements')}>Manage Announcements</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}/profile`)}>Profile</a></li>
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

        <div className="main-content profile-page">
          <div className="profile-banner">
            <div className="profile-banner-left">
              <img
                src={resolveProfilePicture(profile.profilePicture)}
                alt="Profile"
                className="profile-banner-picture"
              />
              {editing && (
                <>
                  <label htmlFor="profilePicUpload" className="profile-picture-overlay">
                    <img
                      src="/assets/icons/edit_icon.svg"
                      alt="Edit"
                      className="edit-icon-image"
                    />
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

            <div className="profile-banner-text">
              <h2>Hello,</h2>
              <p>{profile.name}</p>
            </div>
            <button
              className="edit-profile-btn"
              onClick={() => {
                if (editing) {
                  setToast({ message: 'Edit cancelled.', type: 'info' });
                  fetchProfile();
                }
                setEditing(!editing);
              }}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div className="profile-cards-horizontal">
            <div className="profile-card">
              <h3>Personal Information</h3>
              <div className="profile-field">
                <label>Name:</label>
                {editing ? (
                  <input name="name" value={profile.name} onChange={handleChange} />
                ) : (
                  <span>{profile.name}</span>
                )}
              </div>
              <div className="profile-field">
                <label>Email:</label>
                {editing ? (
                  <input name="email" value={profile.email} onChange={handleChange} />
                ) : (
                  <span>{profile.email}</span>
                )}
              </div>
              <div className="profile-field">
                <label>Contact No:</label>
                {editing ? (
                  <input name="contactNo" value={profile.contactNo} onChange={handleChange} />
                ) : (
                  <span>{profile.contactNo || '-'}</span>
                )}
              </div>
              {editing && (
                <button
                  className="save-btn"
                  onClick={handleSaveProfile}
                  disabled={loading || uploading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>

            <div className="profile-card">
              <h3>Role</h3>
              <p>{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</p>
              <ul className="role-permissions">
                <li>Manage Employees</li>
                <li>View Attendance</li>
                <li>Manage Announcements</li>
              </ul>
            </div>
          </div>

          <div className="profile-card full-width-card change-password-card">
            <h3 className="clickable-title">Security</h3>
            <div className="card-actions">
              <button
                className="change-password-btn"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
              <button
                className="deactivate-account-btn"
                onClick={handleDeactivate}
              >
                Deactivate Account
              </button>
            </div>
          </div>

          {showPasswordModal && (
            <div className="modal-overlay">
              <div className="modal large-modal">
                <h3>Change Password</h3>
                {['current', 'new', 'confirm'].map((field) => (
                  <div className="modal-field-row" key={field}>
                    <input
                      type={
                        passwords[`show${field[0].toUpperCase() + field.slice(1)}`]
                          ? 'text'
                          : 'password'
                      }
                      name={field}
                      value={passwords[field]}
                      onChange={handlePasswordChange}
                      placeholder={
                        field === 'current'
                          ? 'Current Password'
                          : field === 'new'
                          ? 'New Password'
                          : 'Confirm New Password'
                      }
                    />
                    <button
                      className="toggle-visibility-btn"
                      onClick={() =>
                        setPasswords((prev) => ({
                          ...prev,
                          [`show${field[0].toUpperCase() + field.slice(1)}`]:
                            !prev[`show${field[0].toUpperCase() + field.slice(1)}`],
                        }))
                      }
                    >
                      <img
                        src={
                          passwords[`show${field[0].toUpperCase() + field.slice(1)}`]
                            ? '/assets/icons/view_on.svg'
                            : '/assets/icons/view_off.svg'
                        }
                        alt="Toggle"
                      />
                    </button>
                  </div>
                ))}

                <div className="modal-actions">
                  <button onClick={handleChangePassword} disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswords({
                        current: '',
                        new: '',
                        confirm: '',
                        showCurrent: false,
                        showNew: false,
                        showConfirm: false,
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
