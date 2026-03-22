import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './OrderTracking.css';

const OrderTracking = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status steps
  const statusSteps = [
    { name: 'Order Placed', icon: '📝', key: 'placed', time: 'Order confirmed' },
    { name: 'Confirmed', icon: '✓', key: 'confirmed', time: 'Restaurant accepted' },
    { name: 'Preparing', icon: '👨‍🍳', key: 'preparing', time: 'Chef is cooking' },
    { name: 'Ready', icon: '✅', key: 'ready', time: 'Ready for pickup' },
    { name: 'Out for Delivery', icon: '🛵', key: 'out_for_delivery', time: 'On the way' },
    { name: 'Delivered', icon: '🏠', key: 'delivered', time: 'Enjoy your meal!' }
  ];

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`);
      
      if (!response.ok) {
        if (response.status === 404) throw new Error('Order not found');
        throw new Error('Failed to fetch order');
      }
      
      const data = await response.json();
      setOrder(data);
      
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatusIndex = () => {
    if (!order) return 0;
    const statusMap = {
      'placed': 0, 'confirmed': 1, 'preparing': 2,
      'ready': 3, 'out_for_delivery': 4, 'delivered': 5
    };
    return statusMap[order.orderStatus] || 0;
  };

  const getEstimatedTime = () => {
    if (!order) return '--';
    const statusIndex = getCurrentStatusIndex();
    if (statusIndex >= 4) return '0';
    const baseTime = order.orderType === 'delivery' ? 40 : 25;
    const timeLeft = baseTime - (statusIndex * 8);
    return timeLeft > 0 ? timeLeft : '5';
  };

  const formatDate = (date) => {
    if (!date) return '--';
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return <div className="tracking-loading">Loading order details...</div>;

  if (error) {
    return (
      <div className="tracking-error">
        <div className="error-card">
          <div className="error-icon">🔍</div>
          <h2>Order Not Found</h2>
          <p>{error}</p>
          <button className="error-btn" onClick={() => navigate('/menu')}>Browse Menu</button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStatus = getCurrentStatusIndex();
  const estimatedTime = getEstimatedTime();

  return (
    <div className="tracking-page">
      <div className="tracking-wrapper">
        {/* Header */}
        <div className="tracking-header">
          <button className="back-btn" onClick={() => navigate('/menu')}>← Back to Menu</button>
          <h1>Track Order</h1>
          <div className="order-id-badge">#{order.orderNumber}</div>
        </div>

        <div className="tracking-grid">
          {/* Left Column - Status Timeline */}
          <div className="tracking-timeline">
            <div className="timeline-container">
              {statusSteps.map((step, index) => {
                const isCompleted = index < currentStatus;
                const isActive = index === currentStatus;
                return (
                  <div key={index} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="step-icon">{step.icon}</div>
                    <div className="step-line"></div>
                    <div className="step-content">
                      <h4>{step.name}</h4>
                      <p>{isCompleted ? step.time : isActive ? 'In progress...' : 'Pending'}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {currentStatus < 4 && (
              <div className="eta-card">
                <div className="eta-icon">⏱️</div>
                <div className="eta-info">
                  <span className="eta-label">Estimated Time</span>
                  <span className="eta-value">{estimatedTime} minutes</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Order Details */}
          <div className="tracking-details">
            <div className="detail-card">
              <h3>Order Details</h3>
              <div className="order-items">
                {order.items && order.items.map((item, idx) => (
                  <div key={idx} className="order-item-detail">
                    <span className="item-name">{item.name}</span>
                    <span className="item-qty">x{item.quantity}</span>
                    <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-total">
                <span>Total Amount</span>
                <span>₹{order.total?.toFixed(2) || '0.00'}</span>
              </div>
            </div>

            <div className="detail-card">
              <h3>Delivery Information</h3>
              <div className="info-row">
                <span className="info-label">Order Type:</span>
                <span className="info-value">
                  {order.orderType === 'dinein' ? '🍽️ Dine In' :
                   order.orderType === 'takeaway' ? '🥡 Takeaway' : '🛵 Delivery'}
                </span>
              </div>
              {order.orderType === 'dinein' && order.tableNumber && (
                <div className="info-row">
                  <span className="info-label">Table Number:</span>
                  <span className="info-value">Table {order.tableNumber}</span>
                </div>
              )}
              {order.deliveryAddress && (
                <div className="info-row">
                  <span className="info-label">Delivery Address:</span>
                  <span className="info-value">{order.deliveryAddress}</span>
                </div>
              )}
              <div className="info-row">
                <span className="info-label">Order Date:</span>
                <span className="info-value">{formatDate(order.orderDate)}</span>
              </div>
            </div>

            <div className="detail-card">
              <h3>Contact</h3>
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{order.customerName || 'Guest'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{order.customerPhone || 'N/A'}</span>
              </div>
            </div>

            <div className="action-buttons">
              <button className="contact-btn" onClick={() => navigate('/contact')}>
                📞 Contact Restaurant
              </button>
              <button className="reorder-btn" onClick={() => {
                if (order.items) {
                  localStorage.setItem('qronos_cart', JSON.stringify(order.items));
                  navigate('/checkout');
                }
              }}>
                🔄 Reorder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;