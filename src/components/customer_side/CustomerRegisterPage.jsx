// src/components/customer_side/CustomerRegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../utils/api';
import './AuthPages.css';

const CustomerRegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('All fields are required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const response = await apiPost('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'customer',
      });
      if (!response.success) {
        setError(response.message || response.error || 'Registration failed');
        return;
      }
      alert('Registration successful! Please login.');
      navigate('/customer-login');
    } catch (err) {
      setError(err.message || 'Registration failed');
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
          <h2>Create Account</h2>
          <p>Join QRONOS to order food easily</p>
        </div>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Full Name</label><input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required /></div>
          <div className="form-group"><label>Email Address</label><input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required /></div>
          <div className="form-group"><label>Phone Number</label><input type="tel" name="phone" placeholder="9876543210" value={formData.phone} onChange={handleChange} required /></div>
          <div className="form-group"><label>Password</label><input type="password" name="password" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required /></div>
          <div className="form-group"><label>Confirm Password</label><input type="password" name="confirmPassword" placeholder="Retype password" value={formData.confirmPassword} onChange={handleChange} required /></div>
          <button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Creating Account...' : 'Sign Up →'}</button>
          <div className="auth-footer"><p>Already have an account? <span onClick={() => navigate('/customer-login')}>Login</span></p></div>
        </form>
      </div>
    </div>
  );
};

export default CustomerRegisterPage;