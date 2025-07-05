import './css/Login.css';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
        toast.error(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userId', data._id); // saves current userId to local storage

      toast.success('Login successful! Redirecting...');

      setTimeout(() => {
        if (data.role === 'admin') navigate(`/admin/${data._id}`);
        else if (data.role === 'employee') navigate(`/employee/${data._id}`);
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="full-screen">
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="login">
        <img className="logo" src="../src/assets/transparent.png" alt="HReady" />
        <h1>Login to HReady</h1>
        <p>Enter your credentials to access the dashboard.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email"
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
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
