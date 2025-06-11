import React from 'react';
import './css/Services.css';
import Header from './Header';

function Services() {
    return (
        <div className="full-screen">
            <Header />
            <div className="services-container">
                <div className="services-content">
                    <h1>Our Services</h1>
                    <p className="services-intro">
                        HReady is your all-in-one Human Resource Management System designed for simplicity, speed, and smart workflows.
                    </p>

                    <div className="services-grid">
                        <div className="service-card">
                            <h2>Employee Management</h2>
                            <p>Maintain complete employee records and organizational structure with ease.</p>
                        </div>
                        <div className="service-card">
                            <h2>Attendance Tracking</h2>
                            <p>Track and analyze employee attendance with real-time accuracy.</p>
                        </div>
                        <div className="service-card">
                            <h2>Leave Management</h2>
                            <p>Request, approve, and manage employee leave with transparency.</p>
                        </div>
                        <div className="service-card">
                            <h2>Company Announcements</h2>
                            <p>Stay connected with your team through timely updates and notices.</p>
                        </div>
                        <div className="service-card">
                            <h2>Performance Tracking</h2>
                            <p>Monitor goals, feedback, and progress across your workforce.</p>
                        </div>
                        <div className="service-card">
                            <h2>Document Management</h2>
                            <p>Securely store and share important HR documents and contracts.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Services;
