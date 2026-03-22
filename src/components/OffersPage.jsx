import React from 'react';
import { useNavigate } from 'react-router-dom';
import './OffersPage.css';

const OffersPage = () => {
  const navigate = useNavigate();

  return (
    <div className="offers-page">
      <header className="offers-header">
        <button className="back-btn" onClick={() => navigate('/')}>← HOME</button>
        <h1>🎉 EXCLUSIVE OFFERS</h1>
        <div className="header-placeholder"></div>
      </header>

      <div className="offers-container">
        <div className="offers-grid">
          <div className="offer-card featured">
            <div className="offer-tag">🔥 LIMITED TIME</div>
            <div className="offer-content">
              <h3>WELCOME OFFER</h3>
              <div className="offer-discount">50% OFF</div>
              <p className="offer-desc">On your first order above ₹299</p>
              <p className="offer-code">Use Code: WELCOME50</p>
              <button className="claim-btn" onClick={() => navigate('/menu')}>CLAIM NOW →</button>
            </div>
          </div>

          <div className="offer-card">
            <div className="offer-content">
              <h3>WEEKEND SPECIAL</h3>
              <div className="offer-discount">30% OFF</div>
              <p className="offer-desc">On all main course items</p>
              <p className="offer-code">Use Code: WEEKEND30</p>
              <button className="claim-btn" onClick={() => navigate('/menu')}>CLAIM NOW →</button>
            </div>
          </div>

          <div className="offer-card">
            <div className="offer-content">
              <h3>BIRTHDAY BONUS</h3>
              <div className="offer-discount">FREE DESSERT</div>
              <p className="offer-desc">On orders above ₹599</p>
              <p className="offer-code">Show your ID at restaurant</p>
              <button className="claim-btn" onClick={() => navigate('/menu')}>CLAIM NOW →</button>
            </div>
          </div>

          <div className="offer-card">
            <div className="offer-content">
              <h3>GROUP DINING</h3>
              <div className="offer-discount">20% OFF</div>
              <p className="offer-desc">For groups of 4 or more</p>
              <p className="offer-code">Auto-applied at checkout</p>
              <button className="claim-btn" onClick={() => navigate('/menu')}>CLAIM NOW →</button>
            </div>
          </div>

          <div className="offer-card">
            <div className="offer-content">
              <h3>LATE NIGHT</h3>
              <div className="offer-discount">25% OFF</div>
              <p className="offer-desc">After 10 PM on all orders</p>
              <p className="offer-code">Use Code: NIGHT25</p>
              <button className="claim-btn" onClick={() => navigate('/menu')}>CLAIM NOW →</button>
            </div>
          </div>

          <div className="offer-card">
            <div className="offer-content">
              <h3>FIRST DELIVERY</h3>
              <div className="offer-discount">FREE DELIVERY</div>
              <p className="offer-desc">On your first delivery order</p>
              <p className="offer-code">Auto-applied</p>
              <button className="claim-btn" onClick={() => navigate('/menu')}>CLAIM NOW →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersPage;