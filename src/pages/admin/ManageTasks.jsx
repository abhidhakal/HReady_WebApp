import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import logo from '/src/assets/primary_icon.webp';
import { LocalizationProvider } from '@mui/x-date-pickers';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Toast from '/src/components/common/Toast.jsx';
import './styles/ManageTasks.css';

const ManageTasks = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    assignedDepartment: '',
    status: 'Pending',
  });

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Fetch employees
  useEffect(() => {
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
    fetchEmployees();
  }, [token]);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedData = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      assignedTo: formData.assignedTo || null,
      assignedDepartment: formData.assignedDepartment || null,
      status: formData.status,
    };

    if (cleanedData.assignedTo && cleanedData.assignedDepartment) {
      cleanedData.assignedDepartment = null;
    }

    try {
      if (editingTaskId) {
        // UPDATE
        await api.put(`/tasks/${editingTaskId}`, cleanedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setToast({ message: 'Task updated successfully.', type: 'success' });
      } else {
        // CREATE
        await api.post('/tasks', cleanedData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setToast({ message: 'Task created successfully.', type: 'success' });
      }

      setFormData({
        title: '',
        description: '',
        dueDate: '',
        assignedTo: '',
        assignedDepartment: '',
        status: 'Pending',
      });
      setEditingTaskId(null);
      fetchTasks();
    } catch (err) {
      console.error('Error saving task:', err);
      if (err.response) {
        setToast({ message: err.response.data.message, type: 'error' });
      } else {
        setToast({ message: 'Failed to save task. Please try again.', type: 'error' });
      }
    }
  };

  const handleEdit = (task) => {
    setEditingTaskId(task._id);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo ? task.assignedTo._id : '',
      assignedDepartment: task.assignedDepartment || '',
      status: task.status,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToast({ message: 'Task deleted.', type: 'success' });
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setToast({ message: 'Failed to delete task.', type: 'error' });
    }
  };

  return (
    <div className="full-screen">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      <DashboardHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/admin/${id}/employees`)}>Manage Employees</a></li>
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

        <div className="main-content">
          <div className="manage-tasks">
            <h2>{editingTaskId ? 'Edit Task' : 'Add Task'}</h2>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="title"
                placeholder="Task Title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
              />

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Due Date"
                  value={formData.dueDate ? new Date(formData.dueDate) : null}
                  onChange={(date) => {
                    setFormData({
                      ...formData,
                      dueDate: date ? date.toISOString().split('T')[0] : '',
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                    />
                  )}
                />
              </LocalizationProvider>

              <select
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
              >
                <option value="">Assign to Employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.department || 'N/A'})
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="assignedDepartment"
                placeholder="Or Assign to Department"
                value={formData.assignedDepartment}
                onChange={handleChange}
              />

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              <button type="submit">{editingTaskId ? 'Update Task' : 'Add Task'}</button>
            </form>

            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>
                      {task.assignedTo
                        ? `${task.assignedTo.name} (${task.assignedTo.email})`
                        : '-'}
                    </td>
                    <td>{task.assignedDepartment || '-'}</td>
                    <td>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>{task.status}</td>
                    <td>
                      <button onClick={() => handleEdit(task)}>Edit</button>
                      <button onClick={() => handleDelete(task._id)}>Delete</button>
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

export default ManageTasks;
