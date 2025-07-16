import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import logo from '/src/assets/primary_icon.webp';
import '/src/pages/admin/styles/ManageAnnouncements.css'

const ManageAnnouncements = () => {
  const { id } = useParams();
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: 'all'
  });
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnnouncements(res.data);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/announcements/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/announcements', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setFormData({ title: '', message: '', audience: 'all' });
      setEditingId(null);
      fetchAnnouncements();
    } catch (err) {
      console.error('Error saving announcement:', err);
    }
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title || '',
      message: announcement.message || '',
      audience: announcement.audience || 'all'
    });
    setEditingId(announcement._id);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAnnouncements();
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/attendance`)}>Admin Attendance</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/tasks`)}>Manage Tasks</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/leaves`)}>Manage Leaves</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}/announcements`)}>Manage Announcements</a></li>
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
          <div className="manage-announcements">
            <h2>Manage Announcements</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                placeholder="Message"
                value={formData.message}
                onChange={handleChange}
                required
                style={{
                  gridColumn: 'span 2',
                  height: '100px',
                  padding: '10px',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem'
                }}
              />
              <select name="audience" value={formData.audience} onChange={handleChange}>
                <option value="all">All</option>
                <option value="employees">Employees</option>
                <option value="management">Management</option>
              </select>
              <button type="submit">{editingId ? 'Update' : 'Add'} Announcement</button>
            </form>

            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Audience</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((ann) => (
                  <tr key={ann._id}>
                    <td>{ann.title}</td>
                    <td>{ann.message}</td>
                    <td>{ann.audience}</td>
                    <td>
                      <button onClick={() => handleEdit(ann)}>Edit</button>
                      <button onClick={() => handleDelete(ann._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAnnouncements;
