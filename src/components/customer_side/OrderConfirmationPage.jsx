import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmationPage.css';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { orderId, cartTotal, paymentMethod, orderType } = location.state || {};

  if (!orderId) {
    navigate('/');
    return null;
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-bg"></div>
      
      <div className="confirmation-wrapper">
        {/* Back Button */}
        <button className="confirmation-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {/* Success Card */}
        <div className="confirmation-card">
          <div className="success-animation">
            <div className="success-checkmark">
              <div className="check-icon">✓</div>
            </div>
          </div>
          
          <h1 className="confirmation-title">Order Placed Successfully!</h1>
          <p className="confirmation-subtitle">Your order has been confirmed and will be processed soon.</p>
          
          <div className="order-id-box">
            <span className="order-id-label">Order ID</span>
            <span className="order-id-value">{orderId}</span>
          </div>
          
          <div className="order-details-card">
            <div className="detail-row">
              <span>Total Amount</span>
              <strong>₹{cartTotal?.toFixed(2) || '0.00'}</strong>
            </div>
            <div className="detail-row">
              <span>Payment Method</span>
              <strong>
                {paymentMethod === 'qr' ? '📱 QR Scan' : 
                 paymentMethod === 'cash' ? '💵 Cash on Delivery' : '💳 Card'}
              </strong>
            </div>
            <div className="detail-row">
              <span>Payment Status</span>
              <strong className="payment-success">Success</strong>
            </div>
            <div className="detail-row">
              <span>Estimated Time</span>
              <strong>
                {orderType === 'dinein' ? '15-20 min' : 
                 orderType === 'takeaway' ? 'Ready for pickup' : '30-40 min'}
              </strong>
            </div>
          </div>
          
          <div className="confirmation-buttons">
            <button onClick={() => navigate('/menu')} className="order-more-btn">
              🍔 Order More
            </button>
            <button onClick={() => navigate(`/order-tracking/${orderId}`)} className="track-order-btn">
              📍 Track Order
            </button>
            <button onClick={() => navigate('/')} className="home-btn">
              🏠 Go Home
            </button>
          </div>
          
          <p className="help-text">
            📞 Need help? Contact us at <strong>+91 98765 43210</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;