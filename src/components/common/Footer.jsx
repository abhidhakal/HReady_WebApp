import React from "react";
import "/src/components/styles/Footer.css";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <img src="src/assets/primary.webp"/>
          <div className="footer-brand-details">
            <h3>HReady</h3>
            <p>Smart HR Management Solution</p>
          </div>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home Page</Link></li>
            <li><Link to="/services">Our Services</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/about-us">About HReady</Link></li>
          </ul>
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <p><strong>Email:</strong> info@hready.com</p>
          <p><strong>Phone:</strong> +1 234 567 890</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} HReady. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
