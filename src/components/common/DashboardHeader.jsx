import React from 'react';
import { Link } from 'react-router-dom';
import '/src/components/styles/DashboardHeader.css'

function DashboardHeader({ username = 'John Doe', onToggleSidebar }) {
  return (
    <header className="dashboard-header">
      <div className="hamburger" onClick={onToggleSidebar}>
        <img src='/assets/icons/hamburger.svg' alt='Menu'/>
      </div>
      <div className="dashboard-logo">
        <img className='header-logo' src='/src/assets/primary_transparent.webp' alt='HReady'/>
      </div>
      <nav className="header-nav">
        <Link className='abt-us-label' to="/about-us">About Us</Link>
        <Link to="/contact" className="contact-btn">Contact Us</Link>
      </nav>
    </header>
  );
}

export default DashboardHeader;