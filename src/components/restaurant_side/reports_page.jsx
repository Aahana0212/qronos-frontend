import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReportsPage.css';

const ReportsPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [dateRange, setDateRange] = useState('week');
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('qronos_orders') || '[]');
    setOrders(savedOrders);
    filterOrders(savedOrders, dateRange);
  }, []);

  const filterOrders = (orderList, range) => {
    const now = new Date();
    let filtered = orderList;
    if (range === 'today') filtered = orderList.filter(o => new Date(o.orderDate).toDateString() === now.toDateString());
    if (range === 'week') { const weekAgo = new Date(now.setDate(now.getDate() - 7)); filtered = orderList.filter(o => new Date(o.orderDate) >= weekAgo); }
    if (range === 'month') { const monthAgo = new Date(now.setMonth(now.getMonth() - 1)); filtered = orderList.filter(o => new Date(o.orderDate) >= monthAgo); }
    setFilteredOrders(filtered);
  };

  const handleRangeChange = (range) => { setDateRange(range); filterOrders(orders, range); };

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  const itemsCount = {};
  filteredOrders.forEach(order => { order.items?.forEach(item => { itemsCount[item.name] = (itemsCount[item.name] || 0) + item.quantity; }); });
  const popularItems = Object.entries(itemsCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="reports-page-root reports-container">
      <div className="reports-header"><button className="back-btn" onClick={() => navigate('/owner-dashboard')}>← Dashboard</button><h1>Sales Reports</h1></div>
      <div className="date-filters"><button className={`filter-btn ${dateRange === 'today' ? 'active' : ''}`} onClick={() => handleRangeChange('today')}>Today</button><button className={`filter-btn ${dateRange === 'week' ? 'active' : ''}`} onClick={() => handleRangeChange('week')}>This Week</button><button className={`filter-btn ${dateRange === 'month' ? 'active' : ''}`} onClick={() => handleRangeChange('month')}>This Month</button><button className={`filter-btn ${dateRange === 'all' ? 'active' : ''}`} onClick={() => handleRangeChange('all')}>All Time</button></div>
      <div className="stats-grid"><div className="stat-card gold"><h3>Total Revenue</h3><p>₹{totalRevenue.toFixed(2)}</p></div><div className="stat-card"><h3>Total Orders</h3><p>{totalOrders}</p></div><div className="stat-card"><h3>Avg Order Value</h3><p>₹{avgOrderValue.toFixed(2)}</p></div></div>
      <div className="reports-grid"><div className="popular-items"><h3>🔥 Most Popular Items</h3>{popularItems.map(([name, count]) => (<div key={name} className="popular-item"><span>{name}</span><span>{count} sold</span></div>))}</div><div className="recent-orders"><h3>📋 Recent Orders</h3>{filteredOrders.slice(0, 10).map(order => (<div key={order.orderId} className="recent-order"><span>#{order.orderId}</span><span>₹{order.total?.toFixed(2)}</span><span>{new Date(order.orderDate).toLocaleDateString()}</span><span className={`status-small ${order.status}`}>{order.status}</span></div>))}</div></div>
    </div>
  );
};
export default ReportsPage;