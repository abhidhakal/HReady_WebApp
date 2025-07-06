import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import '/src/pages/admin/styles/AdminProfile.css';
import Toast from '/src/components/common/Toast.jsx';
import logo from '/src/assets/primary.webp';

const AdminProfile = () => {
  const { id } = useParams();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    contactNo: '',
    profilePicture: '',
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

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({
          ...prev,
          profilePicture: reader.result,
        }));
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await api.put('/admins/me', profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditing(false);
      setToast({ message: 'Profile updated successfully.', type: 'success' });
      fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      if (err.response && err.response.status === 413) {
        setToast({
          message: 'Image too large. Please use a smaller profile picture.',
          type: 'error',
        });
      } else {
        setToast({ message: 'Failed to update profile. Please try again.', type: 'error' });
      }
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
        { headers: { Authorization: `Bearer ${token}` } }
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
                  localStorage.removeItem('token');
                  localStorage.removeItem('role');
                  localStorage.removeItem('userId');
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
            <div className="profile-picture-wrapper">
              <img
                src={profile.profilePicture || '/src/assets/profile.svg'}
                alt="Profile"
                className="profile-picture-large"
              />
              {editing && (
                <>
                  <label htmlFor="profilePicUpload" className="profile-picture-overlay">
                    <img src="/assets/icons/image_icon.svg" alt="Edit" className="edit-icon-image" />
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
            <h2>Hello, {profile.name}</h2>
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
              <p>Admin</p>
            </div>
          </div>

          <div className="profile-card full-width-card">
            <h3>Security</h3>
            <button
              className="save-btn"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
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
