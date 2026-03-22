import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthPages.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer'  // Default customer
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Enter valid 10-digit phone number');
      setLoading(false);
      return;
    }

    try {
      // ✅ Send selected role to backend
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role  // ✅ Selected role (customer/kitchen/admin)
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(`✅ Registration successful! You registered as ${data.user.role.toUpperCase()}. Please login.`);
        
        // Clear form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          role: 'customer'
        });
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>📝 REGISTER</h1>
        <p className="auth-subtitle">Create your QRONOS account</p>
        
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
          </div>
          
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="98765 43210" required />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
          </div>
          
          {/* Role Selection */}
          <div className="form-group">
            <label>Register As</label>
            <div className="role-options">
              <label className={`role-card ${formData.role === 'customer' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="customer" 
                  checked={formData.role === 'customer'} 
                  onChange={handleChange}
                />
                <span className="role-icon">👤</span>
                <span className="role-name">Customer</span>
                <span className="role-desc">Browse menu, order food</span>
              </label>
              
              <label className={`role-card ${formData.role === 'kitchen' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="kitchen" 
                  checked={formData.role === 'kitchen'} 
                  onChange={handleChange}
                />
                <span className="role-icon">👨‍🍳</span>
                <span className="role-name">Kitchen Staff</span>
                <span className="role-desc">Manage orders, update status</span>
              </label>
              
              <label className={`role-card ${formData.role === 'admin' ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="admin" 
                  checked={formData.role === 'admin'} 
                  onChange={handleChange}
                />
                <span className="role-icon">👑</span>
                <span className="role-name">Admin</span>
                <span className="role-desc">Full control, manage everything</span>
              </label>
            </div>
          </div>
          
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'REGISTERING...' : 'REGISTER'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>Already have an account? 
            <button onClick={() => navigate('/login')}>LOGIN</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;