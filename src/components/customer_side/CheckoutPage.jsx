import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { apiPost, getRestaurantId } from '../../utils/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { cart, cartTotal, specialInstructions, paymentMethod, orderType: passedOrderType } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState('delivery');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  useEffect(() => {
    if (!cart || cart.length === 0) {
      navigate('/cart');
    }
    const savedOrderType = passedOrderType || localStorage.getItem('qronos_order_type') || 'delivery';
    setOrderType(savedOrderType);
    
    if (paymentMethod === 'card') {
      setShowCardForm(true);
    }
  }, [cart, navigate, passedOrderType, paymentMethod]);

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleInputChange = (e) => {
    setCustomerDetails({
      ...customerDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleCardInputChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'number') {
      value = value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
    }
    if (e.target.name === 'expiry') {
      value = value.replace(/\//g, '').replace(/(\d{2})/, '$1/').slice(0, 5);
    }
    setCardDetails({
      ...cardDetails,
      [e.target.name]: value
    });
  };

  const generateQRCode = async () => {
    try {
      const upiId = 'qronos@okhdfcbank';
      const merchantName = 'QRONOS Foods';
      const amount = cartTotal.toFixed(2);
      const orderIdGen = 'ORD' + Date.now();
      
      const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Payment for order ' + orderIdGen)}`;
      
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        width: 250,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('QR Code generation error:', error);
    }
  };

  const processPayment = async () => {
    setPaymentStatus('processing');
    return new Promise((resolve) => {
      setTimeout(() => {
        setPaymentStatus('success');
        resolve(true);
      }, 2000);
    });
  };

  // ✅ CASH - Direct Place Order
  const handleCashOrder = async () => {
    if (!customerDetails.name || !customerDetails.phone) {
      alert('Please enter your name and phone number');
      return;
    }
    if (orderType === 'delivery' && !customerDetails.address) {
      alert('Please enter delivery address');
      return;
    }
    setLoading(true);
    await placeOrder();
  };

  // ✅ QR SCAN - Generate QR and Show Modal
  const handleQRPayment = async () => {
    if (!customerDetails.name || !customerDetails.phone) {
      alert('Please enter your name and phone number');
      return;
    }
    if (orderType === 'delivery' && !customerDetails.address) {
      alert('Please enter delivery address');
      return;
    }
    await generateQRCode();
    setShowQRModal(true);
  };

  const handleCardPayment = async () => {
    if (!customerDetails.name || !customerDetails.phone) {
      alert('Please enter your name and phone number');
      return;
    }
    if (orderType === 'delivery' && !customerDetails.address) {
      alert('Please enter delivery address');
      return;
    }
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
      alert('Please enter complete card details');
      return;
    }
    setLoading(true);
    await processPayment();
    await placeOrder();
  };

  const placeOrder = async () => {
    const restaurantId = getRestaurantId();
    const user = JSON.parse(localStorage.getItem('qronos_user') || '{}');

    const subtotal = cartTotal - (cartTotal * 0.05) - (orderType === 'delivery' ? 40 : 0);
    const deliveryFee = orderType === 'delivery' ? 40 : 0;
    const tax = cartTotal * 0.05;

    const orderData = {
      user_id: user.id || null,
      restaurant_id: restaurantId,
      order_type: orderType,
      items: cart.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      })),
      subtotal,
      delivery_fee: deliveryFee,
      tax,
      total_amount: cartTotal,
      payment_method: paymentMethod,
      customer_name: customerDetails.name,
      customer_phone: customerDetails.phone,
      delivery_address: customerDetails.address || null,
      special_instructions: specialInstructions || null
    };

    try {
      const response = await apiPost('/orders', orderData);

      if (!response.success) {
        alert(response.message || 'Failed to place order. Please try again.');
        setLoading(false);
        return;
      }

      const newOrderId = response.orderId;

      // Keep localStorage record for client-side order history
      const orders = JSON.parse(localStorage.getItem('qronos_orders') || '[]');
      orders.push({ ...orderData, orderId: newOrderId, status: 'confirmed' });
      localStorage.setItem('qronos_orders', JSON.stringify(orders));

      localStorage.removeItem('qronos_cart');

      setLoading(false);
      setShowQRModal(false);
      setShowCardForm(false);

      navigate('/order-confirmation', {
        state: {
          orderId: newOrderId,
          cartTotal: cartTotal,
          paymentMethod: paymentMethod,
          orderType: orderType
        }
      });
    } catch (error) {
      console.error('Order placement failed:', error);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleQRPaymentDone = async () => {
    setShowQRModal(false);
    setLoading(true);
    await processPayment();
    await placeOrder();
  };

  if (!cart || cart.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-bg"></div>
      
      <div className="checkout-wrapper">
        <div className="checkout-header">
          <button className="checkout-back" onClick={() => navigate(-1)}>← Back to Cart</button>
          <h1 className="checkout-title">Checkout</h1>
          <div className="checkout-step">Step 2 of 2</div>
        </div>

        <div className="checkout-main">
          {/* Left Panel - Customer Details */}
          <div className="customer-info-panel">
            <div className="info-card">
              <h3>{orderType === 'delivery' ? 'Delivery Details' : 'Contact Details'}</h3>
              <p className="info-subtitle">Please provide your contact information</p>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input type="text" name="name" placeholder="Enter your full name" value={customerDetails.name} onChange={handleInputChange} required />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" placeholder="10-digit mobile number" value={customerDetails.phone} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Email (Optional)</label>
                  <input type="email" name="email" placeholder="your@email.com" value={customerDetails.email} onChange={handleInputChange} />
                </div>
              </div>
              
              {orderType === 'delivery' && (
                <div className="form-group">
                  <label>Delivery Address *</label>
                  <textarea name="address" placeholder="Enter your full delivery address" value={customerDetails.address} onChange={handleInputChange} rows="3" required />
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Order Review */}
          <div className="order-review-panel">
            <div className="review-card">
              <h3>Order Review</h3>
              
              <div className="order-items">
                {cart.map(item => (
                  <div key={item.id} className="review-item">
                    <div className="review-item-info">
                      <span className="review-item-name">{item.name}</span>
                      <span className="review-item-qty">x{item.quantity}</span>
                    </div>
                    <span className="review-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-divider"></div>
              
              <div className="price-breakdown">
                <div className="price-row"><span>Subtotal</span><span>₹{(cartTotal - (cartTotal * 0.05) - (orderType === 'delivery' ? 40 : 0)).toFixed(2)}</span></div>
                {orderType === 'delivery' && <div className="price-row"><span>Delivery Fee</span><span>₹40</span></div>}
                <div className="price-row"><span>Tax (5% GST)</span><span>₹{(cartTotal * 0.05).toFixed(2)}</span></div>
              </div>
              
              <div className="order-divider"></div>
              
              <div className="total-row">
                <span>Total Amount</span>
                <span className="total-amount">₹{cartTotal.toFixed(2)}</span>
              </div>
              
              <div className="payment-summary">
                <div className="payment-method-box">
                  <span className="payment-label">Payment Method</span>
                  <span className="payment-value">
                    {paymentMethod === 'qr' ? '📱 QR Scan' : paymentMethod === 'cash' ? '💵 Cash on Delivery' : '💳 Card'}
                  </span>
                </div>
              </div>

              {/* Card Payment UI */}
              {showCardForm && (
                <div className="card-payment-section">
                  <h4 className="payment-section-title">Card Details</h4>
                  <div className="card-icons">
                    <span className="card-icon visa">VISA</span>
                    <span className="card-icon mastercard">Mastercard</span>
                    <span className="card-icon rupay">RuPay</span>
                  </div>
                  <div className="card-input-group">
                    <div className="card-input-field">
                      <label>Card Number</label>
                      <input type="text" name="number" placeholder="1234 5678 9012 3456" value={cardDetails.number} onChange={handleCardInputChange} maxLength="19" />
                    </div>
                    <div className="card-row">
                      <div className="card-input-field">
                        <label>Expiry Date</label>
                        <input type="text" name="expiry" placeholder="MM/YY" value={cardDetails.expiry} onChange={handleCardInputChange} maxLength="5" />
                      </div>
                      <div className="card-input-field">
                        <label>CVV</label>
                        <input type="password" name="cvv" placeholder="123" value={cardDetails.cvv} onChange={handleCardInputChange} maxLength="4" />
                      </div>
                    </div>
                    <div className="card-input-field">
                      <label>Cardholder Name</label>
                      <input type="text" name="name" placeholder="Name on card" value={cardDetails.name} onChange={handleCardInputChange} />
                    </div>
                  </div>
                  <button className="payment-submit-btn" onClick={handleCardPayment} disabled={loading}>
                    {loading ? 'Processing...' : `Pay ₹${cartTotal.toFixed(2)} via Card`}
                  </button>
                </div>
              )}

              {specialInstructions && (
                <div className="special-instructions-box">
                  <span>📝 Special Instructions</span>
                  <p>{specialInstructions}</p>
                </div>
              )}
              
              {/* ✅ CASH - Direct Place Order Button */}
              {paymentMethod === 'cash' && (
                <button className="cash-order-btn" onClick={handleCashOrder} disabled={loading}>
                  {loading ? 'Placing Order...' : `Place Order • ₹${cartTotal.toFixed(2)}`}
                </button>
              )}

              {/* ✅ QR SCAN - Proceed Button */}
              {paymentMethod === 'qr' && (
                <button className="qr-proceed-btn" onClick={handleQRPayment} disabled={loading}>
                  {loading ? 'Processing...' : `Pay via QR • ₹${cartTotal.toFixed(2)}`}
                </button>
              )}
              
              <p className="checkout-secure">🔒 Your information is secure with QRONOS</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="qr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="qr-modal-close" onClick={() => setShowQRModal(false)}>✕</button>
            <div className="qr-modal-content">
              <div className="qr-icon">📱</div>
              <h3>Scan QR Code to Pay</h3>
              <p>Pay ₹{cartTotal.toFixed(2)} using any UPI app</p>
              <div className="qr-code-display">
                {qrCodeUrl ? <img src={qrCodeUrl} alt="UPI QR Code" className="qr-code-image" /> : <div className="qr-code-loading">Generating QR Code...</div>}
              </div>
              <p className="qr-instruction">Scan with any UPI app (Google Pay, PhonePe, Paytm)</p>
              <div className="qr-buttons">
                <button className="qr-done-btn" onClick={handleQRPaymentDone}>Payment Done</button>
                <button className="qr-cancel-btn" onClick={() => setShowQRModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;