import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '/src/api/api.js';
import DashboardHeader from '/src/layouts/DashboardHeader.jsx';
import './styles/EmployeeTasks.css';
import Skeleton from '@mui/material/Skeleton';
// import logo from '../../assets/primary_icon.webp';

const Card = ({ children }) => (
  <div className="task-card">{children}</div>
);

const StatusChip = ({ status, onStatusChange, taskId }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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

  const getNextStatus = (currentStatus) => {
    switch (currentStatus?.toLowerCase()) {
      case 'pending':
        return ['In Progress'];
      case 'in progress':
        return ['Completed'];
      default:
        return [];
    }
  };

  const nextStatuses = getNextStatus(status);

  if (nextStatuses.length === 0) {
    return (
      <span 
        className="status-chip"
        style={{ backgroundColor: getStatusColor(status) }}
      >
        {status}
      </span>
    );
  }

  return (
    <div className="status-dropdown">
      <select
        value={status}
        onChange={(e) => onStatusChange(taskId, e.target.value)}
        className="status-select"
        style={{ backgroundColor: getStatusColor(status) }}
      >
        <option value={status}>{status}</option>
        {nextStatuses.map(nextStatus => (
          <option key={nextStatus} value={nextStatus}>
            {nextStatus}
          </option>
        ))}
      </select>
    </div>
  );
};

const EmployeeTasks = () => {
  const { id } = useParams();
  const [tasks, setTasks] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/tasks/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(
        `/tasks/my/${taskId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === taskId ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} userRole="employee" />

      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src="/assets/images/primary_icon.webp" alt="Logo" /></li>
            <li><a onClick={() => navigate(`/employee/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/attendance`)}>Attendance</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/payroll`)}>My Payroll</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate(`/employee/${id}/tasks`)}>Tasks</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/leave`)}>Leave</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/announcements`)}>Announcements</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/requests`)}>Requests</a></li>
            <li><a onClick={() => navigate(`/employee/${id}/profile`)}>Profile</a></li>
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

        <div className="main-content-tasks">
          <div className="tasks-header">
            <h2>My Tasks</h2>
          </div>

          {error && (
            <div className="tasks-error">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {loading && (
            <div className="tasks-loading-container">
              {[1, 2, 3, 4, 5].map(i => (
                <Card key={i}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={18} />
                    <Skeleton variant="text" width="80%" height={18} />
                    <Skeleton variant="rectangular" width="100%" height={40} style={{ margin: '12px 0' }} />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!loading && tasks.length === 0 && (
            <div className="tasks-empty-state">
              <i className="fas fa-tasks"></i>
              <p>No tasks assigned to you</p>
            </div>
          )}

          {!loading && tasks.length > 0 && (
            <div className="tasks-list-container">
              {tasks.map((task) => (
                <Card key={task._id}>
                  <div className="task-card-header">
                    <div className="task-icon">
                      <i className="fas fa-clipboard-list"></i>
                    </div>
                    <div className="task-content">
                      <h3 className="task-title">{task.title}</h3>
                      <div className="task-meta">
                        <span className="task-due-date">
                          <i className="fas fa-calendar-alt"></i>
                          Due: {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {task.description && (
                    <div className="task-description">
                      <p>{task.description}</p>
                    </div>
                  )}

                  <div className="task-actions">
                    <StatusChip
                      status={task.status}
                      onStatusChange={handleStatusChange}
                      taskId={task._id}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeTasks;
