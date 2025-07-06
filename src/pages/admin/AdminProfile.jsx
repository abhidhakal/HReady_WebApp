import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import '/src/pages/admin/styles/AdminProfile.css';
import Toast from '/src/components/common/Toast.jsx';

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
      setToast({ message: 'Failed to update profile.', type: 'error' });
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
          {/* Sidebar unchanged */}
        </nav>

        <div className="main-content profile-page">
          <div className="profile-banner">
            <img
              src={profile.profilePicture || '/src/assets/profile.svg'}
              alt="Profile"
              className="profile-picture-large"
            />
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
              <div className="profile-field">
                <label>Profile Picture URL:</label>
                {editing ? (
                  <input
                    name="profilePicture"
                    value={profile.profilePicture}
                    onChange={handleChange}
                  />
                ) : (
                  <span>{profile.profilePicture || '-'}</span>
                )}
              </div>
              {editing && (
                <button
                  className="save-btn"
                  onClick={handleSaveProfile}
                  disabled={loading}
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
                    }} >
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
