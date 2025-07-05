import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import '../pages/css/ManageAnnouncements.css';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import lightLogo from '/src/assets/light_noicon.png';

const ManageAnnouncements = () => {
  const id = localStorage.getItem('userId');
  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    audience: 'all',
    postedBy: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

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
      const body = { ...formData, postedBy: role };
      if (editingId) {
        await api.put(`/announcements/${editingId}`, body, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/announcements', body, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setFormData({ title: '', message: '', audience: 'all', postedBy: '' });
      setEditingId(null);
      fetchAnnouncements();
    } catch (err) {
      console.error('Error saving announcement:', err);
    }
  };

  const handleEdit = (announcement) => {
    setFormData(announcement);
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
            <li><img src={lightLogo} alt="Logo" /></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate('/admin/employees')}>Manage Employees</a></li>
            <li><a href="#">Attendance Logs</a></li>
            <li><a href="#">Leave Requests</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate('/admin/announcements')}>Manage Announcements</a></li>
            <li><a href="#">Settings</a></li>
            <li><a className="nav-logout" onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    navigate('/login');
            }}>Log Out</a></li>
          </ul>
        </nav>

        <div className="main-content">
          <div className="manage-announcements">
            <h2>Manage Announcements</h2>
            <form onSubmit={handleSubmit}>
              <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
              <textarea name="message" placeholder="Message" value={formData.message} onChange={handleChange} required style={{ gridColumn: 'span 2', height: '100px', padding: '10px', fontFamily: 'inherit', fontSize: '0.95rem' }} />
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
