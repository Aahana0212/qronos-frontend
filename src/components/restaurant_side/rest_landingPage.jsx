// src/components/LandingPage.jsx - Professional SaaS Version
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './rest_landingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <button className="nav-btn back" onClick={() => navigate('/')}>
            ← Back
          </button>
          <div className="logo">
            <span className="logo-icon">🍽️</span>
            <span className="logo-text">QRONOS</span>
          </div>
          <div className="nav-buttons">
            <button className="nav-btn login" onClick={() => navigate('/restaurant-login')}>
              Login
            </button>
            <button className="nav-btn register" onClick={() => navigate('/restaurant-register')}>
              Register Restaurant
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="restaurant-name">🚀 FOR RESTAURANTS</div>
          <h1 className="hero-title">
            Transform Your Restaurant
            <span> with QRONOS</span>
          </h1>
          <p className="hero-subtitle">
            One QR Code. Zero Touchpoints. Maximum Efficiency.
            <br />
            Join 500+ restaurants digitizing their service.
          </p>
          <div className="hero-buttons">
            <button className="card-btn" onClick={() => navigate('/restaurant-register')}>
              Start Free Trial →
            </button>
          </div>
          <p className="hero-note">No credit card required • Free for 30 days</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="quick-actions">
        <div className="container">
          <h2 className="section-title">Everything You Need to Digitize Your Restaurant</h2>
          <div className="action-cards">
            <div className="action-card">
              <div className="card-icon">👑</div>
              <h3>For Owners</h3>
              <p>Full control: Menu, QR codes, Analytics, Staff management</p>
              <button className="card-btn">Learn More →</button>
            </div>
            <div className="action-card featured">
              <div className="card-icon">👨‍💼</div>
              <h3>For Staff</h3>
              <p>Easy order management, Table assignment, Order status</p>
              <button className="card-btn">Learn More →</button>
            </div>
            <div className="action-card">
              <div className="card-icon">👨‍🍳</div>
              <h3>For Kitchen</h3>
              <p>Real-time orders, Accept/Ready/Delay, Sound alerts</p>
              <button className="card-btn">Learn More →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2 className="section-title">Why Restaurants Choose QRONOS?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h4>Save ₹50,000/month</h4>
              <p>No waiters needed</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">⚡</div>
              <h4>40% Faster Service</h4>
              <p>Orders go directly to kitchen</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔄</div>
              <h4>0% Commission</h4>
              <p>No Zomato/Swiggy cut</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📈</div>
              <h4>Real-time Analytics</h4>
              <p>Track every order</p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="steps-section">
        <div className="container">
          <h2 className="section-title">Get Started in 4 Simple Steps</h2>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h4>Register</h4>
              <p>Create your account</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h4>Setup Menu</h4>
              <p>Add items & prices</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h4>Print QR</h4>
              <p>Generate for tables</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h4>Start Orders</h4>
              <p>Customers scan & order</p>
            </div>
          </div>
        </div>
      </section>

      {/* Perfect For Section */}
      <section className="perfect-for-section">
        <div className="container">
          <h2 className="section-title">Perfect For:</h2>
          <div className="restaurant-types">
            <span className="type-badge">🍕 Cafes & Bistros</span>
            <span className="type-badge">🍔 Fast Food</span>
            <span className="type-badge">🍜 Fine Dining</span>
            <span className="type-badge">☕ Coffee Shops</span>
            <span className="type-badge">🍛 Family Restaurants</span>
            <span className="type-badge">🍦 Ice Cream Parlors</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Transform Your Restaurant?</h2>
          <p>Get your restaurant on QRONOS today. First 30 days FREE!</p>
          <button className="card-btn cta-btn" onClick={() => navigate('/restaurant-register')}>
            Register Your Restaurant →
          </button>
          <p className="cta-note">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <h2>QRONOS</h2>
              <p>Smart Restaurant Ordering System</p>
            </div>
            <div className="footer-links">
              <div>
                <h4>Company</h4>
                <ul>
                  <li onClick={() => navigate('/about')}>About</li>
                  <li onClick={() => navigate('/contact')}>Contact</li>
                </ul>
              </div>
              <div>
                <h4>Legal</h4>
                <ul>
                  <li>Privacy</li>
                  <li>Terms</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2024 QRONOS. Made for restaurants, by restaurant lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;