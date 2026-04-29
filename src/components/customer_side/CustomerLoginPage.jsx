// src/components/customer_side/CustomerLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../utils/api';
import './AuthPages.css';

const CustomerLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    try {
      const response = await apiPost('/auth/customer-login', {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
      localStorage.setItem('qronos_token', response.token);
      localStorage.setItem('qronos_user', JSON.stringify(response.user));
      navigate('/order-type');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ✅ BACK BUTTON ADDED */}
      <button className="auth-back-btn" onClick={() => navigate('/customer-landing')}>
        ← Back
      </button>
      
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back!</h2>
          <p>Sign in to continue ordering</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="form-row-options">
            <label className="checkbox-label">
              <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} />
              <span>Remember me</span>
            </label>
            <button type="button" className="forgot-btn" onClick={() => navigate('/forgot-password')}>Forgot Password?</button>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
          <div className="auth-footer">
            <p>Don't have an account? <span onClick={() => navigate('/customer-register')}>Sign Up</span></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerLoginPage;