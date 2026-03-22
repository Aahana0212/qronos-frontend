import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0, todayOrders: 0, pendingOrders: 0,
    totalRevenue: 0, todayRevenue: 0, totalUsers: 0,
    kitchenStaff: 0, totalItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('qronos_user'));
    if (!user || user.role !== 'admin') {
      navigate('/menu');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersRes = await fetch('http://localhost:5000/api/orders');
      const ordersData = await ordersRes.json();
      setOrders(ordersData);

      const menuRes = await fetch('http://localhost:5000/api/menu/items');
      const menuData = await menuRes.json();
      setMenuItems(menuData);

      const usersRes = await fetch('http://localhost:5000/api/auth/users');
      const usersData = await usersRes.json();
      setUsers(usersData);

      const today = new Date().toISOString().split('T')[0];
      const todayOrders = ordersData.filter(o => o.created_at?.split('T')[0] === today);
      const todayRevenue = todayOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
      const pendingOrders = ordersData.filter(o => ['placed', 'confirmed', 'preparing'].includes(o.order_status));
      const kitchenStaffCount = usersData.filter(u => u.role === 'kitchen').length;

      setStats({
        totalOrders: ordersData.length,
        todayOrders: todayOrders.length,
        pendingOrders: pendingOrders.length,
        totalRevenue: ordersData.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0),
        todayRevenue: todayRevenue,
        totalUsers: usersData.length,
        kitchenStaff: kitchenStaffCount,
        totalItems: menuData.length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const toggleItemAvailability = async (itemId, currentStatus) => {
    try {
      await fetch(`http://localhost:5000/api/menu/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !currentStatus })
      });
      fetchData();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('qronos_token');
    localStorage.removeItem('qronos_user');
    navigate('/login');
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'placed': return '🟡';
      case 'confirmed': return '🔵';
      case 'preparing': return '🟠';
      case 'ready': return '🟢';
      case 'delivered': return '✅';
      default: return '⚪';
    }
  };

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>QRONOS</h2>
          <span className="admin-badge">Admin</span>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <span className="nav-icon">📋</span>
            <span>Orders</span>
            {stats.pendingOrders > 0 && <span className="badge">{stats.pendingOrders}</span>}
          </button>
          <button className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            <span className="nav-icon">🍽️</span>
            <span>Menu</span>
          </button>
          <button className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <span className="nav-icon">👥</span>
            <span>Users</span>
          </button>
          <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <span className="nav-icon">📈</span>
            <span>Reports</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-main-header">
          <h1>{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'orders' ? 'Orders' : activeTab === 'menu' ? 'Menu Management' : activeTab === 'users' ? 'Users' : 'Reports'}</h1>
          <div className="header-stats">
            <div className="header-stat">
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <h3>{stats.totalOrders}</h3>
                  <p>Total Orders</p>
                  <span className="stat-trend up">+{stats.todayOrders} today</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <h3>₹{stats.totalRevenue.toLocaleString()}</h3>
                  <p>Total Revenue</p>
                  <span className="stat-trend up">+₹{stats.todayRevenue.toLocaleString()} today</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{stats.pendingOrders}</h3>
                  <p>Pending Orders</p>
                  <span className="stat-trend warning">Need attention</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                  <span className="stat-trend">{stats.kitchenStaff} kitchen staff</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🍽️</div>
                <div className="stat-info">
                  <h3>{stats.totalItems}</h3>
                  <p>Menu Items</p>
                </div>
              </div>
            </div>

            {/* Recent Orders & Top Items */}
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Recent Orders</h3>
                  <button className="view-all" onClick={() => setActiveTab('orders')}>View all →</button>
                </div>
                <div className="recent-orders-list">
                  {orders.slice(0, 5).map(order => (
                    <div key={order.id} className="recent-order">
                      <span className="order-id">#{order.order_number}</span>
                      <span className="order-customer">{order.customer_name || 'Guest'}</span>
                      <span className="order-amount">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                      <span className={`order-status ${order.order_status}`}>{getStatusIcon(order.order_status)} {order.order_status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Top Selling Items</h3>
                </div>
                <div className="top-items-list">
                  <div className="top-item">
                    <span>1. Butter Chicken</span>
                    <span>45 orders</span>
                  </div>
                  <div className="top-item">
                    <span>2. Chicken Biryani</span>
                    <span>38 orders</span>
                  </div>
                  <div className="top-item">
                    <span>3. Paneer Tikka</span>
                    <span>32 orders</span>
                  </div>
                  <div className="top-item">
                    <span>4. Garlic Naan</span>
                    <span>28 orders</span>
                  </div>
                  <div className="top-item">
                    <span>5. Gulab Jamun</span>
                    <span>25 orders</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="orders-content">
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="order-id">#{order.order_number}</td>
                      <td>{order.customer_name || 'Guest'}</td>
                      <td>{order.items_summary?.split(',').length || 0} items</td>
                      <td className="amount">₹{parseFloat(order.total_amount).toFixed(2)}</td>
                      <td>
                        <select value={order.order_status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className={`status-select ${order.order_status}`}>
                          <option value="placed">🟡 Placed</option>
                          <option value="confirmed">🔵 Confirmed</option>
                          <option value="preparing">🟠 Preparing</option>
                          <option value="ready">🟢 Ready</option>
                          <option value="out_for_delivery">🛵 Out for Delivery</option>
                          <option value="delivered">✅ Delivered</option>
                        </select>
                      </td>
                      <td>{new Date(order.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="view-btn" onClick={() => navigate(`/track/${order.order_number}`)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="menu-content">
            <div className="menu-header-actions">
              <button className="add-item-btn">+ Add New Item</button>
            </div>
            <div className="menu-table-container">
              <table className="menu-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.slice(0, 20).map(item => (
                    <tr key={item.id}>
                      <td className="item-name">{item.name}</td>
                      <td>{item.category_name || 'Other'}</td>
                      <td className="price">₹{parseFloat(item.price).toFixed(2)}</td>
                      <td>
                        <button className={`status-toggle ${item.is_available ? 'available' : 'out'}`} onClick={() => toggleItemAvailability(item.id, item.is_available)}>
                          {item.is_available ? 'Available' : 'Out of Stock'}
                        </button>
                      </td>
                      <td>
                        <button className="edit-btn">✎</button>
                        <button className="delete-btn">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-content">
            <div className="users-header-actions">
              <button className="add-user-btn">+ Add Kitchen Staff</button>
            </div>
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'admin' ? '👑 Admin' : user.role === 'kitchen' ? '👨‍🍳 Kitchen' : '👤 Customer'}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        {user.role !== 'admin' && <button className="edit-btn">✎</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="reports-content">
            <div className="reports-grid">
              <div className="report-card">
                <div className="report-icon">📊</div>
                <h3>Sales Report</h3>
                <p>Total Revenue: ₹{stats.totalRevenue.toLocaleString()}</p>
                <p>Total Orders: {stats.totalOrders}</p>
                <button>Download Report →</button>
              </div>
              <div className="report-card">
                <div className="report-icon">🔥</div>
                <h3>Popular Items</h3>
                <p>Butter Chicken: 45 orders</p>
                <p>Chicken Biryani: 38 orders</p>
                <button>View Details →</button>
              </div>
              <div className="report-card">
                <div className="report-icon">👥</div>
                <h3>Customer Insights</h3>
                <p>Total Customers: {stats.totalUsers}</p>
                <p>Avg Order: ₹{(stats.totalRevenue / stats.totalOrders || 0).toFixed(2)}</p>
                <button>Analyze →</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;