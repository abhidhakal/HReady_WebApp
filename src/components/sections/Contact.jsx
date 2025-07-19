import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Contact.css'
import Header from '../common/Header';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        // Simulate form submission
        setTimeout(() => {
            setLoading(false);
            setFormData({ name: '', email: '', subject: '', message: '' });
            alert('Thank you for your message! We\'ll get back to you soon.');
        }, 2000);
    };

    const contactInfo = [
        {
            icon: "📧",
            title: "Email Support",
            details: ["support@hready.com", "inquiry@hready.com", "sales@hready.com"],
            description: "Get in touch with our support team"
        },
        {
            icon: "📞",
            title: "Phone",
            details: ["+977 986-5206747"],
            description: "Call us during business hours"
        },
        {
            icon: "📍",
            title: "Location",
            details: ["Kathmandu, Nepal"],
            description: "Visit our office"
        },
        {
            icon: "⏰",
            title: "Business Hours",
            details: ["Mon - Fri: 9:00 AM - 6:00 PM", "Sat: 10:00 AM - 4:00 PM"],
            description: "We're here to help"
        }
    ];

    return(
        <div className="full-screen-contact">
            <Header/>
            <div className="contact-container">
                <div className="contact-content">
                    <div className="contact-header">
                        <div className="contact-badge">
                            <span>💬 Get In Touch</span>
                        </div>
                        <h1>Let's Start a Conversation</h1>
                        <p className="contact-intro">
                            We'd love to hear from you! Whether you have a question about features, pricing, 
                            or anything else, our team is ready to help you find the perfect HR solution.
                        </p>
                    </div>

                    <div className="contact-sections">
                        <div className="contact-info-section">
                            <div className="contact-info-grid">
                                {contactInfo.map((info, index) => (
                                    <div key={index} className="contact-info-card">
                                        <div className="contact-info-icon">
                                            <span>{info.icon}</span>
                                        </div>
                                        <div className="contact-info-content">
                                            <h3>{info.title}</h3>
                                            <p className="contact-info-description">{info.description}</p>
                                            {info.details.map((detail, detailIndex) => (
                                                <p key={detailIndex} className="contact-info-detail">{detail}</p>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="contact-form-section">
                            <h2>Send Us a Message</h2>
                            <p>Fill out the form below and we'll get back to you as soon as possible.</p>
                            
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="name">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="Enter your email address"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="subject">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        placeholder="What's this about?"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        placeholder="Tell us more about your inquiry..."
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>
                                
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span>Sending Message...</span>
                                            <div className="loading-spinner"></div>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Message</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 2H2l8 9.46V19l4-2v-6.54L22 2z"/>
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="contact-cta">
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
                                    <span>View Services</span>
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

export default Contact;
