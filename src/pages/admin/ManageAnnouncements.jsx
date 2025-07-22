import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import DashboardHeader from '../../components/common/DashboardHeader.jsx';
import './styles/ManageAnnouncements.css';

const Card = ({ children }) => (
  <div className="announcement-card">{children}</div>
);

const LoadingShimmer = () => (
  <div className="announcement-loading-shimmer">
    <div className="shimmer-header">
      <div className="shimmer-icon"></div>
      <div className="shimmer-title"></div>
      <div className="shimmer-actions"></div>
    </div>
    <div className="shimmer-chips">
      <div className="shimmer-chip"></div>
      <div className="shimmer-chip"></div>
    </div>
    <div className="shimmer-message"></div>
  </div>
);

const AnnouncementDialog = ({ open, onClose, onSubmit, initialData, editing, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: 'all'
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        message: initialData.message || '',
        audience: initialData.audience || 'all'
      });
    } else {
      setFormData({
        title: '',
        message: '',
        audience: 'all'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!open) return null;

  return (
    <div className="announcement-modal-overlay">
      <div className="announcement-modal-content">
        <div className="announcement-modal-header">
          <h3>
            <i className={`fas ${editing ? 'fa-edit' : 'fa-plus'}`}></i>
            {editing ? 'Edit Announcement' : 'Add Announcement'}
          </h3>
          <button className="announcement-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="announcement-form">
          <div className="form-field">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter announcement title"
            />
          </div>

          <div className="form-field">
            <label>Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              className="form-input"
              rows="4"
              placeholder="Enter announcement message"
            />
          </div>

          <div className="form-field">
            <label>Audience</label>
            <select
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              className="form-input"
            >
              <option value="all">All</option>
              <option value="employees">Employees</option>
              <option value="management">Management</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="form-btn cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="form-btn submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {editing ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                editing ? 'Update' : 'Add'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageAnnouncements = () => {
  const { id } = useParams();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(res.data);
    } catch (err) {
      setError('Failed to fetch announcements');
      console.error('Error fetching announcements:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingAnnouncement) {
        await api.put(`/announcements/${editingAnnouncement._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/announcements', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setDialogOpen(false);
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (err) {
      console.error('Error saving announcement:', err);
      alert('Failed to save announcement');
    }
    setFormLoading(false);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await api.delete(`/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
      alert('Failed to delete announcement');
    }
  };

  const handleAdd = () => {
    setEditingAnnouncement(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingAnnouncement(null);
  };

  const getAudienceColor = (audience) => {
    switch (audience) {
      case 'all':
        return '#2196f3';
      case 'employees':
        return '#4caf50';
      case 'management':
        return '#ff9800';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
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
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}/announcements`)}>Manage Announcements</a></li>
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

        <div className="main-content-announcements">
          <div className="announcements-header">
            <h2>Announcements</h2>
            <button
              className="add-announcement-btn"
              onClick={handleAdd}
            >
              <i className="fas fa-plus"></i>
              Add Announcement
            </button>
          </div>

          {error && (
            <div className="announcements-error">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {loading && (
            <div className="announcements-loading-container">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}>
                  <LoadingShimmer />
                </Card>
              ))}
            </div>
          )}

          {!loading && announcements.length === 0 && !error && (
            <div className="announcements-empty-state">
              <i className="fas fa-bullhorn"></i>
              <p>No announcements yet!</p>
            </div>
          )}

          {!loading && announcements.length > 0 && (
            <div className="announcements-list-container">
              {announcements.map((announcement) => {
                const isLong = announcement.message.length > 120;
                return (
                  <Card key={announcement._id}>
                    <div className="announcement-card-header">
                      <div className="announcement-icon">
                        <i className="fas fa-bullhorn"></i>
                      </div>
                      <div className="announcement-title">
                        {announcement.title}
                      </div>
                      <div className="announcement-actions">
                        <button
                          className="announcement-action-btn edit"
                          onClick={() => handleEdit(announcement)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="announcement-action-btn delete"
                          onClick={() => handleDelete(announcement._id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <div className="announcement-chips">
                      <span 
                        className="announcement-chip audience"
                        style={{ backgroundColor: getAudienceColor(announcement.audience) }}
                      >
                        {announcement.audience}
                      </span>
                      {announcement.createdAt && (
                        <span className="announcement-chip date">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="announcement-message">
                      {isLong ? (
                        <>
                          <p>{announcement.message.substring(0, 120)}...</p>
                          <button 
                            className="read-more-btn"
                            onClick={() => {
                              alert(`${announcement.title}\n\n${announcement.message}`);
                            }}
                          >
                            Read More
                          </button>
                        </>
                      ) : (
                        <p>{announcement.message}</p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnnouncementDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        initialData={editingAnnouncement}
        editing={!!editingAnnouncement}
        loading={formLoading}
      />
    </div>
  );
};

export default ManageAnnouncements;
