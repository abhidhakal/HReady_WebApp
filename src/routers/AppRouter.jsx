import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import components for different pages
import HomePage from '../pages/HomePage.jsx';
import GetStarted from '../pages/GetStarted.jsx';
import Login from '../pages/Login.jsx';
import AboutUs from '../components/sections/AboutUs';
import Blogs from '../components/sections/Blogs';
import Contact from '../components/sections/Contact';
import Services from '../components/sections/Services';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard.jsx';
import EmployeeAnnouncements from '../pages/employee/EmployeeAnnouncements.jsx';
import EmployeeAttendance from '../pages/employee/EmployeeAttendance.jsx';
import EmployeePayroll from '../pages/employee/EmployeePayroll.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import PayrollDashboard from '../pages/admin/PayrollDashboard.jsx';
import ManageEmployees from '../pages/admin/ManageEmployees.jsx';
import ManageAnnouncements from '../pages/admin/ManageAnnouncements.jsx';
import AdminAttendance from '../pages/admin/AdminAttendance.jsx';
import AdminProfile from '../pages/admin/AdminProfile.jsx';
import EmployeeProfile from '../pages/employee/EmployeeProfile.jsx';
import ManageTasks from '../pages/admin/ManageTasks.jsx';
import EmployeeTasks from '../pages/employee/EmployeeTasks.jsx';
import AdminLeaves from '../pages/admin/AdminLeaves.jsx';
import EmployeeRequest from '../pages/employee/EmployeeRequest.jsx';
import AdminRequests from '../pages/admin/AdminRequests.jsx';
import EmployeeLeaves from '../pages/employee/EmployeeLeave.jsx';

function AppRouter() {
  return (
    <Router>
      <div className="full-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />

          {/* EMPLOYEE */}
          <Route path="/employee/:id" element={<EmployeeDashboard />} />
          <Route path="/employee/:id/announcements" element={<EmployeeAnnouncements />} />
          <Route path="/employee/:id/attendance" element={<EmployeeAttendance />} />
          <Route path="/employee/:id/payroll" element={<EmployeePayroll />} />
          <Route path="/employee/:id/profile" element={<EmployeeProfile />} />
          <Route path="/employee/:id/tasks" element={<EmployeeTasks />} />
          <Route path="/employee/:id/leave" element={<EmployeeLeaves />} />
          <Route path="/employee/:id/requests" element={<EmployeeRequest />} />

          {/* ADMIN */}
          <Route path="/admin/:id" element={<AdminDashboard />} />
          <Route path="/admin/:id/payroll" element={<PayrollDashboard />} />
          <Route path="/admin/:id/employees" element={<ManageEmployees />} />
          <Route path="/admin/:id/announcements" element={<ManageAnnouncements />} />
          <Route path="/admin/:id/attendance" element={<AdminAttendance />} />
          <Route path="/admin/:id/profile" element={<AdminProfile />} />
          <Route path="/admin/:id/tasks" element={<ManageTasks/>}/>
          <Route path="/admin/:id/leaves" element={<AdminLeaves />} />
          <Route path="/admin/:id/requests" element={<AdminRequests />} />
        </Routes>
      </div>
    </Router>
  );
}

export default AppRouter; 