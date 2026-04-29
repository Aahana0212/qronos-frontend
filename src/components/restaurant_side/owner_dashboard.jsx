import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import './Dashboard.css';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  
  // Stats State
  const [stats, setStats] = useState({
    todayOrders: 0,
    newOrders: 0,
    readyOrders: 0,
    totalRevenue: 0,
    totalMenuItems: 0,
    totalStaff: 0,
  });
  
  // Data States
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [staffList, setStaffList] = useState([]);
  
  // Modal States
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // QR Code States
  const [qrTableNumber, setQrTableNumber] = useState(1);
  const [generatedQR, setGeneratedQR] = useState(null);
  
  // Form States
  const [menuForm, setMenuForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    is_available: 1
  });
  
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'kitchen'
  });

  // Get restaurantId from localStorage
  const restaurantId = localStorage.getItem('restaurantId');
  const token = localStorage.getItem('qronos_token');

  useEffect(() => {
    if (!restaurantId || !token) {
      navigate('/restaurant-login');
      return;
    }
    loadAllData();
  }, [restaurantId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardData(),
        fetchMenuItems(),
        fetchAllOrders(),
        fetchStaffList()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const fetchDashboardData = async () => {
    try {
      const ordersData = await apiGet(`/orders/restaurant/${restaurantId}/today`);
      const menuData = await apiGet(`/menu/restaurant/${restaurantId}/count`);
      const staffData = await apiGet(`/auth/staff/restaurant/${restaurantId}/count`);
      
      setStats({
        todayOrders: ordersData?.todayCount || 0,
        newOrders: ordersData?.pendingCount || 0,
        readyOrders: ordersData?.readyCount || 0,
        totalRevenue: ordersData?.todayRevenue || 0,
        totalMenuItems: menuData?.count || 0,
        totalStaff: staffData?.count || 0,
      });
      setRecentOrders(ordersData?.recentOrders || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setStats({
        todayOrders: 0,
        newOrders: 0,
        readyOrders: 0,
        totalRevenue: 0,
        totalMenuItems: 0,
        totalStaff: 0,
      });
    }
  };

  // ✅ FIXED: fetchMenuItems with proper array handling
  const fetchMenuItems = async () => {
    try {
      const response = await apiGet(`/menu/restaurant/${restaurantId}`);
      console.log('Menu API Response:', response);
      
      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response && response.menuItems) {
        items = response.menuItems;
      } else if (response && response.items) {
        items = response.items;
      } else if (response && response.data) {
        items = response.data;
      } else {
        items = [];
      }
      
      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenuItems([]);
    }
  };

  // ✅ FIXED: fetchStaffList with proper array handling
  const fetchStaffList = async () => {
    try {
      const response = await apiGet(`/auth/staff/restaurant/${restaurantId}`);
      console.log('Staff API Response:', response);
      
      let staff = [];
      if (Array.isArray(response)) {
        staff = response;
      } else if (response && response.staff) {
        staff = response.staff;
      } else if (response && response.data) {
        staff = response.data;
      } else {
        staff = [];
      }
      
      setStaffList(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffList([]);
    }
  };

  // ✅ FIXED: fetchAllOrders with proper array handling
  const fetchAllOrders = async () => {
    try {
      const response = await apiGet(`/orders/restaurant/${restaurantId}/all`);
      console.log('Orders API Response:', response);
      
      let orders = [];
      if (Array.isArray(response)) {
        orders = response;
      } else if (response && response.orders) {
        orders = response.orders;
      } else if (response && response.data) {
        orders = response.data;
      } else {
        orders = [];
      }
      
      setAllOrders(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setAllOrders([]);
    }
  };

  const handleAddMenuItem = async () => {
    if (!menuForm.name || !menuForm.price) {
      alert('Name and price are required');
      return;
    }
    try {
      await apiPost('/menu', { 
        ...menuForm, 
        price: parseFloat(menuForm.price),
        restaurant_id: parseInt(restaurantId) 
      });
      setShowMenuModal(false);
      setMenuForm({ name: '', price: '', category: '', description: '', is_available: 1 });
      await fetchMenuItems();
      await fetchDashboardData();
      alert('✅ Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error);
      alert(error.message || 'Failed to add item');
    }
  };

  const handleEditMenuItem = (item) => {
    setEditingItem(item);
    setMenuForm({
      name: item.name,
      price: item.price,
      category: item.category || '',
      description: item.description || '',
      is_available: item.is_available
    });
    setShowMenuModal(true);
  };

  const handleUpdateMenuItem = async () => {
    try {
      await apiPut(`/menu/${editingItem.id}`, menuForm);
      setShowMenuModal(false);
      setEditingItem(null);
      await fetchMenuItems();
      alert('✅ Item updated successfully!');
    } catch (error) {
      console.error('Error updating item:', error);
      alert(error.message || 'Failed to update item');
    }
  };

  const handleDeleteMenuItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await apiDelete(`/menu/${id}`);
        await fetchMenuItems();
        await fetchDashboardData();
        alert('✅ Item deleted successfully!');
      } catch (error) {
        console.error('Error deleting item:', error);
        alert(error.message || 'Failed to delete item');
      }
    }
  };

  const handleAddStaff = async () => {
    if (!staffForm.name || !staffForm.email || !staffForm.password) {
      alert('Name, email and password are required');
      return;
    }
    if (staffForm.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      await apiPost('/auth/staff', { 
        name: staffForm.name,
        email: staffForm.email,
        phone: staffForm.phone,
        password: staffForm.password,
        role: staffForm.role,
        restaurant_id: parseInt(restaurantId)
      });
      setShowStaffModal(false);
      setStaffForm({ name: '', email: '', phone: '', password: '', role: 'kitchen' });
      await fetchStaffList();
      alert('✅ Staff added successfully!');
    } catch (error) {
      console.error('Error adding staff:', error);
      alert(error.message || 'Failed to add staff');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm('Are you sure you want to remove this staff member?')) {
      try {
        await apiDelete(`/auth/users/${id}`);
        await fetchStaffList();
        alert('✅ Staff removed successfully!');
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert(error.message || 'Failed to remove staff');
      }
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiPost(`/orders/${orderId}/status`, { status: newStatus });
      await Promise.all([fetchDashboardData(), fetchAllOrders()]);
      alert('✅ Order status updated!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert(error.message || 'Failed to update order status');
    }
  };

  // QR Code Functions
  const generateQRCode = () => {
    const baseUrl = window.location.origin;
    const qrData = `${baseUrl}/menu?restaurantId=${restaurantId}&table=${qrTableNumber}`;
    setGeneratedQR(qrData);
  };

  const downloadQR = () => {
    if (!generatedQR) return;
    const canvas = document.getElementById('qr-canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `table_${qrTableNumber}_qr.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const printQR = () => {
    if (!generatedQR) return;
    const canvas = document.getElementById('qr-canvas');
    if (canvas) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head><title>QR Code - Table ${qrTableNumber}</title></head>
          <body style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; background:white">
            <img src="${canvas.toDataURL()}" />
            <h3>Table ${qrTableNumber} QR Code</h3>
            <p>Scan to order from Table ${qrTableNumber}</p>
          </body>
        </html>
      `);
      printWindow.print();
    }
  };

  const exportReport = () => {
    alert('Export report feature coming soon!');
  };

  const saveSettings = async () => {
    alert('Settings feature coming soon with API integration!');
  };

  const handleLogout = () => {
    localStorage.removeItem('qronos_token');
    localStorage.removeItem('qronos_user');
    localStorage.removeItem('restaurantId');
    navigate('/restaurant-login');
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
        <button className="back-btn-dashboard" onClick={handleBack}>← Back</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <button className="sidebar-back-btn" onClick={handleBack} title="Back to Home">←</button>
          <div className="sidebar-logo">🍽️ QRONOS</div>
          <div className="sidebar-role">👑 Owner</div>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <span className="nav-icon">📊</span> Overview
          </button>
          <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <span className="nav-icon">📋</span> Orders
          </button>
          <button className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`} onClick={() => setActiveTab('menu')}>
            <span className="nav-icon">🍽️</span> Menu
          </button>
          <button className={`nav-item ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>
            <span className="nav-icon">👥</span> Staff
          </button>
          <button className={`nav-item ${activeTab === 'qr' ? 'active' : ''}`} onClick={() => setActiveTab('qr')}>
            <span className="nav-icon">📱</span> QR Codes
          </button>
          <button className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <span className="nav-icon">📈</span> Analytics
          </button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <span className="nav-icon">⚙️</span> Settings
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Owner Dashboard</h1>
            <p className="header-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button className="refresh-btn" onClick={refreshData} disabled={refreshing}>
            <span className="refresh-icon">🔄</span> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-info"><h3>{stats.todayOrders}</h3><p>Today's Orders</p></div></div>
              <div className="stat-card"><div className="stat-icon">🆕</div><div className="stat-info"><h3>{stats.newOrders}</h3><p>New Orders</p></div></div>
              <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-info"><h3>{stats.readyOrders}</h3><p>Ready for Pickup</p></div></div>
              <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-info"><h3>₹{stats.totalRevenue.toLocaleString()}</h3><p>Today's Revenue</p></div></div>
              <div className="stat-card"><div className="stat-icon">🍽️</div><div className="stat-info"><h3>{stats.totalMenuItems}</h3><p>Menu Items</p></div></div>
              <div className="stat-card"><div className="stat-icon">👥</div><div className="stat-info"><h3>{stats.totalStaff}</h3><p>Staff Members</p></div></div>
            </div>
            <div className="recent-orders">
              <div className="section-header"><h2>Recent Orders</h2><button className="view-all-btn" onClick={() => setActiveTab('orders')}>View All →</button></div>
              <div className="orders-table-container">
                <table className="orders-table">
                  <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr><td colSpan="6" style={{textAlign: 'center'}}>No orders yet</td></tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.order_number}</td>
                          <td>{order.customer_name}</td>
                          <td>₹{order.total_amount}</td>
                          <td><span className={`status-badge ${order.order_status || order.status}`}>{order.order_status || order.status}</span></td>
                          <td>{new Date(order.created_at).toLocaleTimeString()}</td>
                          <td>
                            <select className="status-select" value={order.order_status || order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}>
                              <option value="pending">Pending</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="recent-orders">
            <div className="section-header"><h2>All Orders</h2></div>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
                <tbody>
                  {allOrders.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign: 'center'}}>No orders found</td></tr>
                  ) : (
                    allOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.order_number}</td>
                        <td>{order.customer_name}</td>
                        <td>₹{order.total_amount}</td>
                        <td><span className={`status-badge ${order.order_status || order.status}`}>{order.order_status || order.status}</span></td>
                        <td>{new Date(order.created_at).toLocaleTimeString()}</td>
                        <td>
                          <select className="status-select" value={order.order_status || order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}>
                            <option value="pending">Pending</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div className="recent-orders">
            <div className="section-header">
              <h2>🍽️ Menu Management</h2>
              <button className="add-btn" onClick={() => { setEditingItem(null); setMenuForm({ name: '', price: '', category: '', description: '', is_available: 1 }); setShowMenuModal(true); }}>+ Add Item</button>
            </div>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {menuItems.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign: 'center'}}>No menu items. Click "Add Item" to create one.</td></tr>
                  ) : (
                    menuItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td><strong>{item.name}</strong><br/><small>{item.description?.substring(0, 50)}</small></td>
                        <td>₹{parseFloat(item.price).toFixed(2)}</td>
                        <td>{item.category || '-'}</td>
                        <td><span className={`status-badge ${item.is_available ? 'available' : 'unavailable'}`}>{item.is_available ? 'Available' : 'Unavailable'}</span></td>
                        <td><button className="action-edit" onClick={() => handleEditMenuItem(item)}>✏️</button><button className="action-delete" onClick={() => handleDeleteMenuItem(item.id)}>🗑️</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === 'staff' && (
          <div className="recent-orders">
            <div className="section-header">
              <h2>👥 Staff Management</h2>
              <button className="add-btn" onClick={() => { setStaffForm({ name: '', email: '', phone: '', password: '', role: 'kitchen' }); setShowStaffModal(true); }}>+ Add Staff</button>
            </div>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {staffList.length === 0 ? (
                    <tr><td colSpan="6" style={{textAlign: 'center'}}>No staff members. Click "Add Staff" to add one.</td></tr>
                  ) : (
                    staffList.map((staff) => (
                      <tr key={staff.id}>
                        <td>{staff.id}</td>
                        <td>{staff.name}</td>
                        <td>{staff.email}</td>
                        <td>{staff.phone || '-'}</td>
                        <td><span className="role-badge">{staff.role === 'admin' ? '👨‍💼 Admin' : '👨‍🍳 Kitchen'}</span></td>
                        <td><button className="action-delete" onClick={() => handleDeleteStaff(staff.id)}>🗑️ Remove</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* QR CODES TAB */}
        {activeTab === 'qr' && (
          <div className="recent-orders">
            <div className="section-header"><h2>📱 QR Code Generator</h2></div>
            <div className="qr-generator">
              <div className="qr-form">
                <div className="form-group">
                  <label>Select Table Number</label>
                  <select value={qrTableNumber} onChange={(e) => setQrTableNumber(parseInt(e.target.value))} className="qr-select">
                    {[...Array(20)].map((_, i) => (<option key={i+1} value={i+1}>Table {i+1}</option>))}
                  </select>
                </div>
                <button className="generate-qr-btn" onClick={generateQRCode}>Generate QR Code</button>
              </div>
              {generatedQR && (
                <div className="qr-preview">
                  <h3>QR Code for Table {qrTableNumber}</h3>
                  <div className="qr-code-container">
                    <QRCode id="qr-canvas" value={generatedQR} size={200} bgColor="#ffffff" fgColor="#000000" level="H" includeMargin={true} />
                  </div>
                  <div className="qr-info">
                    <p><strong>Scan this QR code to order from Table {qrTableNumber}</strong></p>
                    <p className="qr-url">{generatedQR}</p>
                  </div>
                  <div className="qr-actions">
                    <button className="download-qr-btn" onClick={downloadQR}>📥 Download PNG</button>
                    <button className="print-qr-btn" onClick={printQR}>🖨️ Print QR Code</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="recent-orders">
            <div className="section-header"><h2>📊 Sales Analytics</h2><button className="add-btn" onClick={exportReport}>Export Report</button></div>
            <div className="analytics-dashboard">
              <div className="stats-row">
                <div className="stat-box"><h3>Total Orders</h3><p className="stat-number">{stats.todayOrders}</p><span>Today</span></div>
                <div className="stat-box"><h3>Total Revenue</h3><p className="stat-number">₹{stats.totalRevenue.toLocaleString()}</p><span>Today</span></div>
                <div className="stat-box"><h3>Pending Orders</h3><p className="stat-number">{stats.newOrders}</p><span>Awaiting</span></div>
                <div className="stat-box"><h3>Menu Items</h3><p className="stat-number">{stats.totalMenuItems}</p><span>Total</span></div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="recent-orders">
            <div className="section-header"><h2>⚙️ Restaurant Settings</h2><button className="add-btn" onClick={saveSettings}>Save Changes</button></div>
            <div className="settings-panel">
              <div className="settings-section">
                <h3>🏪 Restaurant Information</h3>
                <div className="form-row">
                  <div className="form-group"><label>Restaurant Name</label><input type="text" id="restoName" placeholder="Pizza Hub" /></div>
                  <div className="form-group"><label>Slug</label><input type="text" id="restoSlug" placeholder="pizza-hub" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Phone</label><input type="tel" id="restoPhone" placeholder="+91 98765 43210" /></div>
                  <div className="form-group"><label>Email</label><input type="email" id="restoEmail" placeholder="contact@pizzahub.com" /></div>
                </div>
                <div className="form-group"><label>Address</label><textarea id="restoAddress" rows="2" placeholder="Restaurant address..."></textarea></div>
              </div>
              <div className="settings-section">
                <h3>⏰ Business Hours</h3>
                <div className="form-row">
                  <div className="form-group"><label>Opening Time</label><input type="time" id="openTime" /></div>
                  <div className="form-group"><label>Closing Time</label><input type="time" id="closeTime" /></div>
                </div>
              </div>
              <div className="settings-section">
                <h3>💰 Tax & Payment</h3>
                <div className="form-row">
                  <div className="form-group"><label>GST Rate (%)</label><input type="number" id="gstRate" placeholder="5" /></div>
                  <div className="form-group"><label>Service Charge (%)</label><input type="number" id="serviceCharge" placeholder="0" /></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Menu Modal */}
      {showMenuModal && (
        <div className="modal-overlay" onClick={() => setShowMenuModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? '✏️ Edit Menu Item' : '➕ Add Menu Item'}</h3>
              <button className="modal-close" onClick={() => setShowMenuModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Item Name *</label><input type="text" value={menuForm.name} onChange={(e) => setMenuForm({...menuForm, name: e.target.value})} placeholder="e.g., Margherita Pizza" /></div>
              <div className="form-row">
                <div className="form-group"><label>Price * (₹)</label><input type="number" value={menuForm.price} onChange={(e) => setMenuForm({...menuForm, price: e.target.value})} placeholder="299" /></div>
                <div className="form-group"><label>Category</label><select value={menuForm.category} onChange={(e) => setMenuForm({...menuForm, category: e.target.value})}>
                  <option value="">Select</option>
                  <option value="Pizza">🍕 Pizza</option>
                  <option value="Burger">🍔 Burger</option>
                  <option value="Starters">🍗 Starters</option>
                  <option value="Pasta">🍝 Pasta</option>
                  <option value="Beverages">🥤 Beverages</option>
                </select></div>
              </div>
              <div className="form-group"><label>Description</label><textarea value={menuForm.description} onChange={(e) => setMenuForm({...menuForm, description: e.target.value})} rows="3" placeholder="Item description..." /></div>
              <div className="form-group"><label className="checkbox-label"><input type="checkbox" checked={menuForm.is_available === 1} onChange={(e) => setMenuForm({...menuForm, is_available: e.target.checked ? 1 : 0})} /> Available for ordering</label></div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowMenuModal(false)}>Cancel</button>
              <button className="btn-save" onClick={editingItem ? handleUpdateMenuItem : handleAddMenuItem}>{editingItem ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="modal-overlay" onClick={() => setShowStaffModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add Staff Member</h3>
              <button className="modal-close" onClick={() => setShowStaffModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group"><label>Full Name *</label><input type="text" value={staffForm.name} onChange={(e) => setStaffForm({...staffForm, name: e.target.value})} placeholder="John Doe" /></div>
              <div className="form-group"><label>Email *</label><input type="email" value={staffForm.email} onChange={(e) => setStaffForm({...staffForm, email: e.target.value})} placeholder="staff@restaurant.com" /></div>
              <div className="form-group"><label>Phone</label><input type="tel" value={staffForm.phone} onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})} placeholder="9876543210" /></div>
              <div className="form-group"><label>Password *</label><input type="password" value={staffForm.password} onChange={(e) => setStaffForm({...staffForm, password: e.target.value})} placeholder="Min 6 characters" /></div>
              <div className="form-group"><label>Role</label><select value={staffForm.role} onChange={(e) => setStaffForm({...staffForm, role: e.target.value})}>
                <option value="kitchen">👨‍🍳 Kitchen Staff</option>
                <option value="admin">👨‍💼 Admin Staff</option>
              </select></div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowStaffModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleAddStaff}>Add Staff</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;