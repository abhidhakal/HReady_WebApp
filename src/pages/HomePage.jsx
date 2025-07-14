import React from 'react';
import { Link } from 'react-router-dom';
import Header from '/src/components/common/Header.jsx';
import '/src/pages/styles/HomePage.css';
import Footer from '../components/common/Footer';

function HomePage() {
  return (
    <div className='full-screen-home'>
      <Header />

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Empower Your Workforce with HReady</h1>
          <p>All-in-one HRMS for managing employees, payroll, and performance.</p>
          <div className="hero-buttons">
            <Link to="/register">
              <button className="primary-btn">Get Started</button>
            </Link>
            <Link to="/login">
              <button className="secondary-btn">Login</button>
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src="src/assets/hero-illustration.png"
            alt="HR Management Illustration"
          />
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-item">
          <img src="/src/assets/employee_tracking.png" alt="Employee Management"/>
          <h3>Employee Management</h3>
        </div>
        <div className="feature-item">
          <img src="/src/assets/attendance_tracking.png" alt="Attendance Tracking"/>
          <h3>Attendance Tracking</h3>
        </div>
        <div className="feature-item">
          <img src="/src/assets/payroll_automation.png" alt="Payroll Automation"/>
          <h3>Payroll Automation</h3>
        </div>
        <div className="feature-item">
          <img src="/src/assets/leave_and_tasks.png" alt="Leave and Tasks Management"/>
          <h3>Leave and Tasks Management</h3>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="how-content">
          <h2>How It Works</h2>
          <ul className="how-list">
            <li>
              <img src="/assets/icons/check-primary-colour.svg" alt="" />
              Create your company account
            </li>
            <li>
              <img src="/assets/icons/check-primary-colour.svg" alt="" />
              Add employees and roles
            </li>
            <li>
              <img src="/assets/icons/check-primary-colour.svg" alt="" />
              Manage HR tasks easily
            </li>
          </ul>
        </div>
        <div className="how-image">
          <img 
            src="/src/assets/how-it-works.png"
            alt="How It Works Illustration"
          />
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <div className="testimonial">
          <p>"HReady simplified our HR processes."</p>
          <span>— Jason S.</span>
        </div>
        <div className="testimonial">
          <p>"Saved us 20+ hours every month."</p>
          <span>— Emily R.</span>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <div className="cta-content">
          <h2>Ready to transform your HR management?</h2>
          <p>Get started with HReady today and make your HR processes simpler, faster, and smarter.</p>
          <div className="cta-buttons">
            <Link to="/contact">
              <button className="primary-cta-btn">Contact Us</button>
            </Link>
            <Link to="/register">
              <button className="primary-cta-btn">Get Started</button>
            </Link>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}

export default HomePage;
