import React from 'react';
import './App.css';
import Header from './components/Header';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Import components for different pages
import HomePage from '../src/pages/HomePage.jsx';
import AboutUs from './components/AboutUs';
import Blogs from './components/Blogs';
import Contact from './components/Contact';
import Services from './components/Services';
import Login from './pages/Login';
import EmployeeDashboard from '../src/pages/EmployeeDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

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
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
