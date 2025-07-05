import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import '/src/pages/admin/styles/AdminAttendance.css';
import DashboardHeader from '/src/components/common/DashboardHeader.jsx';
import logo from '/src/assets/primary.webp';

function AdminAttendance() {
    return (
        <div className="full-screen">
            <DashboardHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
            <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
                    <nav className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                        <ul>
                        <li><img src={logo} alt="Logo" /></li>
                        <li><a className="nav-dashboard" onClick={() => navigate(`/admin/${id}`)}>Dashboard</a></li>
                        <li><a onClick={() => navigate('/admin/employees')}>Manage Employees</a></li>
                        <li><a href="#">Attendance Logs</a></li>
                        <li><a href="#">Leave Requests</a></li>
                        <li><a className="nav-dashboard" onClick={() => navigate('/admin/announcements')}>Manage Announcements</a></li>
                        <li><a href="#">Settings</a></li>
                        <li><a className="nav-logout" onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('role');
                                navigate('/login');
                        }}>Log Out</a></li>
                        </ul>
                    </nav>
            </div>
        </div>
    );
}

export default AdminAttendance;