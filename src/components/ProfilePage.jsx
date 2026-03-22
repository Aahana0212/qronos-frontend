import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const userData = localStorage.getItem('qronos_user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const loggedInUser = JSON.parse(userData);
    setUser(loggedInUser);
    fetchUserOrders(loggedInUser);
  }, []);

  const fetchUserOrders = async (user) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/user/${user.phone}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('qronos_token');
    localStorage.removeItem('qronos_user');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '👤';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2024';

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        {/* Header */}
        <div className="profile-header">
          <button className="back-btn" onClick={() => navigate('/menu')}>← Back to Menu</button>
          <h1>My Profile</h1>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>

        <div className="profile-content">
          {/* Profile Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                <div className="avatar-large">{getInitials(user.name)}</div>
                <h2>{user.name}</h2>
                <p className="user-role">
                  {user.role === 'admin' ? '👑 Administrator' : 
                   user.role === 'kitchen' ? '👨‍🍳 Kitchen Staff' : '🍽️ Customer'}
                </p>
                <p className="member-since">Member since {memberSince}</p>
              </div>

              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{totalOrders}</span>
                  <span className="stat-label">Orders</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">₹{totalSpent.toLocaleString()}</span>
                  <span className="stat-label">Total Spent</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{user.phone}</span>
                  <span className="stat-label">Phone</span>
                </div>
              </div>

              <div className="profile-menu">
                <button className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                  <span className="menu-icon">👤</span>
                  <span>Overview</span>
                </button>
                <button className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                  <span className="menu-icon">📋</span>
                  <span>My Orders</span>
                  {orders.length > 0 && <span className="menu-badge">{orders.length}</span>}
                </button>
                <button className={`menu-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
                  <span className="menu-icon">📍</span>
                  <span>Saved Addresses</span>
                </button>
                <button className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                  <span className="menu-icon">⚙️</span>
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="profile-main">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="info-card">
                  <h3>Personal Information</h3>
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="info-label">Full Name</span>
                      <span className="info-value">{user.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Email Address</span>
                      <span className="info-value">{user.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Phone Number</span>
                      <span className="info-value">{user.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Account Type</span>
                      <span className="info-value role-badge">{user.role === 'admin' ? 'Administrator' : user.role === 'kitchen' ? 'Kitchen Staff' : 'Customer'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Member Since</span>
                      <span className="info-value">{memberSince}</span>
                    </div>
                  </div>
                  <button className="edit-btn">Edit Profile →</button>
                </div>

                <div className="stats-card">
                  <h3>Activity Summary</h3>
                  <div className="stats-grid">
                    <div className="stat-block">
                      <span className="stat-number">{totalOrders}</span>
                      <span className="stat-text">Total Orders</span>
                    </div>
                    <div className="stat-block">
                      <span className="stat-number">₹{totalSpent.toLocaleString()}</span>
                      <span className="stat-text">Total Spent</span>
                    </div>
                    <div className="stat-block">
                      <span className="stat-number">{(totalSpent / totalOrders || 0).toFixed(2)}</span>
                      <span className="stat-text">Avg Order Value</span>
                    </div>
                    <div className="stat-block">
                      <span className="stat-number">{orders.filter(o => o.order_status === 'delivered').length}</span>
                      <span className="stat-text">Completed Orders</span>
                    </div>
                  </div>
                </div>

                <div className="quick-actions-card">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <button className="action-btn" onClick={() => navigate('/menu')}>
                      <span>🍽️</span> Browse Menu
                    </button>
                    <button className="action-btn" onClick={() => navigate('/cart')}>
                      <span>🛒</span> View Cart
                    </button>
                    <button className="action-btn" onClick={() => navigate('/offers')}>
                      <span>🎉</span> View Offers
                    </button>
                    <button className="action-btn" onClick={() => navigate('/contact')}>
                      <span>📞</span> Contact Support
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* My Orders Tab */}
            {activeTab === 'orders' && (
              <div className="orders-tab">
                <h3>Order History</h3>
                {orders.length === 0 ? (
                  <div className="empty-orders">
                    <div className="empty-icon">📦</div>
                    <p>You haven't placed any orders yet</p>
                    <button className="browse-btn" onClick={() => navigate('/menu')}>Browse Menu</button>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map(order => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div className="order-info">
                            <span className="order-number">#{order.order_number}</span>
                            <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <span className={`order-status-badge ${order.order_status}`}>
                            {order.order_status === 'delivered' ? '✅ Delivered' : 
                             order.order_status === 'preparing' ? '🟠 Preparing' :
                             order.order_status === 'ready' ? '🟢 Ready' : '🟡 Processing'}
                          </span>
                        </div>
                        <div className="order-items">
                          {order.items_summary ? (
                            <p>{order.items_summary}</p>
                          ) : (
                            <p>{order.item_count || 0} items</p>
                          )}
                        </div>
                        <div className="order-footer">
                          <span className="order-total">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                          <div className="order-actions">
                            <button className="track-btn" onClick={() => navigate(`/track/${order.order_number}`)}>
                              Track Order
                            </button>
                            <button className="reorder-btn" onClick={() => {
                              if (order.items_summary) {
                                alert('Reorder feature coming soon!');
                              }
                            }}>
                              Reorder
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="addresses-tab">
                <h3>Saved Addresses</h3>
                <div className="address-card">
                  <div className="address-header">
                    <span className="address-icon">🏠</span>
                    <h4>Home</h4>
                  </div>
                  <p>123 Food Street, Bangalore - 560001</p>
                  <p>Phone: {user.phone}</p>
                  <div className="address-actions">
                    <button className="edit-address-btn">Edit</button>
                    <button className="delete-address-btn">Delete</button>
                  </div>
                </div>
                <button className="add-address-btn">+ Add New Address</button>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="settings-tab">
                <h3>Account Settings</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-icon">🔔</span>
                      <div>
                        <h4>Email Notifications</h4>
                        <p>Receive order updates and promotions</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-icon">📱</span>
                      <div>
                        <h4>SMS Alerts</h4>
                        <p>Get order status updates via SMS</p>
                      </div>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-icon">🔒</span>
                      <div>
                        <h4>Change Password</h4>
                        <p>Update your password for security</p>
                      </div>
                    </div>
                    <button className="change-password-btn">Change</button>
                  </div>

                  <div className="setting-item">
                    <div className="setting-info">
                      <span className="setting-icon">🗑️</span>
                      <div>
                        <h4>Delete Account</h4>
                        <p>Permanently delete your account and data</p>
                      </div>
                    </div>
                    <button className="delete-account-btn">Delete</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;