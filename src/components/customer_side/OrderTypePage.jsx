// src/components/customer_side/OrderTypePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderTypePage.css';

const OrderTypePage = () => {
  const navigate = useNavigate();

  const handleOrderTypeSelect = (type) => {
    localStorage.setItem('qronos_order_type', type);

    if (type === 'delivery') {
      // Skip address prompt — collect address later in the checkout flow
      navigate('/restaurant-select', { state: { orderType: 'delivery' } });
    } else if (type === 'dinein') {
      // Dine-in skips the picker — the QR encodes the restaurant
      navigate('/scan-qr', { state: { orderType: 'dinein' } });
    } else if (type === 'takeaway') {
      // Takeaway: pick a restaurant first, then load its menu
      navigate('/restaurant-select', { state: { orderType: 'takeaway' } });
    }
  };

  return (
    <div className="order-type-container">
      <div className="order-type-card">
        {/* ✅ BACK BUTTON - Navigates to Customer Login Page */}
        <button className="order-type-back-btn" onClick={() => navigate('/customer-login')}>
          ← Back
        </button>

        <div className="order-type-header">
          <h1>How would you like to order?</h1>
          <p>Choose your preferred way to enjoy your meal</p>
        </div>

        <div className="order-options">
          {/* Dine In Option */}
          <div className="order-option" onClick={() => handleOrderTypeSelect('dinein')}>
            <div className="option-image">
              <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" alt="Dine In" />
            </div>
            <h3>Dine In</h3>
            <p>Scan QR code at your table and order</p>
            <div className="option-features">
              <span>Table Service</span>
              <span>No Waiting</span>
            </div>
            <div className="option-tag">RECOMMENDED</div>
          </div>

          {/* Take Away Option */}
          <div className="order-option" onClick={() => handleOrderTypeSelect('takeaway')}>
            <div className="option-image">
              <img src="https://cdn-icons-png.flaticon.com/512/1216/1216639.png" alt="Take Away" />
            </div>
            <h3>Take Away</h3>
            <p>Order now, pick up later at your convenience</p>
            <div className="option-features">
              <span>No Delivery Fee</span>
              <span>Quick Pickup</span>
            </div>
            <div className="option-tag">POPULAR</div>
          </div>

          {/* Delivery Option */}
          <div className="order-option" onClick={() => handleOrderTypeSelect('delivery')}>
            <div className="option-image">
              <img src="https://cdn-icons-png.flaticon.com/512/2972/2972185.png" alt="Delivery" />
            </div>
            <h3>Delivery</h3>
            <p>Get it delivered to your doorstep</p>
            <div className="option-features">
              <span>Free Delivery*</span>
              <span>Live Tracking</span>
            </div>
            <div className="option-tag">CONVENIENT</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTypePage;
