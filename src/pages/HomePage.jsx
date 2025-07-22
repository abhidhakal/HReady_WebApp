import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '/src/components/common/Header.jsx';
import '/src/pages/styles/HomePage.css';
import Footer from '../components/common/Footer';

function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoaded(true), 100);
    
    // Handle scroll for parallax effects
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features = [
    {
      icon: "/assets/images/employee_tracking.png",
      title: "Employee Management",
      description: "Comprehensive employee database with role management and performance tracking"
    },
    {
      icon: "/assets/images/attendance_tracking.png", 
      title: "Attendance Tracking",
      description: "Automated time tracking with geolocation and flexible scheduling"
    },
    {
      icon: "/assets/images/payroll_automation.png",
      title: "Payroll Automation", 
      description: "Seamless payroll processing with tax calculations and direct deposits"
    },
    {
      icon: "/assets/images/leave_and_tasks.png",
      title: "Leave & Tasks Management",
      description: "Streamlined leave requests and task assignment with approval workflows"
    }
  ];

  const stats = [
    { number: "24/7", label: "Customer Support" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "Secure", label: "Data Protection" },
    { number: "Easy", label: "Setup Process" }
  ];

  return (
    <div className={`full-screen-home ${isLoaded ? 'loaded' : ''}`}>
      <Header />

      {/* Hero Section */}
      <main>
        <section className="home-hero" aria-labelledby="hero-heading">
          <div className="home-hero-content">
            <h1 id="hero-heading">
              <span className="home-gradient-text">Empower Your Workforce</span>
              <br />with HReady
            </h1>
            <p>All-in-one HRMS for managing employees, payroll, and performance with ease and efficiency. Streamline your HR processes and boost productivity.</p>
            <div className="home-hero-buttons">
              <Link to="/get-started" aria-label="Get started with HReady">
                <button className="home-primary-btn" type="button">
                  <span>Get Started</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </Link>
              <Link to="/login" aria-label="Login to your account">
                <button className="home-secondary-btn" type="button">Login</button>
              </Link>
            </div>
            <div className="home-hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="home-stat-item">
                  <div className="home-stat-number">{stat.number}</div>
                  <div className="home-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="home-hero-image">
            <img 
              src="/assets/images/hero-illustration.png"
              alt="HR Management System illustration showing connected employees and management tools"
              loading="eager"
              style={{ transform: `translateY(${scrollY * 0.1}px)` }}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="home-features" aria-labelledby="features-heading">
          <div className="home-section-header">
            <h2 id="features-heading">Powerful Features</h2>
            <p>Everything you need to manage your workforce effectively</p>
          </div>
          <div className="home-features-container">
            <div className="home-features-grid">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="home-feature-card" 
                  role="article"
                >
                  <div className="home-feature-header">
                    <div className="home-feature-icon">
                      <img 
                        src={feature.icon} 
                        alt={`${feature.title} icon`}
                        loading="lazy"
                      />
                    </div>
                    <h3>{feature.title}</h3>
                  </div>
                  <div className="home-feature-content">
                    <p className="home-feature-description">{feature.description}</p>
                    <div className="home-feature-actions">
                      <span className="home-learn-more">Learn More</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="home-how-it-works" aria-labelledby="how-it-works-heading">
          <div className="home-how-content">
            <div className="home-section-header">
              <h2 id="how-it-works-heading">How It Works</h2>
              <p>Get started in minutes, not days</p>
            </div>
            <ul className="home-how-list" role="list">
              <li role="listitem" className="home-step-item">
                <div className="home-step-number">1</div>
                <div className="home-step-content">
                  <span>Create your company account</span>
                </div>
              </li>
              <li role="listitem" className="home-step-item">
                <div className="home-step-number">2</div>
                <div className="home-step-content">
                  <span>Add employees and roles</span>
                </div>
              </li>
              <li role="listitem" className="home-step-item">
                <div className="home-step-number">3</div>
                <div className="home-step-content">
                  <span>Manage HR tasks easily</span>
                </div>
              </li>
            </ul>
            <div className="home-how-cta">
              <Link to="/demo" className="home-demo-link">
                <button className="home-demo-btn" type="button">
                  <span>Watch Demo</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                </button>
              </Link>
            </div>
          </div>
          <div className="home-how-image">
            <img 
              src="/assets/images/how-it-works.png"
              alt="Step-by-step process illustration showing how HReady works"
              loading="lazy"
            />
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="home-testimonials" aria-labelledby="testimonials-heading">
          <div className="home-section-header">
            <h2 id="testimonials-heading">What Our Customers Say</h2>
            <p>Join satisfied HR professionals using HReady</p>
          </div>
          <div className="home-testimonials-grid">
            <div className="home-testimonial" role="article">
              <div className="home-testimonial-rating">
                ⭐⭐⭐⭐⭐
              </div>
              <blockquote>
                <p>"HReady simplified our HR processes and saved us countless hours every month. The automation features are game-changing!"</p>
                <cite>
                  <div className="home-testimonial-author">
                    <div className="home-author-avatar">JS</div>
                    <div className="home-author-info">
                      <div className="home-author-name">Jason Smith</div>
                      <div className="home-author-title">HR Manager, TechCorp</div>
                    </div>
                  </div>
                </cite>
              </blockquote>
            </div>
            <div className="home-testimonial" role="article">
              <div className="home-testimonial-rating">
                ⭐⭐⭐⭐⭐
              </div>
              <blockquote>
                <p>"The automation features saved us 20+ hours every month. Highly recommended for any growing company!"</p>
                <cite>
                  <div className="home-testimonial-author">
                    <div className="home-author-avatar">ER</div>
                    <div className="home-author-info">
                      <div className="home-author-name">Emily Rodriguez</div>
                      <div className="home-author-title">Operations Director, StartupXYZ</div>
                    </div>
                  </div>
                </cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="home-cta" aria-labelledby="cta-heading">
          <div className="home-cta-content">
            <h2 id="cta-heading">Ready to Transform Your HR Management?</h2>
            <p>Start streamlining your HR processes with HReady today. Join companies that have already improved their HR efficiency.</p>
            <div className="home-cta-buttons">
              <Link to="/contact" aria-label="Contact us for more information">
                <button className="home-primary-cta-btn" type="button">
                  <span>Contact Us</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2H2l8 9.46V19l4-2v-6.54L22 2z"/>
                  </svg>
                </button>
              </Link>
              <Link to="/get-started" aria-label="Start your free trial">
                <button className="home-secondary-cta-btn" type="button">
                  <span>Start Free Trial</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </Link>
            </div>
            <div className="home-cta-features">
              <div className="home-cta-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span>14-day free trial</span>
              </div>
              <div className="home-cta-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="home-cta-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer/>
    </div>
  );
}

export default HomePage;
