import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Contact.css'
import Header from '../common/Header';

function Contact() {
    return(
        <div className="full-screen">
            <Header/>
            <div className="contact-container">
                <div className="contact-content">
                    <h1>Contact Us</h1>
                    <p>We’d love to hear from you! Whether you have a question about features, pricing, or anything else, our team is ready to help.</p>

                    <div className="contact-details">
                    <p><strong>Support:</strong> support@hready.com</p>
                    <p><strong>Inquiry:</strong> inquiry@hready.com</p>
                    <p><strong>Sales:</strong> sales@hready.com</p>
                    <p><strong>Phone:</strong> +977 986-5206747</p>
                    <p><strong>Address:</strong> Kathmandu, Nepal</p>
                    </div>

                    <form className="contact-form">
                    <p><strong>Send Us A Message</strong></p>
                    <input type="text" placeholder="Your Name" required />
                    <input type="email" placeholder="Your Email" required />
                    <textarea placeholder="Your Message" rows="5" required></textarea>
                    <button type="submit">Send Message</button>
                    </form>
                </div>
                </div>
        </div>
    );
}

export default Contact;
