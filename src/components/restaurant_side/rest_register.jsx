// src/components/restaurant_side/rest_register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../utils/api';
import './AuthPages.css';

const RestRegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    restaurantName: '',
    restaurantType: '',
    restaurantPhone: '',
    restaurantAddress: '',
    restaurantSlug: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const restaurantTypes = [
    'Cafe & Bistro', 'Fast Food', 'Fine Dining', 'Coffee Shop',
    'Family Restaurant', 'Pizza Place', 'Bakery', 'Ice Cream Parlor',
    'Food Truck', 'Other'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (e.target.name === 'restaurantName') {
      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setFormData(prev => ({ ...prev, restaurantSlug: slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.restaurantName) {
      setError('Restaurant name is required');
      return;
    }
    if (!formData.ownerName) {
      setError('Owner name is required');
      return;
    }
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
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
      await apiPost('/auth/register-restaurant', {
        restaurant: {
          name: formData.restaurantName,
          type: formData.restaurantType,
          phone: formData.restaurantPhone,
          address: formData.restaurantAddress,
          slug: formData.restaurantSlug,
        },
        owner: {
          name: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }
      });
      
      alert('Restaurant registered successfully! Please login.');
      navigate('/restaurant-login');
      
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Register Your Restaurant</h2>
          <p>Join 500+ restaurants on QRONOS</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Restaurant Details */}
          <div className="form-section">
            <h3>🏪 Restaurant Details</h3>
            
            <div className="form-group">
              <label>Restaurant Name *</label>
              <input
                type="text"
                name="restaurantName"
                placeholder="e.g., The Spice Kitchen"
                value={formData.restaurantName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Restaurant Type</label>
                <select name="restaurantType" value={formData.restaurantType} onChange={handleChange}>
                  <option value="">Select type</option>
                  {restaurantTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Restaurant Slug</label>
                <input
                  type="text"
                  name="restaurantSlug"
                  placeholder="your-restaurant"
                  value={formData.restaurantSlug}
                  onChange={handleChange}
                  readOnly
                  style={{ background: '#2a2a2a', cursor: 'not-allowed', borderRadius: '12px' }}
                />
                <small>Auto-generated from name</small>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Restaurant Phone</label>
                <input
                  type="tel"
                  name="restaurantPhone"
                  placeholder="+91 98765 43210"
                  value={formData.restaurantPhone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Restaurant Address</label>
                <input
                  type="text"
                  name="restaurantAddress"
                  placeholder="Full address"
                  value={formData.restaurantAddress}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Owner Details */}
          <div className="form-section">
            <h3>👨‍💼 Owner Details</h3>
            
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="ownerName"
                placeholder="John Doe"
                value={formData.ownerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="contact@restaurant.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Retype password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register Restaurant →'}
          </button>
          
          <div className="auth-footer">
            <p>Already have an account? <span onClick={() => navigate('/restaurant-login')}>Log In</span></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestRegisterPage;