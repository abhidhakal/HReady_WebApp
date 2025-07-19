import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AboutUs.css'
import Header from '../common/Header';

function AboutUs() {
    const values = [
        {
            icon: "🎯",
            title: "Simplicity",
            description: "We believe in making complex HR processes simple and intuitive for everyone."
        },
        {
            icon: "⚡",
            title: "Efficiency",
            description: "Streamlined workflows that save time and reduce administrative overhead."
        },
        {
            icon: "🤝",
            title: "People-First",
            description: "Technology that serves people, not the other way around."
        },
        {
            icon: "🔒",
            title: "Security",
            description: "Enterprise-grade security to protect your most valuable asset - your people."
        }
    ];

    // const stats = [
    //     { number: "100+", label: "Companies Trust Us" },
    //     { number: "10K+", label: "Employees Managed" },
    //     { number: "99.9%", label: "Uptime Guarantee" },
    //     { number: "24/7", label: "Support Available" }
    // ];

    return(
        <div className="full-screen-about">
            <Header/>
            <div className="about-container">
                <div className="about-content">
                    <div className="about-header">
                        <div className="about-badge">
                            <span>🌟 Our Story</span>
                        </div>
                        <h1>Empowering Workplaces Through Smart HR Solutions</h1>
                        <p className="about-intro">
                            At HReady, we're passionate about transforming how organizations manage their most valuable asset - their people. 
                            Our mission is to make HR management effortless, intuitive, and effective for everyone.
                        </p>
                    </div>

                    <div className="about-sections">
                        <div className="about-section">
                            <h2>Our Mission</h2>
                            <p>
                                We believe that managing people should be effortless, intuitive, and effective. 
                                Our mission is to redefine how organizations approach human resources—by offering a modern, 
                                centralized platform that brings clarity and ease to everyday HR operations.
                            </p>
                        </div>

                        <div className="about-section">
                            <h2>What We Offer</h2>
                            <p>
                                HReady is a comprehensive Human Resource Management System built for today's dynamic workplaces. 
                                From employee profiles and attendance tracking to leave management and announcements, 
                                we provide all the essential tools in one streamlined solution—accessible on both web and mobile.
                            </p>
                        </div>

                        <div className="about-section">
                            <h2>Our Approach</h2>
                            <p>
                                Whether you're a manager keeping your team in sync or an employee staying updated and organized, 
                                HReady is designed to support you every step of the way. With a focus on simplicity, speed, and smart design, 
                                our platform removes unnecessary complexity and lets you focus on what matters most: your people.
                            </p>
                        </div>

                        <div className="about-section">
                            <h2>Our Promise</h2>
                            <p>
                                We are not just another HR tool—we are a team that's passionate about creating better workplace experiences 
                                through thoughtful technology. With HReady, HR does not feel like a chore—it becomes a natural part of your workflow.
                            </p>
                        </div>
                    </div>

                    <div className="values-section">
                        <h2>Our Core Values</h2>
                        <div className="values-grid">
                            {values.map((value, index) => (
                                <div key={index} className="value-card">
                                    <div className="value-icon">
                                        <span>{value.icon}</span>
                                    </div>
                                    <h3>{value.title}</h3>
                                    <p>{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* <div className="stats-section">
                        <h2>Trusted by Growing Companies</h2>
                        <div className="stats-grid">
                            {stats.map((stat, index) => (
                                <div key={index} className="stat-card">
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    <div className="about-cta">
                        <h3>Ready to Transform Your HR Management?</h3>
                        <p>Join the companies that have already improved their HR efficiency with HReady.</p>
                        <div className="cta-buttons">
                            <Link to="/get-started">
                                <button className="primary-cta-btn">
                                    <span>Get Started</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </button>
                            </Link>
                            <Link to="/services">
                                <button className="secondary-cta-btn">
                                    <span>Learn More</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 18l6-6-6-6"/>
                                    </svg>
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutUs;