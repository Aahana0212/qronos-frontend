import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersManagement.css';

const OrdersManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const savedOrders = JSON.parse(localStorage.getItem('qronos_orders') || '[]');
    const restaurantOrders = savedOrders.map(order => ({
      ...order,
      status: order.status || 'confirmed',
      orderDate: order.orderDate || new Date().toISOString()
    }));
    setOrders(restaurantOrders);
    setLoading(false);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map(order =>
      order.orderId === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('qronos_orders', JSON.stringify(updatedOrders));
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'confirmed': return 'status-confirmed';
      case 'preparing': return 'status-preparing';
      case 'ready': return 'status-ready';
      case 'out-for-delivery': return 'status-out';
      case 'delivered': return 'status-delivered';
      default: return 'status-pending';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  if (loading) return <div className="orders-loading">Loading orders...</div>;

  return (
    <div className="orders-container">
      <div className="orders-header">
        <button className="back-btn" onClick={() => navigate('/owner-dashboard')}>← Dashboard</button>
        <h1>Order Management</h1>
      </div>

      <div className="orders-stats">
        <div className="stat-card"><h3>Total Orders</h3><p>{stats.total}</p></div>
        <div className="stat-card"><h3>Pending</h3><p>{stats.pending}</p></div>
        <div className="stat-card"><h3>Preparing</h3><p>{stats.preparing}</p></div>
        <div className="stat-card"><h3>Delivered</h3><p>{stats.delivered}</p></div>
      </div>

      <div className="orders-filters">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`} onClick={() => setFilter('confirmed')}>Pending</button>
        <button className={`filter-btn ${filter === 'preparing' ? 'active' : ''}`} onClick={() => setFilter('preparing')}>Preparing</button>
        <button className={`filter-btn ${filter === 'ready' ? 'active' : ''}`} onClick={() => setFilter('ready')}>Ready</button>
        <button className={`filter-btn ${filter === 'delivered' ? 'active' : ''}`} onClick={() => setFilter('delivered')}>Delivered</button>
      </div>

      <div className="orders-list">
        {filteredOrders.map(order => (
          <div key={order.orderId} className="order-card">
            <div className="order-card-header">
              <div>
                <span className="order-id">#{order.orderId}</span>
                <span className="order-date">{new Date(order.orderDate).toLocaleString()}</span>
              </div>
              <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                {order.status?.toUpperCase()}
              </span>
            </div>
            
            <div className="order-card-body">
              <div className="order-customer">
                <p><strong>Customer:</strong> {order.customerDetails?.name || 'Guest'}</p>
                <p><strong>Phone:</strong> {order.customerDetails?.phone || '-'}</p>
                <p><strong>Address:</strong> {order.customerDetails?.address || 'Pickup'}</p>
              </div>
              <div className="order-items-list">
                <strong>Items:</strong>
                {order.items?.map((item, idx) => (
                  <div key={idx}>{item.quantity}x {item.name} - ₹{item.price}</div>
                ))}
              </div>
              <div className="order-total">Total: ₹{order.total?.toFixed(2)}</div>
            </div>
            
            <div className="order-card-footer">
              <select 
                value={order.status} 
                onChange={(e) => updateOrderStatus(order.orderId, e.target.value)}
                className="status-select"
              >
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready for Pickup</option>
                <option value="out-for-delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
              <button className="view-details-btn" onClick={() => setSelectedOrder(order)}>View Details</button>
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder.orderId}</h2>
              <button onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <h3>Customer Details</h3>
              <p><strong>Name:</strong> {selectedOrder.customerDetails?.name}</p>
              <p><strong>Phone:</strong> {selectedOrder.customerDetails?.phone}</p>
              <p><strong>Address:</strong> {selectedOrder.customerDetails?.address}</p>
              <h3>Order Items</h3>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx}>{item.quantity}x {item.name} - ₹{item.price}</div>
              ))}
              <h3>Special Instructions</h3>
              <p>{selectedOrder.specialInstructions || 'None'}</p>
              <h3>Payment Method</h3>
              <p>{selectedOrder.paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;