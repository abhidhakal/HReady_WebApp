import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form } from 'formik';
import api from '../../api/axios';
import '/src/pages/admin/styles/ManageEmployees.css';
import DashboardHeader from '../../components/common/DashboardHeader.jsx';
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
        <div className="employee-modal-header">
          <h3>{editing ? 'Edit Employee' : 'Add Employee'}</h3>
          <button className="employee-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={onSubmit}
        >
          {({ values, handleChange }) => (
            <Form>
              <div className="employee-modal-form">
                <div className="employee-form-field">
                  <label>Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Enter employee name" 
                    value={values.name} 
                    onChange={handleChange} 
                    required 
                    className="employee-form-input" 
                  />
                </div>
                
                <div className="employee-form-field">
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Enter employee email" 
                    value={values.email} 
                    onChange={handleChange} 
                    required 
                    className="employee-form-input" 
                  />
                </div>
                
                {!editing && (
                  <div className="employee-form-field">
                    <label>Password</label>
                    <div className="employee-password-field-row">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter password"
                        value={values.password}
                        onChange={handleChange}
                        required
                        className="employee-form-input"
                      />
                      <button
                        type="button"
                        className="employee-toggle-visibility-btn"
                        onClick={() => setShowPassword(s => !s)}
                      >
                        <img
                          src={
                            showPassword
                              ? "/assets/icons/view_on.svg"
                              : "/assets/icons/view_off.svg"
                          }
                          alt="Toggle password visibility"
                        />
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="employee-form-field">
                  <label>Profile Picture URL</label>
                  <input 
                    type="text" 
                    name="profilePicture" 
                    placeholder="Enter profile picture URL" 
                    value={values.profilePicture} 
                    onChange={handleChange} 
                    className="employee-form-input" 
                  />
                </div>
                
                <div className="employee-form-field">
                  <label>Contact Number</label>
                  <input 
                    type="text" 
                    name="contactNo" 
                    placeholder="Enter contact number" 
                    value={values.contactNo} 
                    onChange={handleChange} 
                    className="employee-form-input" 
                  />
                </div>
                
                <div className="employee-form-field">
                  <label>Department</label>
                  <input 
                    type="text" 
                    name="department" 
                    placeholder="Enter department" 
                    value={values.department} 
                    onChange={handleChange} 
                    className="employee-form-input" 
                  />
                </div>
                
                <div className="employee-form-field">
                  <label>Position</label>
                  <input 
                    type="text" 
                    name="position" 
                    placeholder="Enter position" 
                    value={values.position} 
                    onChange={handleChange} 
                    className="employee-form-input" 
                  />
                </div>
                
                <div className="employee-form-field">
                  <label>Status</label>
                  <select 
                    name="status" 
                    value={values.status} 
                    onChange={handleChange} 
                    className="employee-form-input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="employee-modal-actions">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className="employee-action-btn cancel"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="employee-action-btn save"
                  >
                    {loading ? 'Saving...' : (editing ? 'Update' : 'Add')}
                  </button>
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
          <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/payroll`)}>Payroll Management</a></li>
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
          <div className="employees-header">
            <h2>Manage Employees</h2>
            <button onClick={handleAdd} className="add-employee-btn"><i className="fas fa-user-plus"></i>Add Employee</button>
          </div>

          {employees.length === 0 ? (
            <div className="employees-empty-state">
              <span className="employees-empty-icon"><i className="fas fa-users-slash"></i></span>
              No employees found.
            </div>
          ) : (
            <div className="employees-list-container">
              {employees.map(emp => (
                <Card key={emp._id}>
                  <div className="employee-list-item">
                    <Avatar name={emp.name} />
                    <div className="employee-info-main">
                      <div className="employee-info-details employee-title-row">
                        <span className="employee-title"><i className="fas fa-user"></i></span>
                        {emp.name} <span className="employee-email">({emp.email})</span>
                        <StatusChip status={emp.status} />
                      </div>
                      <div className="employee-info-details employee-meta-row">
                        <span className="employee-meta-item"><i className="fas fa-building"></i> {emp.department || '-'}</span>
                        <span className="employee-meta-item"><i className="fas fa-briefcase"></i> {emp.position || '-'}</span>
                        <span className="employee-meta-item"><i className="fas fa-calendar-alt"></i> {emp.date_of_joining ? new Date(emp.date_of_joining).toLocaleDateString() : '-'}</span>
                        <span className="employee-meta-item"><i className="fas fa-phone-alt"></i> {emp.contactNo || '-'}</span>
                      </div>
                    </div>
                    <div className="employee-actions">
                      <button onClick={() => handleEdit(emp)} className="employee-action-btn edit" title="Edit"><i className="fas fa-edit"></i></button>
                      <button onClick={() => handleDelete(emp._id)} className="employee-action-btn delete" title="Delete"><i className="fas fa-trash-alt"></i></button>
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
