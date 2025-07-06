import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import '/src/pages/admin/styles/ManageEmployees.css';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import logo from '/src/assets/primary.webp';

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profilePicture: '',
    contactNo: '',
    role: 'employee',
    department: '',
    position: '',
    status: 'active',
  });
  const [editingId, setEditingId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const token = localStorage.getItem('token');
  const id = localStorage.getItem('userId');
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/employees', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setFormData({
        name: '',
        email: '',
        password: '',
        profilePicture: '',
        contactNo: '',
        role: 'employee',
        department: '',
        position: '',
        status: 'active'
      });
      setEditingId(null);
      fetchEmployees();
    } catch (err) {
      console.error('Error saving employee:', err);
      if (err.response) {
        console.error('Server said:', err.response.data);
      }
    }
  };

  const handleEdit = (employee) => {
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      password: '',
      profilePicture: employee.profilePicture || '',
      contactNo: employee.contactNo || '',
      department: employee.department || '',
      position: employee.position || '',
      status: employee.status || 'active'
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
    }
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate('/admin/employees')}>Manage Employees</a></li>
            <li><a href="#">Attendance Logs</a></li>
            <li><a href="#">Manage Tasks</a></li>
            <li><a href="#">Leave Requests</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate('/admin/announcements')}>Manage Announcements</a></li>
            <li><a href="#">Settings</a></li>
            <li>
              <a className="nav-logout" onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                localStorage.removeItem('userId');
                navigate('/login');
              }}>Log Out</a>
            </li>
          </ul>
        </nav>

        <div className="main-content">
          <div className="manage-employees">
            <h2>Manage Employees</h2>

            <form onSubmit={handleSubmit}>
              <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              {!editingId && (
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
              )}
              <input type="text" name="profilePicture" placeholder="Profile Picture URL" value={formData.profilePicture} onChange={handleChange} />
              <input type="text" name="contactNo" placeholder="Contact No" value={formData.contactNo} onChange={handleChange} />
              <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} />
              <input type="text" name="position" placeholder="Position" value={formData.position} onChange={handleChange} />
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button type="submit">{editingId ? 'Update' : 'Add'} Employee</button>
            </form>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Date Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td>{new Date(emp.date_of_joining).toLocaleDateString()}</td>
                    <td>{emp.status}</td>
                    <td>
                      <button onClick={() => handleEdit(emp)}>Edit</button>
                      <button onClick={() => handleDelete(emp._id)}>Delete</button>
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

export default ManageEmployees;
