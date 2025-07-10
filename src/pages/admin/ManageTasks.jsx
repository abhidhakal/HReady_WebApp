import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '',
    assignedDepartment: '',
    status: 'pending',
  });

  const token = localStorage.getItem('token');
  const id = localStorage.getItem('userId');
  const navigate = useNavigate();

  // Fetch users with role: employee
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

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit new task
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

    console.log('Submitting data:', cleanedData);

    try {
      await api.post('/tasks', cleanedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setToast({ message: 'Task created successfully.', type: 'success' });
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        assignedTo: '',
        assignedDepartment: '',
        status: 'pending',
      });
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      if (err.response) {
        console.error('Server response:', err.response.data);
        setToast({ message: err.response.data.message, type: 'error' });
      } else {
        setToast({ message: 'Failed to create task. Please try again.', type: 'error' });
      }
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
            <li><a onClick={() => navigate('/admin/employees')}>Manage Employees</a></li>
            <li><a onClick={() => navigate('/admin/attendance')}>Admin Attendance</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate('/admin/tasks')}>Manage Tasks</a></li>
            <li><a href="#">Leave Requests</a></li>
            <li><a onClick={() => navigate('/admin/announcements')}>Manage Announcements</a></li>
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
            <h2>Manage Tasks</h2>

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
                    {emp.userId?.name || 'Unknown'} ({emp.userId?.department || 'N/A'})
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
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>

              <button type="submit">Add Task</button>
            </form>

            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Due Date</th>
                  <th>Status</th>
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
