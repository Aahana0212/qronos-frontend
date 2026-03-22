import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContactPage.css';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState({ submitted: false, error: null, loading: false });
  const [contactInfo, setContactInfo] = useState({
    address: '123 Food Street, Mumbai - 400001',
    phone1: '+91 98765 43210',
    phone2: '+91 98765 43211',
    email1: 'info@qronos.com',
    email2: 'support@qronos.com',
    hoursWeekday: 'Mon - Fri: 11:00 AM - 11:00 PM',
    hoursWeekend: 'Sat - Sun: 11:00 AM - 12:00 AM'
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contact');
      if (response.ok) {
        const data = await response.json();
        if (data) setContactInfo(data);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ submitted: false, error: null, loading: true });

    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({ submitted: false, error: 'Please fill all required fields', loading: false });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({ submitted: false, error: 'Please enter a valid email address', loading: false });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/contact/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormStatus({ submitted: true, error: null, loading: false });
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setFormStatus(prev => ({ ...prev, submitted: false })), 5000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setFormStatus({ submitted: false, error: 'Failed to send message. Please try again.', loading: false });
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-wrapper">
        {/* Header */}
        <div className="contact-header">
          <button className="back-btn" onClick={() => navigate('/')}>← Back to Home</button>
          <h1>Contact Us</h1>
          <div className="header-decoration"></div>
        </div>

        {/* Hero Section */}
        <div className="contact-hero">
          <h2>We'd Love to Hear From You</h2>
          <p>Have questions, feedback, or just want to say hello? Reach out to us!</p>
        </div>

        <div className="contact-grid">
          {/* Left Column - Contact Info */}
          <div className="contact-info-section">
            <div className="info-card">
              <div className="card-icon">📍</div>
              <h3>Visit Us</h3>
              <p>{contactInfo.address.split(',')[0]},</p>
              <p>{contactInfo.address.split(',').slice(1).join(',').trim()}</p>
            </div>

            <div className="info-card">
              <div className="card-icon">📞</div>
              <h3>Call Us</h3>
              <p>{contactInfo.phone1}</p>
              <p>{contactInfo.phone2}</p>
            </div>

            <div className="info-card">
              <div className="card-icon">✉️</div>
              <h3>Email Us</h3>
              <p>{contactInfo.email1}</p>
              <p>{contactInfo.email2}</p>
            </div>

            <div className="info-card">
              <div className="card-icon">🕒</div>
              <h3>Opening Hours</h3>
              <p>{contactInfo.hoursWeekday}</p>
              <p>{contactInfo.hoursWeekend}</p>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="contact-form-section">
            <div className="form-card">
              <h3>Send Us a Message</h3>
              <p className="form-subtitle">We'll get back to you within 24 hours</p>

              {formStatus.submitted && (
                <div className="success-message">
                  <span>✓</span> Message sent successfully! We'll get back to you soon.
                </div>
              )}

              {formStatus.error && (
                <div className="error-message">
                  <span>⚠️</span> {formStatus.error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="input-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Your Email *"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="input-group">
                  <textarea
                    name="message"
                    placeholder="Your Message *"
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={formStatus.loading}>
                  {formStatus.loading ? 'Sending...' : 'Send Message →'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3770.555273349758!2d72.825614!3d19.0759837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9c1d9b8e9a5%3A0x8a5a5a5a5a5a5a5a!2sMumbai!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
            width="100%"
            height="350"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            title="Restaurant Location"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;