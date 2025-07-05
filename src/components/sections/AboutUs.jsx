import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AboutUs.css'
import Header from '../common/Header';

function AboutUs() {
    return(
        <div className="full-screen">
            <div className="about-container">
            <Header/>
            <div className="about-content">
                <h1>About Us</h1>
                <p>
                At <strong>HReady</strong>, we believe that managing people should be effortless, intuitive, and effective.
                Our mission is to redefine how organizations approach human resources—by offering a modern, centralized platform
                that brings clarity and ease to everyday HR operations.
                </p>
                <p>
                HReady is a comprehensive Human Resource Management System built for today's dynamic workplaces.
                From employee profiles and attendance tracking to leave management and announcements, we provide all the essential
                tools in one streamlined solution—accessible on both web and mobile.
                </p>
                <p>
                Whether you're a manager keeping your team in sync or an employee staying updated and organized,
                HReady is designed to support you every step of the way. With a focus on simplicity, speed, and smart design,
                our platform removes unnecessary complexity and lets you focus on what matters most: your people.
                </p>
                <p>
                We are not just another HR tool—we are a team that's passionate about creating better workplace experiences
                through thoughtful technology. With HReady, HR does not feel like a chore—it becomes a natural part of your workflow.
                </p>
            </div>
            </div>
        </div>
    );
}
export default AboutUs;