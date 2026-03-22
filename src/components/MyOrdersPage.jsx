import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyOrdersPage.css';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  return (
    <div className="orders-page">
      <header className="orders-header">
        <button className="back-btn" onClick={() => navigate('/profile')}>← BACK TO PROFILE</button>
        <h1>📋 MY ORDERS</h1>
        <div className="header-placeholder"></div>
      </header>

      <div className="orders-container">
        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            ALL ORDERS
          </button>
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            ACTIVE
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            COMPLETED
          </button>
          <button 
            className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            CANCELLED
          </button>
        </div>

        {/* Orders List */}
        <div className="orders-grid">
          <div className="order-card">
            <div className="order-card-header">
              <div>
                <span className="order-id">#QR-2024-001</span>
                <span className="order-date">25 Mar 2024 • 10:30 AM</span>
              </div>
              <span className="order-status delivered">DELIVERED</span>
            </div>

            <div className="order-items">
              <div className="order-item">
                <span>Chicken Wings x2</span>
                <span>₹500</span>
              </div>
              <div className="order-item">
                <span>Spring Rolls x1</span>
                <span>₹120</span>
              </div>
              <div className="order-item">
                <span>Cold Coffee x1</span>
                <span>₹90</span>
              </div>
            </div>

            <div className="order-card-footer">
              <div className="order-total">
                <span>Total:</span>
                <span>₹785.50</span>
              </div>
              <div className="order-actions">
                <button className="action-btn" onClick={() => navigate('/track/123')}>TRACK</button>
                <button className="action-btn">REORDER</button>
                <button className="action-btn">RATE</button>
              </div>
            </div>
          </div>

          <div className="order-card">
            <div className="order-card-header">
              <div>
                <span className="order-id">#QR-2024-002</span>
                <span className="order-date">24 Mar 2024 • 7:45 PM</span>
              </div>
              <span className="order-status delivered">DELIVERED</span>
            </div>

            <div className="order-items">
              <div className="order-item">
                <span>Paneer Butter Masala x1</span>
                <span>₹280</span>
              </div>
              <div className="order-item">
                <span>Butter Naan x2</span>
                <span>₹80</span>
              </div>
              <div className="order-item">
                <span>Gulab Jamun x2</span>
                <span>₹120</span>
              </div>
            </div>

            <div className="order-card-footer">
              <div className="order-total">
                <span>Total:</span>
                <span>₹520</span>
              </div>
              <div className="order-actions">
                <button className="action-btn">TRACK</button>
                <button className="action-btn">REORDER</button>
                <button className="action-btn">RATE</button>
              </div>
            </div>
          </div>

          <div className="order-card">
            <div className="order-card-header">
              <div>
                <span className="order-id">#QR-2024-003</span>
                <span className="order-date">23 Mar 2024 • 1:15 PM</span>
              </div>
              <span className="order-status preparing">PREPARING</span>
            </div>

            <div className="order-items">
              <div className="order-item">
                <span>Chicken Biryani x1</span>
                <span>₹320</span>
              </div>
              <div className="order-item">
                <span>Raita x1</span>
                <span>₹50</span>
              </div>
            </div>

            <div className="order-card-footer">
              <div className="order-total">
                <span>Total:</span>
                <span>₹410</span>
              </div>
              <div className="order-actions">
                <button className="action-btn" onClick={() => navigate('/track/123')}>TRACK</button>
                <button className="action-btn">REORDER</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;