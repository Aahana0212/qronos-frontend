// src/components/restaurant_side/rest_loginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../../utils/api';
import './AuthPages.css';

const RestLoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    restaurantSlug: '',
    email: '',
    password: '',
    role: 'owner',
    rememberMe: false,
  });

  const roles = [
    { value: 'owner', label: 'Restaurant Owner', icon: '👑' },
    { value: 'admin', label: 'Admin Staff', icon: '👨‍💼' },
    { value: 'kitchen', label: 'Kitchen Staff', icon: '👨‍🍳' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.restaurantSlug || !formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      const response = await apiPost('/auth/login', {
        restaurantSlug: formData.restaurantSlug,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        rememberMe: formData.rememberMe,
      });

      console.log('Full Login Response:', response); // Debugging

      if (!response || response.error) {
        throw new Error(response?.message || 'No response from server');
      }

      // Resolve restaurantId from response (no hardcoded fallback)
      const restaurantId =
        response.restaurantId ??
        response.user?.restaurantId ??
        response.user?.restaurant_id ??
        response.restaurant?.id ??
        null;

      if (!restaurantId) {
        console.error('❌ No restaurantId in login response:', response);
        setError('Unable to get restaurant information. Please contact support.');
        setLoading(false);
        return;
      }

      // Clear any stale session data from a previous login before writing fresh values
      localStorage.removeItem('qronos_token');
      localStorage.removeItem('qronos_user');
      localStorage.removeItem('restaurantId');

      if (response.token) {
        localStorage.setItem('qronos_token', response.token);
      }

      const userData = response.user || { role: formData.role };
      localStorage.setItem('qronos_user', JSON.stringify(userData));
      localStorage.setItem('restaurantId', String(restaurantId));
      console.log('✅ RestaurantId saved:', restaurantId);

      // ✅ Get role safely
      const userRole = response.user?.role || formData.role;
      
      // ✅ Redirect based on role
      if (userRole === 'owner') {
        navigate('/owner-dashboard');
      } else if (userRole === 'admin') {
        navigate('/admin-dashboard');
      } else if (userRole === 'kitchen') {
        navigate('/kitchen');
      } else {
        navigate('/restaurant');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Back button handler
  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>
        
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your restaurant dashboard</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Restaurant Slug</label>
            <input
              type="text"
              name="restaurantSlug"
              placeholder="e.g., pizza-hub"
              value={formData.restaurantSlug}
              onChange={handleChange}
              required
            />
            <small>Your restaurant unique identifier</small>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Login As</label>
            <div className="role-options-login">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`role-chip ${formData.role === role.value ? 'active' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={handleChange}
                  />
                  <span className="role-icon">{role.icon}</span>
                  <span className="role-label">{role.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-row-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <button type="button" className="forgot-btn" onClick={() => navigate('/forgot-password')}>
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <span onClick={() => navigate('/restaurant-register')}>
                Register Restaurant
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RestLoginPage;