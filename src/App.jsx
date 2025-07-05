import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import components for different pages
import HomePage from '../src/pages/HomePage.jsx';
import Login from './pages/Login.jsx';
import AboutUs from './components/sections/AboutUs';
import Blogs from './components/sections/Blogs';
import Contact from './components/sections/Contact';
import Services from './components/sections/Services';
import EmployeeDashboard from './pages/employee/EmployeeDashboard.jsx';
import EmployeeAnnouncements from './pages/employee/EmployeeAnnouncements.jsx';
import EmployeeAttendance from './pages/employee/EmployeeAttendance.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import ManageEmployees from './pages/admin/ManageEmployees.jsx';
import ManageAnnouncements from './pages/admin/ManageAnnouncements.jsx';

function App() {
  return (
    <Router> {/* Wrap the app with Router */}
      <div className="full-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Services />} />
          <Route path="/employee/:id" element={<EmployeeDashboard />} />
          <Route path="/employee/announcements" element={<EmployeeAnnouncements />} />
          <Route path="/employee/attendance" element={<EmployeeAttendance />} />
          <Route path="/admin/:id" element={<AdminDashboard />} />
          <Route path='/admin/employees' element={<ManageEmployees/>} />
          <Route path="/admin/announcements" element={<ManageAnnouncements />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
