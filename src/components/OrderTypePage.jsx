import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderTypePage.css';

const OrderTypePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('qronos_user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, []);

  const handleOrderTypeSelect = (type) => {
    // Save order type in localStorage
    localStorage.setItem('qronos_order_type', type);
    
    // Redirect to appropriate flow
    if (type === 'dinein') {
      navigate('/scan-qr');
    } else {
      navigate('/menu');
    }
  };

  return (
    <div className="order-type-page">
      <div className="order-type-container">
        <div className="header">
          <h1>Welcome, {user?.name?.split(' ')[0] || 'Guest'}!</h1>
          <p>How would you like to dine today?</p>
        </div>

        <div className="order-type-cards">
          {/* Dine In Card */}
          <div className="type-card" onClick={() => handleOrderTypeSelect('dinein')}>
            <div className="card-icon">🍽️</div>
            <h2>Dine In</h2>
            <p>Scan QR code at your table and order from your phone</p>
            <ul className="features">
              <li>✓ No waiting for waiter</li>
              <li>✓ Order from your phone</li>
              <li>✓ Pay online or cash</li>
            </ul>
            <button className="select-btn">Select Dine In →</button>
          </div>

          {/* Takeaway Card */}
          <div className="type-card featured" onClick={() => handleOrderTypeSelect('takeaway')}>
            <div className="card-icon">🥡</div>
            <h2>Takeaway</h2>
            <p>Order in advance and pick up when ready</p>
            <ul className="features">
              <li>✓ Skip the wait</li>
              <li>✓ Order from anywhere</li>
              <li>✓ Pay online</li>
            </ul>
            <button className="select-btn">Order Takeaway →</button>
          </div>

          {/* Delivery Card */}
          <div className="type-card" onClick={() => handleOrderTypeSelect('delivery')}>
            <div className="card-icon">🛵</div>
            <h2>Delivery</h2>
            <p>Get your favorite food delivered to your doorstep</p>
            <ul className="features">
              <li>✓ Free delivery above ₹500</li>
              <li>✓ Real-time tracking</li>
              <li>✓ Pay online or cash</li>
            </ul>
            <button className="select-btn">Order Delivery →</button>
          </div>
        </div>

        <div className="footer-note">
          <p>⚡ Quick tip: Dine In customers need to scan table QR code</p>
        </div>
      </div>
    </div>
  );
};

export default OrderTypePage;