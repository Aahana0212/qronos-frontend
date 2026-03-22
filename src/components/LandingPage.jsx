import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="restaurant-name">QRONOS</div>
          <h1 className="hero-title">
            Where Every Meal<br />
            <span>Tells a Story</span>
          </h1>
          <p className="hero-subtitle">
            Experience the finest dining with QR-based smart ordering
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/login')}>
              LOGIN
            </button>
            <button className="btn-outline" onClick={() => navigate('/register')}>
              REGISTER
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;