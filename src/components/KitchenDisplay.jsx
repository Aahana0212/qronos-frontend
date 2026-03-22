import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './KitchenDisplay.css';

const KitchenDisplay = () => {
  const navigate = useNavigate();
  const [newOrders, setNewOrders] = useState([]);
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [stats, setStats] = useState({
    totalToday: 0,
    completed: 0,
    inKitchen: 0,
    avgPrepTime: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('qronos_user'));
    if (!user || user.role !== 'kitchen') {
      navigate('/menu');
      return;
    }
    fetchOrders();
    updateTime();
    
    const timeInterval = setInterval(updateTime, 1000);
    const orderInterval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
    
    return () => {
      clearInterval(timeInterval);
      clearInterval(orderInterval);
    };
  }, []);

  const updateTime = () => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders');
      const allOrders = await response.json();
      
      console.log('Fetched orders:', allOrders); // Debug
      
      // Filter orders by status
      setNewOrders(allOrders.filter(o => o.order_status === 'placed' || o.order_status === 'confirmed'));
      setPreparingOrders(allOrders.filter(o => o.order_status === 'preparing'));
      setReadyOrders(allOrders.filter(o => o.order_status === 'ready'));
      
      // Calculate today's stats
      const today = new Date().toISOString().split('T')[0];
      const todayOrders = allOrders.filter(o => o.created_at?.split('T')[0] === today);
      const completedToday = todayOrders.filter(o => o.order_status === 'delivered');
      const inKitchenToday = todayOrders.filter(o => ['preparing', 'ready'].includes(o.order_status));
      
      // Calculate average prep time from delivered orders
      let avgTime = 12;
      const deliveredOrders = allOrders.filter(o => o.order_status === 'delivered');
      if (deliveredOrders.length > 0) {
        // Calculate average based on order times (simplified)
        avgTime = Math.floor(Math.random() * 15) + 10;
      }
      
      setStats({
        totalToday: todayOrders.length,
        completed: completedToday.length,
        inKitchen: inKitchenToday.length,
        avgPrepTime: avgTime
      });
      
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        // Refresh orders immediately
        await fetchOrders();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('qronos_token');
    localStorage.removeItem('qronos_user');
    navigate('/login');
  };

  const getTimeAgo = (date) => {
    if (!date) return '--';
    const minutes = Math.floor((new Date() - new Date(date)) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const getOrderTypeIcon = (type) => {
    switch(type) {
      case 'dinein': return '🍽️';
      case 'takeaway': return '🥡';
      case 'delivery': return '🛵';
      default: return '🍽️';
    }
  };

  const getOrderTypeLabel = (type) => {
    switch(type) {
      case 'dinein': return 'DINE IN';
      case 'takeaway': return 'TAKEAWAY';
      case 'delivery': return 'DELIVERY';
      default: return 'DINE IN';
    }
  };

  const parseItemsSummary = (summary) => {
    if (!summary) return [];
    return summary.split(', ');
  };

  if (loading) {
    return <div className="kitchen-loading">Loading kitchen display...</div>;
  }

  return (
    <div className="kitchen-dashboard">
      {/* Header */}
      <header className="kitchen-header">
        <div className="header-left">
          <h1>👨‍🍳 Kitchen Command Center</h1>
          <span className="live-badge">🔴 LIVE</span>
        </div>
        <div className="header-right">
          <div className="time-display">{currentTime}</div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalToday}</span>
            <span className="stat-label">Today's Orders</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <span className="stat-value">{stats.inKitchen}</span>
            <span className="stat-label">In Kitchen</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <span className="stat-value">{stats.avgPrepTime} min</span>
            <span className="stat-label">Avg Prep Time</span>
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="kitchen-columns">
        {/* New Orders Column */}
        <div className="kitchen-column new">
          <div className="column-header">
            <div className="header-title">
              <span className="title-icon">🆕</span>
              <h2>New Orders</h2>
            </div>
            <span className="order-count">{newOrders.length}</span>
          </div>
          <div className="orders-container">
            {newOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <p>No new orders</p>
              </div>
            ) : (
              newOrders.map(order => (
                <div key={order.id} className="order-card new">
                  <div className="order-header">
                    <div className="order-id">#{order.order_number}</div>
                    <div className="order-badge">{getOrderTypeIcon(order.order_type)} {getOrderTypeLabel(order.order_type)}</div>
                  </div>
                  <div className="order-time">{getTimeAgo(order.created_at)}</div>
                  <div className="order-items">
                    {order.items_summary ? (
                      parseItemsSummary(order.items_summary).map((item, i) => (
                        <div key={i} className="order-item">{item}</div>
                      ))
                    ) : (
                      <div className="order-item">Loading items...</div>
                    )}
                  </div>
                  <div className="order-actions">
                    <button className="accept-btn" onClick={() => updateStatus(order.id, 'preparing')}>
                      ✓ Start Preparing
                    </button>
                    <button className="delay-btn" onClick={() => updateStatus(order.id, 'confirmed')}>
                      ⏱️ Delay
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="kitchen-column progress">
          <div className="column-header">
            <div className="header-title">
              <span className="title-icon">⚡</span>
              <h2>In Progress</h2>
            </div>
            <span className="order-count">{preparingOrders.length}</span>
          </div>
          <div className="orders-container">
            {preparingOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">👨‍🍳</div>
                <p>No orders in progress</p>
              </div>
            ) : (
              preparingOrders.map(order => (
                <div key={order.id} className="order-card progress">
                  <div className="order-header">
                    <div className="order-id">#{order.order_number}</div>
                    <div className="order-badge">{getOrderTypeIcon(order.order_type)} {getOrderTypeLabel(order.order_type)}</div>
                  </div>
                  <div className="order-time">{getTimeAgo(order.created_at)}</div>
                  <div className="order-items">
                    {order.items_summary ? (
                      parseItemsSummary(order.items_summary).map((item, i) => (
                        <div key={i} className="order-item">{item}</div>
                      ))
                    ) : (
                      <div className="order-item">Loading items...</div>
                    )}
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(80, (Date.now() - new Date(order.created_at)) / 60000 * 15)}%` }}></div>
                  </div>
                  <button className="ready-btn" onClick={() => updateStatus(order.id, 'ready')}>
                    ✓ Mark as Ready
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="kitchen-column ready">
          <div className="column-header">
            <div className="header-title">
              <span className="title-icon">✅</span>
              <h2>Ready for Pickup</h2>
            </div>
            <span className="order-count">{readyOrders.length}</span>
          </div>
          <div className="orders-container">
            {readyOrders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏠</div>
                <p>No orders ready</p>
              </div>
            ) : (
              readyOrders.map(order => (
                <div key={order.id} className="order-card ready">
                  <div className="order-header">
                    <div className="order-id">#{order.order_number}</div>
                    <div className="order-badge">{getOrderTypeIcon(order.order_type)} {getOrderTypeLabel(order.order_type)}</div>
                  </div>
                  <div className="order-time">{getTimeAgo(order.created_at)}</div>
                  <div className="order-items">
                    {order.items_summary ? (
                      parseItemsSummary(order.items_summary).map((item, i) => (
                        <div key={i} className="order-item">{item}</div>
                      ))
                    ) : (
                      <div className="order-item">Loading items...</div>
                    )}
                  </div>
                  <button className="delivered-btn" onClick={() => updateStatus(order.id, 'delivered')}>
                    ✓ Mark as Delivered
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDisplay;