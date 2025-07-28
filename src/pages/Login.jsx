import '/src/pages/styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Toast from '/src/components/Toast.jsx';
import api, { checkApiHealth } from '/src/api/api.js';

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(5, 'Password must be at least 5 characters long')
    .required('Password is required'),
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(null);
  const navigate = useNavigate();

  // Check for existing session on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          // Token is still valid, redirect to appropriate dashboard
          if (decoded.role === 'admin') {
            navigate(`/admin/${decoded.id}`);
          } else if (decoded.role === 'employee') {
            navigate(`/employee/${decoded.id}`);
          }
        } else {
          // Token expired, clear it
          localStorage.clear();
        }
      } catch (error) {
        // Invalid token, clear it
        localStorage.clear();
      }
    }
  }, [navigate]);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setToast({ message: 'Signing in...', type: 'info' });

    try {
      // Check if API is ready first (for slow Render deployments)
      const isApiReady = await checkApiHealth();
      if (!isApiReady) {
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      const res = await api.post('/auth/login', {
        email: values.email.trim().toLowerCase(),
        password: values.password
      });

      const data = res.data;

      // Clear any previous error states
      setAttempts(0);
      setIsLocked(false);
      setLockoutTime(null);

      // Store authentication data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data._id);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userName', data.name);

      setToast({ message: 'Login successful! Redirecting...', type: 'success' });

      // Redirect after a short delay
      setTimeout(() => {
        if (data.role === 'admin') {
          navigate(`/admin/${data._id}`);
        } else if (data.role === 'employee') {
          navigate(`/employee/${data._id}`);
        }
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      const statusCode = error.response?.status;

      // Handle different error scenarios
      if (statusCode === 423) {
        // Account locked
        setIsLocked(true);
        const retryAfter = error.response?.data?.retryAfter || 900; // 15 minutes default
        setLockoutTime(new Date(Date.now() + retryAfter * 1000));
        setToast({ 
          message: 'Account temporarily locked due to too many failed attempts. Please try again later.', 
          type: 'error' 
        });
      } else if (statusCode === 429) {
        // Rate limited
        const retryAfter = error.response?.data?.retryAfter || 900;
        setLockoutTime(new Date(Date.now() + retryAfter * 1000));
        setToast({ 
          message: 'Too many login attempts. Please wait before trying again.', 
          type: 'error' 
        });
      } else if (statusCode === 401) {
        // Invalid credentials
        setAttempts(prev => prev + 1);
        setToast({ message: errorMessage, type: 'error' });
      } else if (statusCode === 403) {
        // Access denied (suspicious request)
        setToast({ 
          message: 'Access denied. Please check your request and try again.', 
          type: 'error' 
        });
      } else {
        // Other errors
        setToast({ message: errorMessage, type: 'error' });
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Check if form should be disabled
  const isFormDisabled = () => {
    return loading || isLocked || (lockoutTime && new Date() < lockoutTime);
  };

  // Get remaining lockout time
  const getRemainingTime = () => {
    if (!lockoutTime) return null;
    
    const remaining = Math.max(0, lockoutTime.getTime() - Date.now());
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="login-wrapper">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
      />
      
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img className="logo" src="/assets/images/primary_icon.webp" alt="HReady" />
            <h1>Welcome Back</h1>
            <p>Sign in to your HReady account to continue managing your workforce efficiently.</p>
          </div>

          {isLocked && (
            <div className="lockout-warning">
              <i className="fas fa-lock"></i>
              <p>Account temporarily locked</p>
              <small>Too many failed attempts. Please try again later.</small>
            </div>
          )}

          {lockoutTime && new Date() < lockoutTime && (
            <div className="rate-limit-warning">
              <i className="fas fa-clock"></i>
              <p>Please wait before trying again</p>
              <small>Time remaining: {getRemainingTime()}</small>
            </div>
          )}

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email address"
                      className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
                      disabled={isFormDisabled()}
                      autoComplete="email"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="error-message" />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="password-field-row">
                    <Field
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      className={`form-input ${errors.password && touched.password ? 'error' : ''}`}
                      disabled={isFormDisabled()}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="toggle-visibility-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      disabled={isFormDisabled()}
                    >
                      <img
                        src={
                          showPassword
                            ? "/assets/icons/view_on.svg"
                            : "/assets/icons/view_off.svg"
                        }
                        alt="Toggle password visibility"
                      />
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="error-message" />
                </div>

                {attempts > 0 && (
                  <div className="attempts-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Failed attempts: {attempts}/5</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="login-btn" 
                  disabled={isFormDisabled() || isSubmitting}
                >
                  <span>Sign In</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </Form>
            )}
          </Formik>

          <div className="login-footer">
            <Link to="/" className="return-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              <span>Return to Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
