import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state) {
      setOrderDetails(location.state);
      if (location.state.items) {
        setCartItems(location.state.items);
      }
    } else {
      const savedCart = localStorage.getItem('qronos_cart');
      if (savedCart && savedCart !== 'undefined') {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {}
      }
      generateOrderFromCart();
    }
    setLoading(false);
  }, [location]);

  const generateOrderFromCart = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const deliveryFee = subtotal > 500 ? 0 : 40;
    const total = subtotal + tax + deliveryFee;
    setOrderDetails({
      orderNumber: 'ORD' + Date.now().toString().slice(-6),
      orderType: 'delivery',
      paymentMethod: 'online',
      total: total,
      estimatedTime: '25-30',
      orderDate: new Date().toLocaleString()
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const deliveryFee = orderDetails?.orderType === 'delivery' ? (subtotal > 500 ? 0 : 40) : 0;
  const total = orderDetails?.total || subtotal + tax + deliveryFee;

  const getOrderIcon = () => {
    if (orderDetails?.orderType === 'dinein') return '🍽️';
    if (orderDetails?.orderType === 'takeaway') return '🥡';
    return '🛵';
  };

  const getOrderLabel = () => {
    if (orderDetails?.orderType === 'dinein') return 'DINE IN';
    if (orderDetails?.orderType === 'takeaway') return 'TAKEAWAY';
    return 'DELIVERY';
  };

  if (loading) return <div className="confirmation-loading">Processing your order...</div>;

  return (
    <div className="confirmation-page">
      <div className="confirmation-wrapper">
        {/* Success Animation */}
        <div className="success-animation">
          <div className="success-circle">
            <div className="success-check">✓</div>
          </div>
        </div>

        {/* Header */}
        <div className="confirmation-header">
          <h1>Order Confirmed!</h1>
          <p className="thank-you">Thank you for ordering with QRONOS</p>
          <div className="order-number">Order #{orderDetails?.orderNumber || 'ORD123456'}</div>
        </div>

        {/* Order Details Grid */}
        <div className="confirmation-grid">
          {/* Left Column - Order Items */}
          <div className="confirmation-left">
            <div className="info-card">
              <div className="card-header">
                <span className="card-icon">🍽️</span>
                <h3>Your Order</h3>
              </div>
              <div className="order-items-list">
                {cartItems.length === 0 ? (
                  <div className="empty-items">No items in order</div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.id} className="order-item-row">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-qty">x{item.quantity}</span>
                      </div>
                      <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="order-total-row">
                <span>Total Amount</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="card-header">
                <span className="card-icon">⏱️</span>
                <h3>Estimated Time</h3>
              </div>
              <div className="eta-display">
                <span className="eta-value">{orderDetails?.estimatedTime || '25-30'}</span>
                <span className="eta-unit">minutes</span>
              </div>
              <p className="eta-note">Your order will be ready in approximately</p>
            </div>
          </div>

          {/* Right Column - Order Info */}
          <div className="confirmation-right">
            <div className="info-card">
              <div className="card-header">
                <span className="card-icon">{getOrderIcon()}</span>
                <h3>Order Type</h3>
              </div>
              <div className="order-type-badge">{getOrderLabel()}</div>
              {orderDetails?.orderType === 'dinein' && orderDetails?.tableNumber && (
                <div className="table-info">Table {orderDetails.tableNumber}</div>
              )}
            </div>

            <div className="info-card">
              <div className="card-header">
                <span className="card-icon">👤</span>
                <h3>Contact Details</h3>
              </div>
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{orderDetails?.customerName || 'Guest User'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Phone:</span>
                <span className="info-value">{orderDetails?.customerPhone || 'N/A'}</span>
              </div>
            </div>

            {orderDetails?.orderType === 'delivery' && orderDetails?.address && (
              <div className="info-card">
                <div className="card-header">
                  <span className="card-icon">📍</span>
                  <h3>Delivery Address</h3>
                </div>
                <div className="address-display">{orderDetails.address}</div>
              </div>
            )}

            <div className="info-card">
              <div className="card-header">
                <span className="card-icon">💳</span>
                <h3>Payment Method</h3>
              </div>
              <div className="payment-info">
                <span className="payment-method">
                  {orderDetails?.paymentMethod === 'online' ? '💳 Online Payment' : '💵 Cash on Delivery'}
                </span>
                {orderDetails?.paymentMethod === 'online' && (
                  <span className="paid-badge">✓ Paid</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="track-btn" onClick={() => navigate(`/track/${orderDetails?.orderNumber || '123'}`)}>
            🔍 Track Order
          </button>
          <button className="menu-btn" onClick={() => {
            localStorage.removeItem('qronos_cart');
            navigate('/menu');
          }}>
            📋 Back to Menu
          </button>
        </div>

        {/* Footer Note */}
        <div className="confirmation-footer">
          <p>✨ A confirmation has been sent to your email</p>
          <p className="help-text">Need help? <button onClick={() => navigate('/contact')}>Contact us</button></p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;