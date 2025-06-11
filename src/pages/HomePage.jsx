import '../App.css';
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '/src/components/Header.jsx';

function HomePage() {
  return (
    <div className="full-screen">
      <Header/>
      <div className="home-container">
        <div className="left-side">
          <img className="welcomepage-img" src="/welcome_img.png" alt="Welcome" />
        </div>
        <div className="right-side">
          <div>
            <h1>Welcome to HReady</h1>
            <h2>Your All-in-One Smart HR Management Solution</h2>
            {/* Use Link to route to Admin Login */}
            <Link to="/login">
              <button className="login-btn-employee">Login As Employee</button>
            </Link>
            {/* Use Link to route to Admin Login */}
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
