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
          <p className="header-p">About Us</p>
        </Link>
        <Link to="/contact">
          <button className="contact-us">Contact Us</button>
        </Link>
      </div>
    </header>
  );
}

export default Header;
