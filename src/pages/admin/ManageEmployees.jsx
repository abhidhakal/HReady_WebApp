import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import api from '/src/api/api.js';
import './styles/ManageEmployees.css';
import Toast from '/src/components/Toast.jsx';
import LogoutConfirmModal from '/src/components/LogoutConfirmModal.jsx';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '/src/hooks/useAuth.js';
import { useToast } from '/src/hooks/useToast.js';
// Import services
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } from '/src/services/index.js';

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
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const { getToken, logout } = useAuth();
  const { toast, showToast, showSuccess, showError, hideToast } = useToast();

  const token = getToken();
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const result = await getAllEmployees();
      if (result.success) {
        setEmployees(result.data);
      } else {
        showError('Failed to fetch employees');
        console.error('Error fetching employees:', result.error);
      }
    } catch (err) {
      showError('Failed to fetch employees');
      console.error('Error fetching employees:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout(
      navigate,
      () => showSuccess('Logged out successfully'),
      (error) => showError('Logout completed with warnings')
    );
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const result = await deleteEmployee(id);
      if (result.success) {
        showSuccess('Employee deleted successfully');
        fetchEmployees();
      } else {
        showError('Failed to delete employee');
        console.error('Error deleting employee:', result.error);
      }
    } catch (err) {
      showError('Failed to delete employee');
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
      let result;
      
      if (editingEmployee && editingEmployee._id) {
        result = await updateEmployee(editingEmployee._id, values);
        if (result.success) {
          showSuccess('Employee updated successfully');
        } else {
          showError('Failed to update employee');
          console.error('Error updating employee:', result.error);
        }
      } else {
        result = await createEmployee(values);
        if (result.success) {
          showSuccess('Employee created successfully');
        } else {
          showError('Failed to create employee');
          console.error('Error creating employee:', result.error);
        }
      }
      
      if (result.success) {
        fetchEmployees();
        setDialogOpen(false);
        setEditingEmployee(null);
        resetForm();
      }
    } catch (err) {
      showError('Failed to save employee');
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
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      <DashboardHeader onToggleSidebar={toggleSidebar} />

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
                onClick={handleLogoutClick}
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

          {loading ? (
            <div className="employees-list-container">
              {[1,2,3,4,5].map(i => (
                <Card key={i}>
                  <div className="employee-list-item">
                    <Skeleton variant="circular" width={40} height={40} style={{ marginRight: 16 }} />
                    <div style={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={24} style={{ marginBottom: 8 }} />
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <Skeleton variant="text" width={120} height={18} />
                        <Skeleton variant="text" width={100} height={18} />
                        <Skeleton variant="text" width={100} height={18} />
                        <Skeleton variant="text" width={120} height={18} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Skeleton variant="circular" width={32} height={32} />
                      <Skeleton variant="circular" width={32} height={32} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : employees.length === 0 ? (
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
          contactNo: editingEmployee.contactNo || '',
          department: editingEmployee.department || '',
          position: editingEmployee.position || '',
          status: editingEmployee.status || 'active',
        } : {
          name: '',
          email: '',
          password: '',
          contactNo: '',
          department: '',
          position: '',
          status: 'active',
        }}
        editing={!!editingEmployee}
        loading={dialogLoading}
      />

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
};

export default ManageEmployees;
