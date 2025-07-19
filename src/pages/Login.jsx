import '/src/pages/styles/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Toast from '../components/common/Toast';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.message || 'Login failed', type: 'error' });
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);

      // Decode token to get user id and role
      const decoded = jwtDecode(data.token);
      localStorage.setItem('userId', decoded.id);
      localStorage.setItem('role', decoded.role);

      setToast({ message: 'Login successful! Redirecting...', type: 'success' });

      setTimeout(() => {
        if (decoded.role === 'admin') navigate(`/admin/${decoded.id}`);
        else if (decoded.role === 'employee') navigate(`/employee/${decoded.id}`);
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      setToast({ message: 'Something went wrong. Please try again.', type: 'error' });
    }

    setLoading(false);
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
            <img className="logo" src="/src/assets/primary_icon.webp" alt="HReady" />
            <h1>Welcome Back</h1>
            <p>Sign in to your HReady account to continue managing your workforce efficiently.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-field-row">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  className="toggle-visibility-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <>
                  <span>Signing In...</span>
                  <div className="loading-spinner"></div>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

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
