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
        <div className="login">
        <img className="logo" src="/src/assets/primary_icon.webp" alt="HReady" />
        <h1>Login to HReady</h1>
        <p>Enter your credentials to access the dashboard.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="input-wrapper">
              <input
                type="text"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="toggle-visibility-btn"
                onClick={() => setShowPassword((prev) => !prev)}
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <Link to="/">
          <label className="return-label">Return to Main Screen</label>
        </Link>
      </div>
      </div>
  );
}

export default Login;
