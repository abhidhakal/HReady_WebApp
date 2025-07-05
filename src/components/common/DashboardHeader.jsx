import React from 'react';
import { Link } from 'react-router-dom';
import '/src/pages/admin/styles/Dashboard.css'

function DashboardHeader({ username = 'John Doe', onToggleSidebar }) {
  return (
    <header className="dashboard-header">
      <div className="hamburger" onClick={onToggleSidebar}>
        <img src='/assets/icons/hamburger.svg' alt='Menu'/>
      </div>
      <div className="dashboard-logo">
        <img className='header-logo' src='src/assets/transparent_noicon.png' alt='HReady'/>
      </div>
      <nav className="header-nav">
        <Link className='abt-us-label' to="/about-us">About Us</Link>
        <Link to="/contact" className="contact-btn">Contact Us</Link>
      </nav>
    </header>
  );
}

export default DashboardHeader;