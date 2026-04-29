// src/components/restaurant_side/admin_dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../../utils/api';
import './Dashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Stats State
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalMenuItems: 0,
    totalStaff: 0,
  });
  
  // Data States
  const [liveOrders, setLiveOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Report States
  const [reportRange, setReportRange] = useState('today');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const restaurantId = localStorage.getItem('restaurantId');
  const categories = ['all', ...new Set(menuItems.map(item => item?.category).filter(Boolean))];

  useEffect(() => {
    if (!restaurantId) {
      navigate('/restaurant-login');
      return;
    }
    loadAllData();
  }, [restaurantId]);

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardData(),
      fetchLiveOrders(),
      fetchOrderHistory(),
      fetchMenuItems(),
      fetchStaffList()
    ]);
    setLoading(false);
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
      
      const pending = ordersData?.recentOrders?.filter(o => o.status === 'pending').length || 0;
      const preparing = ordersData?.recentOrders?.filter(o => o.status === 'preparing').length || 0;
      const ready = ordersData?.recentOrders?.filter(o => o.status === 'ready').length || 0;
      const completed = ordersData?.recentOrders?.filter(o => o.status === 'completed').length || 0;
      
      setStats({
        todayOrders: ordersData?.todayCount || 0,
        pendingOrders: pending,
        preparingOrders: preparing,
        readyOrders: ready,
        completedOrders: completed,
        totalRevenue: ordersData?.todayRevenue || 0,
        totalMenuItems: menuData?.count || 0,
        totalStaff: staffData?.count || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchLiveOrders = async () => {
    try {
      const orders = await apiGet(`/orders/restaurant/${restaurantId}/live`);
      setLiveOrders(Array.isArray(orders) ? orders : []);
    } catch (error) {
      console.error('Error fetching live orders:', error);
      setLiveOrders([]);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const orders = await apiGet(`/orders/restaurant/${restaurantId}/all`);
      setOrderHistory(Array.isArray(orders) ? orders : []);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setOrderHistory([]);
    }
  };

  // ✅ FIXED: fetchMenuItems with proper array handling
  const fetchMenuItems = async () => {
    try {
      const response = await apiGet(`/menu/restaurant/${restaurantId}`);
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

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiPost(`/orders/${orderId}/status`, { status: newStatus });
      await Promise.all([fetchDashboardData(), fetchLiveOrders(), fetchOrderHistory()]);
      if (selectedOrder && selectedOrder.id === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const order = await apiGet(`/orders/${orderId}`);
      setSelectedOrder(order);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  // Report Functions
  const getReportDateRangeText = () => {
    if (reportRange === 'today') return new Date().toLocaleDateString();
    if (reportRange === 'week') return 'Last 7 Days';
    if (reportRange === 'month') return 'Last 30 Days';
    return `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
  };

  const generateReport = async () => {
    setLoadingReport(true);
    try {
      let url = `/orders/report/${restaurantId}?range=${reportRange}`;
      if (reportRange === 'custom') {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      const data = await apiGet(url);
      if (data && data.success) {
        setReportData(data);
        setReportGenerated(true);
      } else {
        alert('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    } finally {
      setLoadingReport(false);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;
    const reportJSON = {
      generatedOn: new Date().toISOString(),
      period: getReportDateRangeText(),
      ...reportData
    };
    const dataStr = JSON.stringify(reportJSON, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `sales_report_${Date.now()}.json`);
    link.click();
  };

  const getFilteredMenuItems = () => {
    let filtered = menuItems;
    if (searchTerm) {
      filtered = filtered.filter(item => item?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item?.category === categoryFilter);
    }
    return filtered;
  };

  const getFilteredOrderHistory = () => {
    if (statusFilter === 'all') return orderHistory;
    return orderHistory.filter(order => order?.status === statusFilter);
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      case 'completed': return 'status-completed';
      default: return '';
    }
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
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <button className="sidebar-back-btn" onClick={handleBack}>←</button>
          <div className="sidebar-logo">🍽️ QRONOS</div>
          <div className="sidebar-role">👨‍💼 Admin</div>
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
          <button className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <span className="nav-icon">📈</span> Reports
          </button>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="header-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <span className="access-badge">⚠️ Limited Access - Orders & Menu Only</span>
          </div>
          <button className="refresh-btn" onClick={refreshData} disabled={refreshing}>
            <span>🔄</span> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-info"><h3>{stats.todayOrders}</h3><p>Today's Orders</p></div></div>
              <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-info"><h3>₹{stats.totalRevenue.toLocaleString()}</h3><p>Today's Revenue</p></div></div>
              <div className="stat-card"><div className="stat-icon">⏳</div><div className="stat-info"><h3>{stats.pendingOrders}</h3><p>Pending</p></div></div>
              <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-info"><h3>{stats.readyOrders}</h3><p>Ready for Pickup</p></div></div>
            </div>
            <div className="quick-summary">
              <h3>📊 Order Status Distribution</h3>
              {stats.todayOrders > 0 ? (
                <>
                  <div className="status-bars">
                    {stats.pendingOrders > 0 && (
                      <div className="status-bar pending-bar" style={{ width: `${(stats.pendingOrders / stats.todayOrders) * 100}%` }}>
                        {stats.pendingOrders}
                      </div>
                    )}
                    {stats.preparingOrders > 0 && (
                      <div className="status-bar preparing-bar" style={{ width: `${(stats.preparingOrders / stats.todayOrders) * 100}%` }}>
                        {stats.preparingOrders}
                      </div>
                    )}
                    {stats.readyOrders > 0 && (
                      <div className="status-bar ready-bar" style={{ width: `${(stats.readyOrders / stats.todayOrders) * 100}%` }}>
                        {stats.readyOrders}
                      </div>
                    )}
                    {stats.completedOrders > 0 && (
                      <div className="status-bar completed-bar" style={{ width: `${(stats.completedOrders / stats.todayOrders) * 100}%` }}>
                        {stats.completedOrders}
                      </div>
                    )}
                  </div>
                  <div className="status-legend">
                    <span className="status-legend-item"><span className="status-legend-dot" style={{ background: '#f59e0b' }}></span>Pending ({stats.pendingOrders})</span>
                    <span className="status-legend-item"><span className="status-legend-dot" style={{ background: '#3b82f6' }}></span>Preparing ({stats.preparingOrders})</span>
                    <span className="status-legend-item"><span className="status-legend-dot" style={{ background: '#10b981' }}></span>Ready ({stats.readyOrders})</span>
                    <span className="status-legend-item"><span className="status-legend-dot" style={{ background: '#6b7280' }}></span>Completed ({stats.completedOrders})</span>
                  </div>
                </>
              ) : (
                <div className="status-bars empty"></div>
              )}
            </div>
          </>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <>
            <div className="recent-orders">
              <div className="section-header"><h2>🟢 Live Orders</h2></div>
              <div className="orders-table-container">
                <table className="orders-table">
                  <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Time</th><th>Action</th></tr></thead>
                  <tbody>
                    {liveOrders.length === 0 ? (
                      <tr><td colSpan="6" style={{ textAlign: 'center' }}>No live orders</td></tr>
                    ) : (
                      liveOrders.map(order => (
                        <tr key={order.id}>
                          <td>#{order.order_number}</td>
                          <td>{order.customer_name}</td>
                          <td>₹{order.total_amount}</td>
                          <td><span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span></td>
                          <td>{new Date(order.created_at).toLocaleTimeString()}</td>
                          <td>
                            <button className="view-order-btn" onClick={() => fetchOrderDetails(order.id)}>View</button>
                            <select className="status-select-small" value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}>
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

            <div className="recent-orders" style={{ marginTop: '30px' }}>
              <div className="section-header">
                <h2>📜 Order History</h2>
                <select className="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="orders-table-container">
                <table className="orders-table">
                  <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                  <tbody>
                    {getFilteredOrderHistory().map(order => (
                      <tr key={order.id}>
                        <td>#{order.order_number}</td>
                        <td>{order.customer_name}</td>
                        <td>₹{order.total_amount}</td>
                        <td><span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span></td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td><button className="view-order-btn" onClick={() => fetchOrderDetails(order.id)}>View Details</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* MENU TAB - FIXED */}
        {activeTab === 'menu' && (
          <div className="recent-orders">
            <div className="section-header"><h2>🍽️ Menu Items</h2><span className="readonly-badge">Read Only</span></div>
            <div className="menu-filters">
              <input type="text" className="search-input" placeholder="🔍 Search menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <select className="category-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
              </select>
            </div>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Status</th></tr></thead>
                <tbody>
                  {getFilteredMenuItems().length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign: 'center'}}>No menu items found</td></tr>
                  ) : (
                    getFilteredMenuItems().map(item => (
                      <tr key={item.id}>
                        <td>{item.id}</td>
                        <td><strong>{item.name}</strong><br/><small>{item.description?.substring(0, 50)}</small></td>
                        <td>₹{parseFloat(item.price).toFixed(2)}</td>
                        <td>{item.category || '-'}</td>
                        <td><span className={`status-badge ${item.is_available ? 'available' : 'unavailable'}`}>{item.is_available ? 'Available' : 'Unavailable'}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="menu-note"><p>📝 Menu management is available for Owner only. Contact restaurant owner to make changes.</p></div>
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === 'staff' && (
          <div className="recent-orders">
            <div className="section-header"><h2>👥 Staff Members</h2><span className="readonly-badge">Read Only</span></div>
            <div className="orders-table-container">
              <table className="orders-table">
                <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th></tr></thead>
                <tbody>
                  {staffList.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign: 'center'}}>No staff members found</td></tr>
                  ) : (
                    staffList.map(staff => (
                      <tr key={staff.id}>
                        <td>{staff.id}</td>
                        <td>{staff.name}</td>
                        <td>{staff.email}</td>
                        <td>{staff.phone || '-'}</td>
                        <td><span className="role-badge">{staff.role === 'admin' ? '👨‍💼 Admin' : '👨‍🍳 Kitchen'}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="menu-note"><p>👥 Staff management is available for Owner only. Contact owner to add or remove staff.</p></div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="reports-container">
            <div className="recent-orders">
              <div className="section-header"><h2>📊 Report Generator</h2></div>
              <div className="report-controls">
                <div className="date-range-selector">
                  <button className={`date-range-btn ${reportRange === 'today' ? 'active' : ''}`} onClick={() => setReportRange('today')}>Today</button>
                  <button className={`date-range-btn ${reportRange === 'week' ? 'active' : ''}`} onClick={() => setReportRange('week')}>Last 7 Days</button>
                  <button className={`date-range-btn ${reportRange === 'month' ? 'active' : ''}`} onClick={() => setReportRange('month')}>Last 30 Days</button>
                  <button className={`date-range-btn ${reportRange === 'custom' ? 'active' : ''}`} onClick={() => setReportRange('custom')}>Custom</button>
                </div>
                {reportRange === 'custom' && (
                  <div className="custom-date-range">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input" />
                    <span>to</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" />
                  </div>
                )}
                <div className="report-actions">
                  <button className="generate-report-btn" onClick={generateReport} disabled={loadingReport}>
                    {loadingReport ? 'Generating...' : 'Generate Report'}
                  </button>
                  <button className="download-report-btn" onClick={downloadReport} disabled={!reportGenerated}>📥 Download Report</button>
                </div>
              </div>
            </div>

            {reportGenerated && reportData && (
              <div className="report-preview">
                <div className="report-header">
                  <div className="report-title">
                    <h2>QRONOS - Sales Report</h2>
                    <p>Generated on: {new Date().toLocaleString()}</p>
                    <p>Period: {getReportDateRangeText()}</p>
                  </div>
                  <div className="report-logo">🍽️ QRONOS</div>
                </div>

                <div className="report-summary">
                  <div className="report-card"><div className="report-icon">📋</div><div className="report-info"><h4>Total Orders</h4><p>{reportData.summary?.totalOrders || 0}</p></div></div>
                  <div className="report-card"><div className="report-icon">💰</div><div className="report-info"><h4>Total Revenue</h4><p>₹{(reportData.summary?.totalRevenue || 0).toLocaleString()}</p></div></div>
                  <div className="report-card"><div className="report-icon">📊</div><div className="report-info"><h4>Avg Order Value</h4><p>₹{reportData.summary?.avgOrderValue || 0}</p></div></div>
                  <div className="report-card"><div className="report-icon">✅</div><div className="report-info"><h4>Completed Orders</h4><p>{reportData.summary?.completedOrders || 0}</p></div></div>
                </div>

                {reportData.categoryBreakdown && reportData.categoryBreakdown.length > 0 && (
                  <div className="report-section">
                    <h3>📊 Category-wise Sales Breakdown</h3>
                    {reportData.categoryBreakdown.map((cat, idx) => (
                      <div key={idx} className="category-row">
                        <div className="category-name">{cat.category}</div>
                        <div className="category-bar-wrapper">
                          <div className="category-bar" style={{ width: `${cat.percentage}%` }}></div>
                        </div>
                        <div className="category-stats">₹{cat.revenue.toLocaleString()} ({cat.count} items)</div>
                      </div>
                    ))}
                  </div>
                )}

                {reportData.topItems && reportData.topItems.length > 0 && (
                  <div className="report-section">
                    <h3>🏆 Top Selling Items</h3>
                    {reportData.topItems.map((item, idx) => (
                      <div key={idx} className="top-item-row">
                        <div className="top-rank">#{idx + 1}</div>
                        <div className="top-name">{item.name}</div>
                        <div className="top-quantity">{item.quantity} sold</div>
                        <div className="top-revenue">₹{item.revenue.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="report-section">
                  <h3>📋 Order Details</h3>
                  <div className="orders-table-container">
                    <table className="orders-table">
                      <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                      <tbody>
                        {reportData.orders?.slice(0, 10).map(order => (
                          <tr key={order.id}>
                            <td>#{order.order_number}</td>
                            <td>{order.customer_name}</td>
                            <td>₹{order.total_amount}</td>
                            <td><span className={`status-badge ${getStatusClass(order.status)}`}>{order.status}</span></td>
                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3>Order Details - #{selectedOrder.orderNumber}</h3><button className="modal-close" onClick={() => setShowOrderModal(false)}>×</button></div>
            <div className="modal-body">
              <div className="order-info">
                <div className="info-row"><strong>Customer:</strong> {selectedOrder.customerName}</div>
                <div className="info-row"><strong>Phone:</strong> {selectedOrder.customerPhone}</div>
                <div className="info-row"><strong>Order Type:</strong> {selectedOrder.orderType}</div>
                <div className="info-row"><strong>Status:</strong>
                  <select className="status-select-modal" value={selectedOrder.orderStatus} onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="info-row"><strong>Date:</strong> {new Date(selectedOrder.orderDate).toLocaleString()}</div>
              </div>
              <div className="order-items-list">
                <h4>Items Ordered</h4>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="order-item-detail">
                    <span>{item.quantity}x</span>
                    <span>{item.name}</span>
                    <span>₹{item.price}</span>
                    <span>₹{item.subtotal}</span>
                  </div>
                ))}
                <div className="order-total-detail"><strong>Total: ₹{selectedOrder.total}</strong></div>
              </div>
            </div>
            <div className="modal-footer"><button className="btn-cancel" onClick={() => setShowOrderModal(false)}>Close</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;