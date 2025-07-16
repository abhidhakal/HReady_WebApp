import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form } from 'formik';
import api from '../../api/axios';
import '/src/pages/admin/styles/ManageEmployees.css';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import logo from '/src/assets/primary_icon.webp';

const ManageEmployees = () => {
  const { id } = useParams();
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

  const handleEdit = (employee) => {
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      password: '',
      profilePicture: employee.profilePicture || '',
      contactNo: employee.contactNo || '',
      department: employee.department || '',
      position: employee.position || '',
      status: employee.status || 'active',
    });
    setEditingId(employee._id);
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
      <DashboardHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/attendance`)}>Admin Attendance</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/tasks`)}>Manage Tasks</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/leaves`)}>Manage Leaves</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/announcements`)}>Manage Announcements</a></li>
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
          <div className="manage-employees">
            <h2>Manage Employees</h2>

            <Formik
              enableReinitialize
              initialValues={{
                name: formData.name,
                email: formData.email,
                password: '',
                profilePicture: formData.profilePicture,
                contactNo: formData.contactNo,
                department: formData.department,
                position: formData.position,
                status: formData.status || 'active',
              }}
              onSubmit={async (values, { resetForm }) => {
                try {
                  if (editingId) {
                    await api.put(`/employees/${editingId}`, values, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                  } else {
                    await api.post('/employees', values, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                  }
                  setEditingId(null);
                  fetchEmployees();
                  resetForm();
                } catch (err) {
                  console.error('Error saving employee:', err);
                  if (err.response) {
                    console.error('Server said:', err.response.data);
                  }
                }
              }}
            >
              {({ values, handleChange }) => (
                <Form>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={values.name}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={values.email}
                    onChange={handleChange}
                    required
                  />
                  {!editingId && (
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={values.password}
                      onChange={handleChange}
                      required
                    />
                  )}
                  <input
                    type="text"
                    name="profilePicture"
                    placeholder="Profile Picture URL"
                    value={values.profilePicture}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="contactNo"
                    placeholder="Contact No"
                    value={values.contactNo}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="department"
                    placeholder="Department"
                    value={values.department}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    name="position"
                    placeholder="Position"
                    value={values.position}
                    onChange={handleChange}
                  />
                  <select
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <button type="submit">{editingId ? 'Update' : 'Add'} Employee</button>
                </Form>
              )}
            </Formik>

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
