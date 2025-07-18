import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form } from 'formik';
import api from '../../api/axios';
import '/src/pages/admin/styles/ManageEmployees.css';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import logo from '/src/assets/primary_icon.webp';
import '@fortawesome/fontawesome-free/css/all.min.css';

const statusColor = status => {
  switch ((status || '').toLowerCase()) {
    case 'active':
      return '#4caf50';
    case 'inactive':
      return '#f44336';
    default:
      return '#9e9e9e';
  }
};

const StatusChip = ({ status }) => (
  <span className={`employee-status-chip ${status?.toLowerCase()}`}>{status}</span>
);

const Avatar = ({ name }) => (
  <div className="employee-avatar">
    {name && name.length > 0 ? name[0].toUpperCase() : '?'}
  </div>
);

const Card = ({ children }) => (
  <div className="employee-card">{children}</div>
);

const EmployeeDialog = ({ open, onClose, onSubmit, initialValues, editing, loading }) => {
  const [showPassword, setShowPassword] = useState(false);
  if (!open) return null;
  return (
    <div className="employee-modal-overlay">
      <div className="employee-modal-content">
        <h3>{editing ? 'Edit Employee' : 'Add Employee'}</h3>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={onSubmit}
        >
          {({ values, handleChange }) => (
            <Form>
              <div className="employee-modal-form">
                <input type="text" name="name" placeholder="Name" value={values.name} onChange={handleChange} required className="outlined-input" />
                <input type="email" name="email" placeholder="Email" value={values.email} onChange={handleChange} required className="outlined-input" />
                {!editing && (
                  <div className="employee-password-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      value={values.password}
                      onChange={handleChange}
                      required
                      className="outlined-input"
                    />
                    <span
                      className="employee-password-toggle"
                      onClick={() => setShowPassword(s => !s)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </span>
                  </div>
                )}
                <input type="text" name="profilePicture" placeholder="Profile Picture URL" value={values.profilePicture} onChange={handleChange} className="outlined-input" />
                <input type="text" name="contactNo" placeholder="Contact No" value={values.contactNo} onChange={handleChange} className="outlined-input" />
                <input type="text" name="department" placeholder="Department" value={values.department} onChange={handleChange} className="outlined-input" />
                <input type="text" name="position" placeholder="Position" value={values.position} onChange={handleChange} className="outlined-input" />
                <select name="status" value={values.status} onChange={handleChange} className="outlined-input">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <div className="employee-modal-actions">
                  <button type="button" onClick={onClose} className="employee-action-btn cancel">Cancel</button>
                  <button type="submit" disabled={loading} className="employee-action-btn save">{loading ? 'Saving...' : (editing ? 'Update' : 'Add')}</button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

const ManageEmployees = () => {
  const { id } = useParams();
  const [employees, setEmployees] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
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
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await api.delete(`/employees/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingEmployee(null);
  };

  const handleDialogSubmit = async (values, { resetForm }) => {
    setDialogLoading(true);
    try {
      if (editingEmployee && editingEmployee._id) {
        await api.put(`/employees/${editingEmployee._id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post('/employees', values, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchEmployees();
      setDialogOpen(false);
      setEditingEmployee(null);
      resetForm();
    } catch (err) {
      console.error('Error saving employee:', err);
      if (err.response) {
        console.error('Server said:', err.response.data);
      }
    } finally {
      setDialogLoading(false);
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

        <div className="main-content-employees">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h2>Manage Employees</h2>
            <button onClick={handleAdd} className="add-employee-btn"><i className="fas fa-user-plus"></i>Add Employee</button>
          </div>

          {employees.length === 0 ? (
            <div style={{ color: '#888', display: 'flex', alignItems: 'center', gap: 8, marginTop: 40 }}>
              <span><i className="fas fa-users-slash" style={{ fontSize: 32 }}></i></span>
              No employees found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {employees.map(emp => (
                <Card key={emp._id}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar name={emp.name} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 16, display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 8 }}><i className="fas fa-user"></i></span>
                        {emp.name} <span style={{ color: '#888', fontWeight: 400, fontSize: 13, marginLeft: 8 }}>({emp.email})</span>
                        <StatusChip status={emp.status} />
                      </div>
                      <div style={{ fontSize: 13, color: '#555', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginTop: 4 }}>
                        <span><i className="fas fa-building" style={{ marginRight: 4 }}></i> {emp.department || '-'}</span>
                        <span><i className="fas fa-briefcase" style={{ marginRight: 4 }}></i> {emp.position || '-'}</span>
                        <span><i className="fas fa-calendar-alt" style={{ marginRight: 4 }}></i> {emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString() : '-'}</span>
                        <span><i className="fas fa-phone-alt" style={{ marginRight: 4 }}></i> {emp.contactNo || '-'}</span>
                      </div>
                    </div>
                    <div style={{ marginLeft: 12, position: 'relative' }}>
                      <button onClick={() => handleEdit(emp)} style={{ background: 'none', border: 'none', color: '#1976d2', fontSize: 18, cursor: 'pointer', marginRight: 8 }} title="Edit"><i className="fas fa-edit"></i></button>
                      <button onClick={() => handleDelete(emp._id)} style={{ background: 'none', border: 'none', color: '#f44336', fontSize: 18, cursor: 'pointer' }} title="Delete"><i className="fas fa-trash-alt"></i></button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <EmployeeDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        initialValues={editingEmployee ? {
          name: editingEmployee.name || '',
          email: editingEmployee.email || '',
          password: '',
          profilePicture: editingEmployee.profilePicture || '',
          contactNo: editingEmployee.contactNo || '',
          department: editingEmployee.department || '',
          position: editingEmployee.position || '',
          status: editingEmployee.status || 'active',
        } : {
          name: '',
          email: '',
          password: '',
          profilePicture: '',
          contactNo: '',
          department: '',
          position: '',
          status: 'active',
        }}
        editing={!!editingEmployee}
        loading={dialogLoading}
      />
    </div>
  );
};

export default ManageEmployees;
