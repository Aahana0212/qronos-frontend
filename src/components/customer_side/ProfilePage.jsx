import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('qronos_user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData({
        name: parsedUser.name || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || '',
        address: parsedUser.address || ''
      });
    } else {
      navigate('/customer-login');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('qronos_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setEditing(false);
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('qronos_user');
    localStorage.removeItem('qronos_token');
    localStorage.removeItem('qronos_cart');
    navigate('/');
  };

  const orders = JSON.parse(localStorage.getItem('qronos_orders') || '[]').filter(
    o => o.customerDetails?.email === user?.email
  );

  if (!user) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1>My Profile</h1>
        {!editing && <button className="edit-btn" onClick={() => setEditing(true)}>Edit Profile</button>}
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            <div className="avatar-circle">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
          </div>

          {editing ? (
            <div className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Delivery Address</label>
                <textarea name="address" value={formData.address} onChange={handleInputChange} rows="3" />
              </div>
              <div className="form-actions">
                <button className="save-btn" onClick={handleSave}>Save Changes</button>
                <button className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Name</span>
                <span className="info-value">{user.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone</span>
                <span className="info-value">{user.phone}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Address</span>
                <span className="info-value">{user.address || 'Not added yet'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="orders-card">
          <h3>My Orders</h3>
          {orders.length === 0 ? (
            <p className="no-orders">No orders yet</p>
          ) : (
            <div className="orders-list">
              {orders.map((order, idx) => (
                <div key={idx} className="order-item">
                  <div className="order-header">
                    <span className="order-id">#{order.orderId}</span>
                    <span className="order-date">{new Date(order.orderDate).toLocaleDateString()}</span>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                  </div>
                  <div className="order-items">
                    {order.items?.slice(0, 2).map((item, i) => (
                      <span key={i}>{item.quantity}x {item.name}</span>
                    ))}
                    {order.items?.length > 2 && <span>+{order.items.length - 2} more</span>}
                  </div>
                  <div className="order-footer">
                    <span className="order-total">₹{order.total.toFixed(2)}</span>
                    <button onClick={() => navigate(`/order-tracking/${order.orderId}`)} className="track-order-btn">
                      Track Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;