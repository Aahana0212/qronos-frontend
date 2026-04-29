// src/components/customer_side/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="customer-landing">
      <nav className="customer-navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">🍽️</span>
            <span className="logo-text">QRONOS</span>
          </div>
          <div className="nav-buttons">
            <button className="nav-btn back" onClick={() => window.location.href = '/'}>
              ← Back
            </button>
            <button className="nav-btn login" onClick={() => navigate('/customer-login')}>
              Login
            </button>
            <button className="nav-btn register" onClick={() => navigate('/customer-register')}>
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <section className="customer-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">✨ Order Food Instantly ✨</div>
          <h1 className="hero-title">
            Delicious Food <span className="gold-text">Delivered to You</span>
          </h1>
          <p className="hero-subtitle">
            Scan QR code at your favorite restaurant and order food in seconds
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/customer-register')}>
              Get Started →
            </button>
            <button className="btn-secondary" onClick={() => navigate('/customer-login')}>
              Login
            </button>
          </div>
        </div>
      </section>

      <section className="customer-features">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card"><div className="feature-icon">📱</div><h3>Scan QR Code</h3><p>Simply scan the QR code at your restaurant table</p></div>
            <div className="feature-card"><div className="feature-icon">🍽️</div><h3>Browse Menu</h3><p>View digital menu and add items to cart</p></div>
            <div className="feature-card"><div className="feature-icon">💳</div><h3>Place Order</h3><p>Pay online or cash on delivery</p></div>
            <div className="feature-card"><div className="feature-icon">📍</div><h3>Track Order</h3><p>Track your order in real-time</p></div>
          </div>
        </div>
      </section>

      <section className="customer-cta">
        <div className="container">
          <h2>Ready to Order?</h2>
          <p>Join thousands of happy customers ordering food effortlessly</p>
          <button className="cta-btn" onClick={() => navigate('/customer-register')}>Create Account →</button>
        </div>
      </section>

      <footer className="customer-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand"><h3>QRONOS</h3><p>Smart Restaurant Ordering System</p></div>
            <div className="footer-links"><a href="/about">About</a><a href="/contact">Contact</a><a href="/privacy">Privacy</a></div>
          </div>
          <div className="footer-bottom"><p>© 2024 QRONOS. All rights reserved.</p></div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;