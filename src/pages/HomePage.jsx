import React from 'react';
import { Link } from 'react-router-dom';
import Header from '/src/components/common/Header.jsx';
import '/src/pages/styles/HomePage.css';

function HomePage() {
  return (
    <div className="full-screen">
      <Header />
      <div className="home-container">
        <div className="left-side">
          <img 
            className="welcomepage-img" 
            src="/src/assets/welcome_img.webp" 
            alt="Welcome to HReady - Smart HR Management Solution" 
          />
        </div>
        <div className="right-side">
          <div>
            <h1>Welcome to HReady</h1>
            <h2>Your All-in-One Smart HR Management Solution</h2>
          </div>
          <div className="login-buttons">
            <Link to="/login">
              <button className="login-btn-employee">Login As Employee</button>
            </Link>
            <Link to="/login">
              <button className="login-btn-admin">Login As Admin</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
