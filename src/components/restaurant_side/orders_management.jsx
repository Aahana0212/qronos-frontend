import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPost } from '../../utils/api';
import './OrdersManagement.css';

const OrdersManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);

  const restaurantId = localStorage.getItem('restaurantId');

  const loadOrders = async ({ silent = false } = {}) => {
    if (!silent) setRefreshing(true);
    try {
      const response = await apiGet(`/orders/restaurant/${restaurantId}/all`);

      // apiGet wraps fetch errors as { success:false, error:true } — treat that as a transient
      // failure and preserve the currently displayed orders instead of wiping them.
      if (response && response.error === true) {
        console.warn('Orders fetch returned error wrapper; keeping previous orders:', response.message);
        setLoadError(response.message || 'Failed to fetch orders');
        return;
      }

      let fetchedOrders = null;
      if (Array.isArray(response)) {
        fetchedOrders = response;
      } else if (response && Array.isArray(response.orders)) {
        fetchedOrders = response.orders;
      } else if (response && Array.isArray(response.data)) {
        fetchedOrders = response.data;
      }

      if (fetchedOrders === null) {
        // Unexpected shape — preserve previous orders.
        console.warn('Orders fetch returned unexpected shape; keeping previous orders:', response);
        setLoadError('Server returned unexpected response');
        return;
      }

      setOrders(fetchedOrders);
      setLoadError(null);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoadError(error.message || 'Network error');
      // Do not clear orders here — keep what is on screen.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!restaurantId) {
      navigate('/restaurant-login');
      return;
    }
    loadOrders({ silent: true });
    // Poll for new orders every 10s so the page shows orders placed after open.
    const interval = setInterval(() => loadOrders({ silent: true }), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiPost(`/orders/${orderId}/status`, { status: newStatus });
      await loadOrders({ silent: true });
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    }
  };

  const viewOrderDetails = async (order) => {
    try {
      const response = await apiGet(`/orders/${order.order_id}`);
      if (response && response.success) {
        setSelectedOrder(response.order);
        setSelectedOrderItems(response.items || []);
      } else {
        setSelectedOrder(order);
        setSelectedOrderItems([]);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setSelectedOrder(order);
      setSelectedOrderItems([]);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-confirmed';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      case 'out_for_delivery': return 'status-out';
      case 'delivered': return 'status-delivered';
      case 'completed': return 'status-delivered';
      default: return 'status-pending';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return (order.order_status || order.status) === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => (o.order_status || o.status) === 'pending').length,
    preparing: orders.filter(o => (o.order_status || o.status) === 'preparing').length,
    delivered: orders.filter(o => ['delivered', 'completed'].includes(o.order_status || o.status)).length
  };

  if (loading) return <div className="orders-loading">Loading orders...</div>;

  return (
    <div className="orders-container">
      <div className="orders-header">
        <button className="back-btn" onClick={() => navigate('/owner-dashboard')}>← Dashboard</button>
        <h1>Order Management</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {lastUpdated && (
            <small style={{ color: '#666' }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </small>
          )}
          <button
            className="add-btn"
            onClick={() => loadOrders()}
            disabled={refreshing}
            style={{ padding: '8px 16px' }}
          >
            {refreshing ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
      </div>
      <div style={{ marginBottom: 12, color: '#888', fontSize: 12 }}>
        Showing orders for restaurant ID: <strong>{restaurantId}</strong>
      </div>
      {loadError && (
        <div style={{
          marginBottom: 12, padding: '10px 14px', borderRadius: 8,
          background: '#fff4e5', color: '#8a3b00', fontSize: 13
        }}>
          ⚠️ Could not refresh orders: {loadError}. Showing last known data.
        </div>
      )}

      <div className="orders-stats">
        <div className="stat-card"><h3>Total Orders</h3><p>{stats.total}</p></div>
        <div className="stat-card"><h3>Pending</h3><p>{stats.pending}</p></div>
        <div className="stat-card"><h3>Preparing</h3><p>{stats.preparing}</p></div>
        <div className="stat-card"><h3>Delivered</h3><p>{stats.delivered}</p></div>
      </div>

      <div className="orders-filters">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Pending</button>
        <button className={`filter-btn ${filter === 'preparing' ? 'active' : ''}`} onClick={() => setFilter('preparing')}>Preparing</button>
        <button className={`filter-btn ${filter === 'ready' ? 'active' : ''}`} onClick={() => setFilter('ready')}>Ready</button>
        <button className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`} onClick={() => setFilter('delivered')}>Delivered</button>
      </div>

      <div className="orders-list">
        {filteredOrders.length === 0 ? (
          <div className="orders-loading">No orders found</div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id">#{order.order_id}</span>
                  <span className="order-date">{new Date(order.created_at).toLocaleString()}</span>
                </div>
                <span className={`status-badge ${getStatusBadgeClass(order.order_status || order.status)}`}>
                  {(order.order_status || order.status)?.toUpperCase()}
                </span>
              </div>

              <div className="order-card-body">
                <div className="order-customer">
                  <p><strong>Customer:</strong> {order.customer_name || 'Guest'}</p>
                  <p><strong>Phone:</strong> {order.customer_phone || '-'}</p>
                  <p><strong>Address:</strong> {order.delivery_address || 'Pickup'}</p>
                </div>
                <div className="order-total">Total: ₹{Number(order.total_amount).toFixed(2)}</div>
              </div>

              <div className="order-card-footer">
                <select
                  value={order.order_status || order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready for Pickup</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
                <button className="view-details-btn" onClick={() => viewOrderDetails(order)}>View Details</button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => { setSelectedOrder(null); setSelectedOrderItems([]); }}>
          <div className="details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder.order_id}</h2>
              <button onClick={() => { setSelectedOrder(null); setSelectedOrderItems([]); }}>✕</button>
            </div>
            <div className="modal-body">
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> {selectedOrder.customer_name || 'Guest'}</p>
              <p><strong>Phone:</strong> {selectedOrder.customer_phone || '-'}</p>
              <p><strong>Address:</strong> {selectedOrder.delivery_address || 'Pickup'}</p>
              <h3>Order Items</h3>
              {selectedOrderItems.length > 0 ? (
                selectedOrderItems.map((item, idx) => (
                  <div key={idx}>{item.quantity}x {item.name} - ₹{item.price_at_time}</div>
                ))
              ) : (
                <p>No item details available</p>
              )}
              <h3>Special Instructions</h3>
              <p>{selectedOrder.special_instructions || 'None'}</p>
              <h3>Payment Method</h3>
              <p>{selectedOrder.payment_method || '-'}</p>
              <h3>Total</h3>
              <p>₹{Number(selectedOrder.total_amount).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;
