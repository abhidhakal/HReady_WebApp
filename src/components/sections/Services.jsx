import React from 'react';
import '../styles/Services.css';
import Header from '../common/Header';

function Services() {
    const services = [
        {
            icon: "👥",
            title: "Employee Management",
            description: "Comprehensive employee database with role management, performance tracking, and organizational structure management.",
            features: ["Employee profiles", "Role management", "Organizational charts", "Employee onboarding"]
        },
        {
            icon: "⏰",
            title: "Attendance Tracking",
            description: "Automated time tracking with geolocation, flexible scheduling, and real-time attendance analytics.",
            features: ["Real-time tracking", "Geolocation", "Flexible schedules", "Attendance reports"]
        },
        {
            icon: "📅",
            title: "Leave Management",
            description: "Streamlined leave requests and approvals with automated workflows and transparent tracking.",
            features: ["Leave requests", "Approval workflows", "Leave balance", "Calendar integration"]
        },
        {
            icon: "📢",
            title: "Company Announcements",
            description: "Stay connected with your team through timely updates, notifications, and company-wide communications.",
            features: ["Company updates", "Team notifications", "Important notices", "Communication hub"]
        },
        {
            icon: "📊",
            title: "Performance Tracking",
            description: "Monitor goals, provide feedback, and track progress across your entire workforce with detailed analytics.",
            features: ["Goal setting", "Performance reviews", "Feedback system", "Progress tracking"]
        },
        {
            icon: "📁",
            title: "Document Management",
            description: "Securely store, organize, and share important HR documents, contracts, and company policies.",
            features: ["Secure storage", "Document organization", "Access control", "Version tracking"]
        }
    ];

    return (
        <div className="full-screen-services">
            <Header />
            <div className="services-container">
                <div className="services-content">
                    <div className="services-header">
                        <div className="services-badge">
                            <span>🚀 Our Solutions</span>
                        </div>
                        <h1>Comprehensive HR Management Services</h1>
                        <p className="services-intro">
                            HReady provides a complete suite of HR management tools designed to streamline your workforce operations, 
                            enhance productivity, and create a better workplace experience for everyone.
                        </p>
                    </div>

                    <div className="services-grid">
                        {services.map((service, index) => (
                            <div key={index} className="service-card">
                                <div className="service-icon">
                                    <span>{service.icon}</span>
                                </div>
                                <div className="service-content">
                                    <h2>{service.title}</h2>
                                    <p className="service-description">{service.description}</p>
                                    <ul className="service-features">
                                        {service.features.map((feature, featureIndex) => (
                                            <li key={featureIndex}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M9 12l2 2 4-4"/>
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="services-cta">
                        <h3>Ready to Transform Your HR Management?</h3>
                        <p>Join companies that have already improved their HR efficiency with HReady.</p>
                        <div className="cta-buttons">
                            <button className="primary-cta-btn">
                                <span>Get Started</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </button>
                            <button className="secondary-cta-btn">
                                <span>Learn More</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Services;
