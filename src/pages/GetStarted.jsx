import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import "/src/pages/styles/GetStarted.css";

function GetStarted() {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("starter");

  const steps = [
    {
      number: 1,
      title: "Contact Us",
      description: "Email us to create your account and discuss your requirements",
      time: "5 minutes",
      icon: "📧"
    },
    {
      number: 2,
      title: "Account Setup",
      description: "We'll create your account and configure it for your business needs",
      time: "2 hours",
      icon: "⚙️"
    },
    {
      number: 3,
      title: "Add Your Team",
      description: "We'll help you add employees and set up their roles and permissions",
      time: "1 day",
      icon: "👥"
    },
    {
      number: 4,
      title: "Training & Launch",
      description: "Receive training and start using HReady for your HR operations",
      time: "1 day",
      icon: "🚀"
    }
  ];

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 25 employees",
        "Basic HR management",
        "Employee self-service",
        "Email support",
        "Mobile app access"
      ],
      popular: false
    },
    {
      id: "professional",
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Ideal for growing businesses",
      features: [
        "Up to 100 employees",
        "Advanced automation",
        "Performance management",
        "Priority support",
        "Custom workflows",
        "Analytics dashboard"
      ],
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited employees",
        "Custom integrations",
        "Dedicated support",
        "Advanced security",
        "White-label options",
        "API access"
      ],
      popular: false
    }
  ];

  const faqs = [
    {
      question: "How long does setup take?",
      answer: "Our team typically completes setup within 24 hours. We'll work with you to understand your needs and configure everything perfectly for your business."
    },
    {
      question: "Can you import our existing employee data?",
      answer: "Yes! We support CSV imports and integrations with popular HR systems like BambooHR and Workday. Our team will handle the migration process for you."
    },
    {
      question: "What if I need help during setup?",
      answer: "Our support team is available 24/7 via chat, email, or phone. We also provide personalized training sessions to ensure your team is comfortable with the system."
    },
    {
      question: "Can I change plans later?",
      answer: "Absolutely! You can upgrade or downgrade your plan at any time. Our team will help you transition smoothly with no disruption to your operations."
    },
    {
      question: "Is there a setup fee?",
      answer: "No! Setup service is completely free. We want to ensure you get the most out of HReady from day one."
    },
    {
      question: "What happens after setup is complete?",
      answer: "You'll receive personalized training sessions, ongoing support, and access to our knowledge base. We're here to help you succeed!"
    }
  ];

  return (
    <div className="get-started-page">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span>🚀 Professional Setup Service</span>
            </div>
            <h1>Ready to Transform Your HR Management?</h1>
            <p>Our expert team will set up HReady for your business and ensure everything is configured perfectly for your needs. Get personalized onboarding and support.</p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">24 hours</span>
                <span className="stat-label">Setup Completion</span>
              </div>
              <div className="stat">
                <span className="stat-number">Free</span>
                <span className="stat-label">Setup Service</span>
              </div>
              <div className="stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support Available</span>
              </div>
            </div>
            <div className="hero-buttons">
              <Link to="/contact" className="primary-btn">
                <span>Contact Our Team</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2H2l8 9.46V19l4-2v-6.54L22 2z"/>
                </svg>
              </Link>
              <Link to="/demo" className="secondary-btn">
                <span>Watch Demo</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,3 19,12 5,21"/>
                </svg>
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="/assets/images/get-started-hero.png" 
              alt="HReady setup process illustration"
              loading="lazy"
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works">
          <div className="section-header">
            <h2>How to Get Started</h2>
            <p>Follow these simple steps to set up your HR management system</p>
          </div>
          <div className="steps-container">
            <div className="steps-grid">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`step-card ${activeStep === index ? 'active' : ''}`}
                  onMouseEnter={() => setActiveStep(index)}
                >
                  <div className="step-number">{step.number}</div>
                  <div className="step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                  <div className="step-time">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12,6 12,12 16,14"/>
                    </svg>
                    <span>{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Setup Options Section */}
        <section className="setup-options">
          <div className="section-header">
            <h2>Choose Your Setup Path</h2>
            <p>Our expert team will handle the setup process for you</p>
          </div>
          <div className="options-grid">
            <div className="option-card">
              <div className="option-icon">🚀</div>
              <h3>Quick Setup</h3>
              <p>Get up and running quickly with our standard setup process. Perfect for teams who want to start immediately.</p>
              <ul>
                <li>Standard configuration setup</li>
                <li>Pre-configured templates</li>
                <li>Basic training session</li>
                <li>Setup completed in 24 hours</li>
              </ul>
              <Link to="/contact" className="option-btn">Request Quick Setup</Link>
            </div>
            <div className="option-card featured">
              <div className="option-badge">Most Popular</div>
              <div className="option-icon">⚙️</div>
              <h3>Custom Setup</h3>
              <p>Tailor HReady to your specific needs with advanced configuration options and personalized onboarding.</p>
              <ul>
                <li>Custom workflow configuration</li>
                <li>Data migration assistance</li>
                <li>Dedicated setup specialist</li>
                <li>Comprehensive training sessions</li>
              </ul>
              <Link to="/contact" className="option-btn">Schedule Setup Call</Link>
            </div>
            <div className="option-card">
              <div className="option-icon">🎓</div>
              <h3>Training & Support</h3>
              <p>Get comprehensive training and ongoing support to ensure your team maximizes the value of HReady.</p>
              <ul>
                <li>Personalized training sessions</li>
                <li>Video tutorials & guides</li>
                <li>24/7 support access</li>
                <li>Best practices consultation</li>
              </ul>
              <Link to="/contact" className="option-btn">Get Training</Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="pricing">
          <div className="section-header">
            <h2>Choose Your Plan</h2>
            <p>Start with a consultation, then choose the plan that fits your business</p>
          </div>
          <div className="pricing-grid">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`pricing-card ${plan.popular ? 'popular' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    <span className="price">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                </div>
                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="plan-btn">
                  {plan.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq">
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about getting started with HReady</p>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="home-cta">
          <div className="home-cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Contact our team today and we'll set up HReady for your business with personalized configuration and training.</p>
            <div className="home-cta-buttons">
              <Link to="/contact" className="home-primary-cta-btn">
                <span>Contact Our Team</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2H2l8 9.46V19l4-2v-6.54L22 2z"/>
                </svg>
              </Link>
              <Link to="/contact" className="home-secondary-cta-btn">
                <span>Schedule Demo</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2H2l8 9.46V19l4-2v-6.54L22 2z"/>
                </svg>
              </Link>
            </div>
            <div className="home-cta-features">
              <div className="home-cta-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span>Free setup service</span>
              </div>
              <div className="home-cta-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span>24-hour setup completion</span>
              </div>
              <div className="home-cta-feature">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                </svg>
                <span>Personalized training</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default GetStarted; 