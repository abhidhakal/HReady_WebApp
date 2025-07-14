import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css'

function Header() {
  return (
    <header className="header">
      <Link to="/">
        <img className="header-logo" src="/src/assets/primary_transparent.webp" alt="HReady" />
      </Link>
      <div className="header-texts">
      <Link to="/services">
          <p className="header-p">Services</p>
        </Link>
        <Link to="/blogs">
          <p className="header-p">Blogs</p>
        </Link>
        <Link to="/about-us">
          <p className="header-p">About HReady</p>
        </Link>
        <Link to="/contact">
          <p className="header-p">Contact Us</p>
        </Link>
        <Link to="/login">
          <button className="login-btn-header">Login</button>
        </Link>
      </div>
    </header>
  );
}

export default Header;
