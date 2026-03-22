import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <header className="about-header">
        <button className="back-btn" onClick={() => navigate('/')}>← HOME</button>
        <h1>ℹ️ ABOUT QRONOS</h1>
        <div className="header-placeholder"></div>
      </header>

      <div className="about-container">
        <div className="about-hero">
          <h2>Smart Dining, Better Experience</h2>
          <p>Revolutionizing the way you dine with QR-based smart ordering</p>
        </div>

        <div className="about-content">
          <div className="about-story">
            <h3>OUR STORY</h3>
            <p>
              QRONOS was born from a simple observation - people spend too much time waiting in restaurants. 
              Waiting for waiters, waiting for menus, waiting for bills. We decided to change that.
            </p>
            <p>
              Founded in 2024, QRONOS brings technology and dining together to create seamless, 
              contactless experiences. Just scan, order, and enjoy.
            </p>
          </div>

          <div className="about-mission">
            <h3>OUR MISSION</h3>
            <p>
              To eliminate waiting time in restaurants and provide customers with complete control 
              over their dining experience, right from their phones.
            </p>
          </div>

          <div className="about-values">
            <h3>OUR VALUES</h3>
            <div className="values-grid">
              <div className="value-card">
                <span className="value-icon">⚡</span>
                <h4>Speed</h4>
                <p>No more waiting</p>
              </div>
              <div className="value-card">
                <span className="value-icon">📱</span>
                <h4>Simplicity</h4>
                <p>Easy to use</p>
              </div>
              <div className="value-card">
                <span className="value-icon">🔒</span>
                <h4>Security</h4>
                <p>Safe payments</p>
              </div>
              <div className="value-card">
                <span className="value-icon">❤️</span>
                <h4>Quality</h4>
                <p>Best service</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;