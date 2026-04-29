// src/components/customer_side/OrderTypePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderTypePage.css';

const OrderTypePage = () => {
  const navigate = useNavigate();
  const [showAddress, setShowAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const handleOrderTypeSelect = (type) => {
    // ✅ Save order type
    localStorage.setItem('qronos_order_type', type);
    
    if (type === 'delivery') {
      setShowAddress(true);
    } else if (type === 'dinein') {
      // ✅ Pass orderType to QR scan page
      navigate('/scan-qr', { state: { orderType: 'dinein' } });
    } else if (type === 'takeaway') {
      // ✅ Pass orderType to menu page
      navigate('/menu', { state: { orderType: 'takeaway' } });
    }
  };

  const handleDeliverySubmit = () => {
    if (deliveryAddress.trim()) {
      localStorage.setItem('deliveryAddress', deliveryAddress);
      // ✅ Pass orderType and address to menu page
      navigate('/menu', { 
        state: { 
          orderType: 'delivery',
          deliveryAddress: deliveryAddress 
        } 
      });
    } else {
      alert('Please enter your delivery address');
    }
  };

  if (showAddress) {
    return (
      <div className="order-type-container">
        <div className="order-type-card">
          <button className="back-btn" onClick={() => setShowAddress(false)}>← Back</button>
          <div className="address-form">
            <div className="address-icon">📍</div>
            <h2>Delivery Address</h2>
            <p className="address-subtitle">Where should we deliver your order?</p>
            <textarea
              placeholder="Enter your full delivery address (House No., Street, City, Pincode)"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows="4"
            />
            <button className="submit-address" onClick={handleDeliverySubmit}>
              Continue to Menu →
            </button>
          </div>
        </div>
      </div>
    );
  }

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