import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import '/src/pages/admin/styles/Dashboard.css';
import api from '../../api/axios';
import logo from '/src/assets/primary_icon.webp';
import '/src/pages/admin/styles/AdminLeaves.css';

function AdminLeaves() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const id = localStorage.getItem('userId');

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaves(res.data);
    } catch (err) {
      console.error('Error fetching leaves:', err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (leaveId, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave?`)) return;

    try {
      await api.put(`/leaves/${leaveId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchLeaves();
    } catch (err) {
      console.error(`Error updating leave status:`, err);
      alert('Failed to update leave status.');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="full-screen">
      <DashboardHeader onToggleSidebar={toggleSidebar} />

      <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><img src={logo} alt="Logo" /></li>
            <li><a onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
            <li><a onClick={() => navigate('/admin/employees')}>Manage Employees</a></li>
            <li><a onClick={() => navigate('/admin/attendance')}>Admin Attendance</a></li>
            <li><a onClick={() => navigate('/admin/tasks')}>Manage Tasks</a></li>
            <li><a className="nav-dashboard" onClick={() => navigate('/admin/leaves')}>Manage Leaves</a></li>
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
          <div className="admin-leaves">
            <h2>All Leave Requests</h2>

            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Half Day</th>
                  <th>Status</th>
                  <th>Attachment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        {leave.requestedBy
                          ? `${leave.requestedBy.name} (${leave.requestedBy.email})`
                          : '—'}
                      </td>
                      <td>{leave.leaveType}</td>
                      <td>
                        {new Date(leave.startDate).toLocaleDateString()} -{' '}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td>{leave.halfDay ? 'Yes' : 'No'}</td>
                      <td>{leave.status}</td>
                      <td>
                        {leave.attachment ? (
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL}/${leave.attachment}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                      {leave.status === 'Pending' ? (
                          <div className="action-buttons">
                          <button
                              onClick={() => handleUpdateStatus(leave._id, 'Approved')}
                          >
                              Approve
                          </button>
                          <button
                              onClick={() => handleUpdateStatus(leave._id, 'Rejected')}
                          >
                              Reject
                          </button>
                          </div>
                      ) : (
                          '—'
                      )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No leave records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLeaves;
