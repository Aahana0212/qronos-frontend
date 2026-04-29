// src/components/restaurant_side/kitchen_display.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../../utils/api';
import './KitchenDisplay.css';

const KitchenDisplay = () => {
  const navigate = useNavigate();
  const [newOrders, setNewOrders] = useState([]);
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [readyOrders, setReadyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalToday: 0,
    completedToday: 0
  });
  const audioRef = useRef(null);
  const restaurantId = localStorage.getItem('restaurantId');

  useEffect(() => {
    if (!restaurantId) {
      navigate('/restaurant-login');
      return;
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [restaurantId]);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await apiGet(`/orders/kitchen/${restaurantId}`);
      
      setNewOrders(data.new || []);
      setPreparingOrders(data.preparing || []);
      setReadyOrders(data.ready || []);
      
      setStats({
        totalToday: data.stats?.totalToday || 0,
        completedToday: data.stats?.completedToday || 0
      });
      
      if (data.new && data.new.length > 0 && data.new.length > (newOrders.length || 0)) {
        playNotificationSound();
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await apiPost(`/orders/kitchen/${orderId}/status`, { status });
      fetchOrders();
    } catch (error) {
      alert('Failed to update order status');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getElapsedTime = (timestamp) => {
    const minutes = Math.floor((new Date() - new Date(timestamp)) / 60000);
    return minutes;
  };

  const handleLogout = () => {
    localStorage.removeItem('qronos_token');
    localStorage.removeItem('qronos_user');
    localStorage.removeItem('restaurantId');
    navigate('/restaurant-login');
  };

  if (loading) {
    return (
      <div className="kitchen-loading">
        <div className="loading-spinner"></div>
        <p>Loading Kitchen Display...</p>
      </div>
    );
  }

  return (
    <div className="kitchen-container">
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
      
      {/* Header */}
      <header className="kitchen-header">
        <div className="header-left">
          <div className="logo">🍽️ QRONOS</div>
          <div className="role-badge">👨‍🍳 Kitchen Display</div>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{stats.totalToday}</span>
            <span className="stat-label">Today's Orders</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-value">{preparingOrders.length}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-value">{readyOrders.length}</span>
            <span className="stat-label">Ready</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat">
            <span className="stat-value">{stats.completedToday}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={refreshData} disabled={refreshing}>
            <span>🔄</span> {refreshing ? '...' : 'Refresh'}
          </button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="kitchen-stats">
        <div className="stat-card new">
          <div className="stat-icon">🆕</div>
          <div className="stat-info">
            <h3>{newOrders.length}</h3>
            <p>New Orders</p>
          </div>
        </div>
        <div className="stat-card preparing">
          <div className="stat-icon">🔪</div>
          <div className="stat-info">
            <h3>{preparingOrders.length}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card ready">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{readyOrders.length}</h3>
            <p>Ready for Pickup</p>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="kitchen-grid">
        {/* New Orders Column */}
        <div className="kitchen-column new-column">
          <div className="column-header">
            <h2>🆕 New Orders</h2>
            <span className="badge">{newOrders.length}</span>
          </div>
          <div className="order-list">
            {newOrders.length === 0 ? (
              <div className="empty-state">✨ No new orders</div>
            ) : (
              newOrders.map(order => (
                <div key={order.id} className="order-card new">
                  <div className="order-header">
                    <span className="order-id">#{order.order_number}</span>
                    <span className="order-time">{formatTime(order.created_at)}</span>
                  </div>
                  <div className="order-type">{order.order_type}</div>
                  <div className="order-items">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-footer">
                    <span className="order-total">Total: ₹{order.total_amount}</span>
                    <div className="order-actions">
                      <button className="accept-btn" onClick={() => updateOrderStatus(order.id, 'preparing')}>
                        ✅ Accept
                      </button>
                      <button className="delay-btn" onClick={() => updateOrderStatus(order.id, 'delayed')}>
                        ⏰ Delay
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="kitchen-column progress-column">
          <div className="column-header">
            <h2>🔪 In Progress</h2>
            <span className="badge">{preparingOrders.length}</span>
          </div>
          <div className="order-list">
            {preparingOrders.length === 0 ? (
              <div className="empty-state">⏳ No orders in progress</div>
            ) : (
              preparingOrders.map(order => (
                <div key={order.id} className="order-card progress">
                  <div className="order-header">
                    <span className="order-id">#{order.order_number}</span>
                    <span className="timer">⏱️ {getElapsedTime(order.created_at)} min</span>
                  </div>
                  <div className="order-type">{order.order_type}</div>
                  <div className="order-items">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-footer">
                    <button className="ready-btn" onClick={() => updateOrderStatus(order.id, 'ready')}>
                      ✅ Mark Ready
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ready Orders Column */}
        <div className="kitchen-column ready-column">
          <div className="column-header">
            <h2>✅ Ready for Pickup</h2>
            <span className="badge">{readyOrders.length}</span>
          </div>
          <div className="order-list">
            {readyOrders.length === 0 ? (
              <div className="empty-state">🎉 No ready orders</div>
            ) : (
              readyOrders.map(order => (
                <div key={order.id} className="order-card ready">
                  <div className="order-header">
                    <span className="order-id">#{order.order_number}</span>
                    <span className="order-time">{formatTime(order.created_at)}</span>
                  </div>
                  <div className="order-type">{order.order_type}</div>
                  <div className="order-items">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-footer">
                    <span className="order-total">Total: ₹{order.total_amount}</span>
                  </div>
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