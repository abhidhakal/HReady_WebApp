import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import '../styles/Contact.css'
import Header from '../common/Header';

// Validation schema for contact form
const ContactSchema = Yup.object().shape({
    name: Yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters'),
    email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
    subject: Yup.string()
        .required('Subject is required')
        .min(5, 'Subject must be at least 5 characters'),
    message: Yup.string()
        .required('Message is required')
        .min(10, 'Message must be at least 10 characters'),
});

function Contact() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setLoading(true);
        
        // Simulate form submission
        setTimeout(() => {
            setLoading(false);
            resetForm();
            alert('Thank you for your message! We\'ll get back to you soon.');
            setSubmitting(false);
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
                            
                            <Formik
                                initialValues={{
                                    name: '',
                                    email: '',
                                    subject: '',
                                    message: ''
                                }}
                                validationSchema={ContactSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting, errors, touched }) => (
                                    <Form className="contact-form">
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label htmlFor="name">Full Name</label>
                                                <Field
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    placeholder="Enter your full name"
                                                    className={errors.name && touched.name ? 'error' : ''}
                                                />
                                                <ErrorMessage name="name" component="div" className="error-message" />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="email">Email Address</label>
                                                <Field
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    placeholder="Enter your email address"
                                                    className={errors.email && touched.email ? 'error' : ''}
                                                />
                                                <ErrorMessage name="email" component="div" className="error-message" />
                                            </div>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="subject">Subject</label>
                                            <Field
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                placeholder="What's this about?"
                                                className={errors.subject && touched.subject ? 'error' : ''}
                                            />
                                            <ErrorMessage name="subject" component="div" className="error-message" />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="message">Message</label>
                                            <Field
                                                as="textarea"
                                                id="message"
                                                name="message"
                                                placeholder="Tell us more about your inquiry..."
                                                rows="5"
                                                className={errors.message && touched.message ? 'error' : ''}
                                            />
                                            <ErrorMessage name="message" component="div" className="error-message" />
                                        </div>
                                        
                                        <button type="submit" className="submit-btn" disabled={loading || isSubmitting}>
                                            {loading || isSubmitting ? (
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
                                    </Form>
                                )}
                            </Formik>
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
