import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingChoicePage.css';

const LandingChoicePage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-choice">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="logo">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" 
              alt="QRONOS Logo" 
              className="logo-image"
            />
            <span className="logo-text">QRONOS</span>
          </div>
          <h1>
            Where <span className="highlight">Flavors</span> Meet 
            <br />
            <span className="highlight">Innovation</span>
          </h1>
          <p className="tagline">Empowering restaurants & delighting food lovers — all in one place.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/customer-landing')}>
              🍔 For Customers
            </button>
            <button className="btn-secondary" onClick={() => navigate('/restaurant')}>
              🏪 For Restaurants
            </button>
          </div>
          <p className="sub-text">Join the QRONOS ecosystem today — Scan. Order. Grow.</p>
        </div>
        <div className="scroll-indicator">↓</div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Why Choose QRONOS?</h2>
        <div className="features-grid">
          <div className="feature-card customer-feature">
            <div className="feature-icon">
              <img src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png" alt="Customer" />
            </div>
            <h3>For Customers</h3>
            <ul>
              <li>✓ Order from your table via QR code</li>
              <li>✓ Takeaway & delivery options</li>
              <li>✓ Real-time order tracking</li>
              <li>✓ Exclusive deals & offers</li>
            </ul>
            <button className="feature-btn" onClick={() => navigate('/customer-landing')}>Explore →</button>
          </div>
          <div className="feature-card restaurant-feature">
            <div className="feature-icon">
              <img src="https://cdn-icons-png.flaticon.com/512/1995/1995572.png" alt="Restaurant" />
            </div>
            <h3>For Restaurants</h3>
            <ul>
              <li>✓ QR code based ordering system</li>
              <li>✓ Complete dashboard & analytics</li>
              <li>✓ Staff & menu management</li>
              <li>✓ Increase revenue by 40%</li>
            </ul>
            <button className="feature-btn" onClick={() => navigate('/restaurant')}>Join Now →</button>
          </div>
          <div className="feature-card tech-feature">
            <div className="feature-icon">
              <img src="https://cdn-icons-png.flaticon.com/512/1699/1699126.png" alt="Tech" />
            </div>
            <h3>Why QRONOS?</h3>
            <ul>
              <li>✓ No commission fees</li>
              <li>✓ Direct customer connection</li>
              <li>✓ 24/7 support</li>
              <li>✓ Easy setup in minutes</li>
            </ul>
            <button className="feature-btn" onClick={() => navigate('/restaurant')}>Get Started →</button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-num">1</div>
            <h4>Choose Your Side</h4>
            <p>Select customer or restaurant partner</p>
          </div>
          <div className="step">
            <div className="step-num">2</div>
            <h4>Sign Up / Login</h4>
            <p>Create your account in seconds</p>
          </div>
          <div className="step">
            <div className="step-num">3</div>
            <h4>Start Ordering / Managing</h4>
            <p>Enjoy seamless experience</p>
          </div>
        </div>
      </div>

      {/* Trusted Section - Only Tagline + Opaque BG */}
      <div className="trusted-section">
        <div className="trusted-content">
          <p>Trusted by restaurants & food lovers across India</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 QRONOS - All Rights Reserved</p>
        <div className="footer-links">
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingChoicePage;