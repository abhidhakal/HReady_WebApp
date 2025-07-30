import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import api from '/src/api/api.js';
import './styles/ManageTasks.css';
import Toast from '/src/components/Toast.jsx';
import Skeleton from '@mui/material/Skeleton';
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '/src/hooks/useAuth.js';
import { useToast } from '/src/hooks/useToast.js';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';
// Import services
import { getTasks, createTask, updateTask, deleteTask, getAllEmployees } from '/src/services/index.js';

const statusColor = status => {
  switch ((status || '').toLowerCase()) {
    case 'pending':
      return '#ff9800';
    case 'in progress':
      return '#2196f3';
    case 'completed':
      return '#4caf50';
    default:
      return '#9e9e9e';
  }
};

const StatusChip = ({ status }) => (
  <span 
    className="task-status-chip"
    style={{ backgroundColor: statusColor(status) }}
  >
    {status}
  </span>
);

const Avatar = ({ name }) => (
  <div className="task-avatar">
    {name && name.length > 0 ? name[0].toUpperCase() : '?'}
  </div>
);

const Card = ({ children }) => (
  <div className="task-card">{children}</div>
);

const TaskDialog = ({ open, onClose, onSubmit, initialValues, editing, loading, employees }) => {
  if (!open) return null;
  return (
    <div className="task-modal-overlay">
      <div className="task-modal-content">
        <div className="task-modal-header">
          <h3>{editing ? 'Edit Task' : 'Add Task'}</h3>
          <button className="task-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={onSubmit}
        >
          {({ values, handleChange, setFieldValue }) => (
            <Form>
              <div className="task-modal-form">
                <div className="task-form-field">
                  <label>Task Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    placeholder="Enter task title" 
                    value={values.title} 
                    onChange={handleChange} 
                    required 
                    className="task-form-input" 
                  />
                </div>
                
                <div className="task-form-field">
                  <label>Description</label>
                  <textarea 
                    name="description" 
                    placeholder="Enter task description" 
                    value={values.description} 
                    onChange={handleChange} 
                    className="task-form-input"
                    rows="3"
                  />
                </div>
                
                <div className="task-form-field">
                  <label>Due Date</label>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={values.dueDate ? new Date(values.dueDate) : null}
                      onChange={(date) => {
                        setFieldValue('dueDate', date ? date.toISOString().split('T')[0] : '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          className="task-form-input"
                          size="small"
                          fullWidth
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
                
                <div className="task-form-field">
                  <label>Assign to Employee</label>
                  <select 
                    name="assignedTo" 
                    value={values.assignedTo} 
                    onChange={handleChange} 
                    className="task-form-input"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.department || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="task-form-field">
                  <label>Or Assign to Department</label>
                  <input 
                    type="text" 
                    name="assignedDepartment" 
                    placeholder="Enter department name" 
                    value={values.assignedDepartment} 
                    onChange={handleChange} 
                    className="task-form-input" 
                  />
                </div>
                
                <div className="task-form-field">
                  <label>Status</label>
                  <select 
                    name="status" 
                    value={values.status} 
                    onChange={handleChange} 
                    className="task-form-input"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                
                <div className="task-modal-actions">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className="task-action-btn cancel"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="task-action-btn save"
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

const ManageTasks = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { isOpen: sidebarOpen, toggleSidebar, openSidebar, closeSidebar, setIsOpen: setSidebarOpen } = useSidebar(false);
  const { getToken } = useAuth();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const token = getToken();
  const navigate = useNavigate();

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const result = await getAllEmployees();
        if (result.success) {
          setEmployees(result.data);
        } else {
          console.error('Error fetching employees:', result.error);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const result = await getTasks(true); // true for admin
      if (result.success) {
        setTasks(result.data);
      } else {
        console.error('Error fetching tasks:', result.error);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleEdit = (task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const result = await deleteTask(id);
      if (result.success) {
        showSuccess('Task deleted successfully');
        fetchTasks();
      } else {
        showError('Failed to delete task');
        console.error('Error deleting task:', result.error);
      }
    } catch (err) {
      showError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const handleAdd = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTask(null);
  };

  const handleDialogSubmit = async (values, { resetForm }) => {
    setDialogLoading(true);

    const cleanedData = {
      title: values.title.trim(),
      description: values.description.trim() || null,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      assignedTo: values.assignedTo || null,
      assignedDepartment: values.assignedDepartment || null,
      status: values.status,
    };

    if (cleanedData.assignedTo && cleanedData.assignedDepartment) {
      cleanedData.assignedDepartment = null;
    }

    try {
      let result;
      
      if (editingTask && editingTask._id) {
        result = await updateTask(editingTask._id, cleanedData);
        if (result.success) {
          showSuccess('Task updated successfully');
        } else {
          showError('Failed to update task');
          console.error('Error updating task:', result.error);
        }
      } else {
        result = await createTask(cleanedData);
        if (result.success) {
          showSuccess('Task created successfully');
        } else {
          showError('Failed to create task');
          console.error('Error creating task:', result.error);
        }
      }
      
      if (result.success) {
        fetchTasks();
        setDialogOpen(false);
        setEditingTask(null);
        resetForm();
      }
    } catch (err) {
      showError('Failed to save task');
      console.error('Error saving task:', err);
      if (err.response) {
        console.error('Server response:', err.response.data);
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
      <DashboardHeader onToggleSidebar={toggleSidebar} userRole="admin" />

      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/payroll`)}>Payroll Management</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/attendance`)}>Admin Attendance</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}/tasks`)}>Manage Tasks</a></li>
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

        <div className="main-content tasks-page">
          <div className="tasks-header">
            <h2>Manage Tasks</h2>
            <button onClick={handleAdd} className="add-task-btn">
              <i className="fas fa-plus"></i>Add Task
            </button>
          </div>

          {loading ? (
            <div className="tasks-list-container">
              {[1,2,3,4,5].map(i => (
                <div className="task-card" key={i}>
                  <div className="task-header">
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="30%" height={18} />
                  </div>
                  <Skeleton variant="text" width="80%" height={18} />
                  <Skeleton variant="rectangular" width="100%" height={40} style={{ margin: '12px 0' }} />
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <Card>
              <div className="task-empty-state">
                <span className="task-empty-icon"><i className="fas fa-tasks"></i></span>
                No tasks found.
              </div>
            </Card>
          ) : (
            <Card>
              <div className="task-list-header">Task List</div>
              <div className="task-list-container">
                {tasks.map(task => (
                  <div key={task._id} className="task-list-item">
                    <Avatar name={task.assignedTo?.name || 'Task'} />
                    <div className="task-info-main">
                      <div className="task-info-details task-title-row">
                        <span className="task-title"><i className="fas fa-tasks"></i> {task.title}</span>
                        <StatusChip status={task.status} />
                      </div>
                      {task.description && (
                        <div className="task-description">
                          {task.description}
                        </div>
                      )}
                      <div className="task-info-details task-meta-row">
                        <span className="task-meta-item"><i className="fas fa-user"></i> {task.assignedTo ? `${task.assignedTo.name} (${task.assignedTo.email})` : '-'}</span>
                        {task.assignedDepartment && (
                          <span className="task-meta-item"><i className="fas fa-building"></i> {task.assignedDepartment}</span>
                        )}
                        <span className="task-meta-item"><i className="fas fa-calendar-alt"></i> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</span>
                      </div>
                    </div>
                    <div className="task-actions">
                      <button onClick={() => handleEdit(task)} className="task-action-btn edit" title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button onClick={() => handleDelete(task._id)} className="task-action-btn delete" title="Delete">
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
      <TaskDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        initialValues={editingTask ? {
          title: editingTask.title || '',
          description: editingTask.description || '',
          dueDate: editingTask.dueDate ? editingTask.dueDate.split('T')[0] : '',
          assignedTo: editingTask.assignedTo ? editingTask.assignedTo._id : '',
          assignedDepartment: editingTask.assignedDepartment || '',
          status: editingTask.status || 'Pending',
        } : {
          title: '',
          description: '',
          dueDate: '',
          assignedTo: '',
          assignedDepartment: '',
          status: 'Pending',
        }}
        editing={!!editingTask}
        loading={dialogLoading}
        employees={employees}
      />
    </div>
  );
};

export default ManageTasks;
