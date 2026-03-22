import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderType, setOrderType] = useState('dinein');
  const [tableNumber, setTableNumber] = useState(null);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', address: '', city: '', pincode: '', instructions: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCart();
    const savedOrderType = localStorage.getItem('qronos_order_type');
    if (savedOrderType && savedOrderType !== 'undefined') setOrderType(savedOrderType);
    const savedTable = localStorage.getItem('qronos_table');
    if (savedTable && savedTable !== 'undefined') setTableNumber(savedTable);
  }, []);

  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('qronos_cart');
      if (savedCart && savedCart !== 'undefined') {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const deliveryFee = orderType === 'delivery' ? (subtotal > 500 ? 0 : 40) : 0;
  const total = subtotal + tax + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name required';
    else if (formData.fullName.length < 3) newErrors.fullName = 'Name must be at least 3 characters';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number required';
    else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Enter valid 10-digit phone number';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter valid email';
    if (orderType === 'delivery') {
      if (!formData.address.trim()) newErrors.address = 'Address required';
      if (!formData.city.trim()) newErrors.city = 'City required';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pincode required';
      else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Enter valid 6-digit pincode';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const placeOrderAPI = async () => {
    setPlacingOrder(true);
    const orderData = {
      customer_name: formData.fullName,
      customer_phone: formData.phone,
      customer_email: formData.email || null,
      order_type: orderType,
      table_number: orderType === 'dinein' ? tableNumber : null,
      delivery_address: orderType === 'delivery' ? `${formData.address}, ${formData.city} - ${formData.pincode}` : null,
      special_instructions: formData.instructions || null,
      items: cartItems.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
      total_amount: total,
      payment_method: paymentMethod === 'qr' ? 'online' : paymentMethod
    };
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.removeItem('qronos_cart');
        navigate('/order-confirmation', {
          state: {
            orderNumber: data.orderNumber,
            orderType,
            paymentMethod: paymentMethod === 'qr' ? 'online' : paymentMethod,
            total,
            subtotal,
            tax,
            deliveryFee,
            estimatedTime: orderType === 'delivery' ? '35-40' : orderType === 'takeaway' ? '20-25' : '15-20',
            items: cartItems,
            customerName: formData.fullName,
            customerPhone: formData.phone,
            tableNumber: orderType === 'dinein' ? tableNumber : null,
            address: orderType === 'delivery' ? `${formData.address}, ${formData.city} - ${formData.pincode}` : null
          }
        });
      } else throw new Error(data.error || 'Failed to place order');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (paymentMethod === 'qr') {
      const orderNumber = 'ORD' + Date.now().toString().slice(-8);
      const upiId = 'qronos@okhdfcbank';
      const qrPayload = `upi://pay?pa=${upiId}&pn=QRONOS&am=${total.toFixed(2)}&tn=Payment for order ${orderNumber}&cu=INR`;
      setQrData({ qrPayload, orderNumber, total });
      setShowQRPayment(true);
      return;
    }

    await placeOrderAPI();
  };

  const handleQRPaymentComplete = () => {
    setShowQRPayment(false);
    placeOrderAPI();
  };

  const getOrderIcon = () => {
    if (orderType === 'dinein') return '🍽️';
    if (orderType === 'takeaway') return '🥡';
    return '🛵';
  };
  const getOrderLabel = () => {
    if (orderType === 'dinein') return 'DINE IN';
    if (orderType === 'takeaway') return 'TAKEAWAY';
    return 'DELIVERY';
  };

  if (loading) return <div className="loading">Loading checkout...</div>;
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <button className="btn-primary" onClick={() => navigate('/menu')}>Browse Menu</button>
        </div>
      </div>
    );
  }

  if (showQRPayment && qrData) {
    return (
      <div className="qr-payment-page">
        <div className="qr-payment-card">
          <button className="back-btn-qr" onClick={() => setShowQRPayment(false)}>← Back</button>
          <div className="qr-header">
            <div className="qr-icon">📱</div>
            <h2>Scan to Pay</h2>
            <p>Scan this QR code with any UPI app</p>
          </div>
          <div className="qr-code-container">
            <QRCodeSVG value={qrData.qrPayload} size={220} bgColor="#ffffff" fgColor="#000000" level="H" />
          </div>
          <div className="qr-details">
            <div className="qr-amount">
              <span>Amount to Pay</span>
              <strong>₹{qrData.total.toFixed(2)}</strong>
            </div>
            <div className="qr-upi">
              <span>UPI ID</span>
              <span className="upi-id">qronos@okhdfcbank</span>
            </div>
            <div className="qr-order">Order: {qrData.orderNumber}</div>
          </div>
          <div className="qr-actions">
            <button className="qr-paid-btn" onClick={handleQRPaymentComplete}>
              I've Made Payment
            </button>
            <p className="qr-note">After payment, click above to confirm your order</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-wrapper">
        <div className="checkout-header">
          <button className="back-link" onClick={() => navigate('/cart')}>← Back to Cart</button>
          <h1>Checkout</h1>
          <div className="step-indicator">
            <span className="step active">1. Cart</span>
            <span className="step active">2. Details</span>
            <span className="step">3. Confirmation</span>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-left">
            <div className="section">
              <div className="section-title">
                <span className="title-icon">{getOrderIcon()}</span>
                <h2>Order Type</h2>
              </div>
              <div className="order-type-box">
                <div className="type-badge">{getOrderLabel()}</div>
                {orderType === 'dinein' && tableNumber && <div className="table-badge">Table {tableNumber}</div>}
              </div>
            </div>

            <div className="section">
              <div className="section-title">
                <span className="title-icon">👤</span>
                <h2>Contact Information</h2>
              </div>
              <div className="form-grid">
                <div className="input-group">
                  <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} />
                  {errors.fullName && <span className="error">{errors.fullName}</span>}
                </div>
                <div className="input-group">
                  <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} />
                  {errors.phone && <span className="error">{errors.phone}</span>}
                </div>
                <div className="input-group full-width">
                  <input type="email" name="email" placeholder="Email Address (Optional)" value={formData.email} onChange={handleInputChange} />
                  {errors.email && <span className="error">{errors.email}</span>}
                </div>
              </div>
            </div>

            {orderType === 'delivery' && (
              <div className="section">
                <div className="section-title">
                  <span className="title-icon">📍</span>
                  <h2>Delivery Address</h2>
                </div>
                <div className="form-grid">
                  <div className="input-group full-width">
                    <input type="text" name="address" placeholder="Street Address" value={formData.address} onChange={handleInputChange} />
                    {errors.address && <span className="error">{errors.address}</span>}
                  </div>
                  <div className="input-group">
                    <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleInputChange} />
                    {errors.city && <span className="error">{errors.city}</span>}
                  </div>
                  <div className="input-group">
                    <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleInputChange} />
                    {errors.pincode && <span className="error">{errors.pincode}</span>}
                  </div>
                </div>
              </div>
            )}

            <div className="section">
              <div className="section-title">
                <span className="title-icon">📝</span>
                <h2>Special Instructions</h2>
              </div>
              <textarea name="instructions" placeholder="Any special requests? (e.g., less spicy, extra sauce)" value={formData.instructions} onChange={handleInputChange} rows="3"></textarea>
            </div>
          </div>

          <div className="checkout-right">
            <div className="order-summary-card">
              <h3>Order Summary</h3>
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">x{item.quantity}</span>
                    </div>
                    <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="summary-totals">
                <div className="total-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                <div className="total-row"><span>GST (5%)</span><span>₹{tax.toFixed(2)}</span></div>
                {orderType === 'delivery' && (
                  <div className="total-row"><span>Delivery Fee</span>{deliveryFee === 0 ? <span className="free">FREE</span> : <span>₹{deliveryFee.toFixed(2)}</span>}</div>
                )}
                <div className="total-row grand-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              </div>

              <div className="payment-methods">
                <h4>Payment Method</h4>
                <div className="payment-buttons">
                  <button className={`payment-btn ${paymentMethod === 'online' ? 'active' : ''}`} onClick={() => setPaymentMethod('online')}>
                    <span>💳</span> Online Payment
                  </button>
                  <button className={`payment-btn ${paymentMethod === 'qr' ? 'active' : ''}`} onClick={() => setPaymentMethod('qr')}>
                    <span>📱</span> Pay via QR
                  </button>
                  <button className={`payment-btn ${paymentMethod === 'cash' ? 'active' : ''}`} onClick={() => setPaymentMethod('cash')}>
                    <span>💵</span> Cash
                  </button>
                </div>
              </div>

              <button className="place-order" onClick={handlePlaceOrder} disabled={placingOrder}>
                {placingOrder ? 'Processing...' : `Place Order • ₹${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;