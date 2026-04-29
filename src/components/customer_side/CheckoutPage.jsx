import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { apiPost } from '../../utils/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    cart,
    cartTotal,
    specialInstructions,
    paymentMethod,
    orderType: passedOrderType,
    restaurantId: passedRestaurantId,
    tableNumber: passedTableNumber,
  } = location.state || {};
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

  // Read any partially-typed checkout details that an earlier render saved.
  // This survives hot-reloads and brief unmounts so the form stays sticky.
  const readDraft = () => {
    try {
      const raw = localStorage.getItem('qronos_checkout_draft');
      if (!raw || raw === 'undefined' || raw === 'null') return {};
      return JSON.parse(raw) || {};
    } catch (_e) {
      return {};
    }
  };

  const readStoredUser = () => {
    try {
      const raw = localStorage.getItem('qronos_user');
      if (!raw || raw === 'undefined' || raw === 'null') return {};
      return JSON.parse(raw) || {};
    } catch (_e) {
      return {};
    }
  };

  const [customerDetails, setCustomerDetails] = useState(() => {
    const draft = readDraft();
    const u = readStoredUser();
    return {
      name: draft.name || u.name || '',
      phone: draft.phone || u.phone || '',
      email: draft.email || u.email || '',
      address: draft.address || u.address || '',
    };
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

  const handleInputChange = (e) => {
    const next = { ...customerDetails, [e.target.name]: e.target.value };
    setCustomerDetails(next);
    // Persist a draft on every keystroke so the typed values can be recovered
    // even if React state is wiped (hot-reload, modal-driven remount, etc.).
    try {
      localStorage.setItem('qronos_checkout_draft', JSON.stringify(next));
    } catch (_e) { /* ignore */ }
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
    // Resolve restaurantId from navigation state first (carried from cart) and
    // fall back to the customer-side localStorage key. Do NOT use the
    // restaurant-side login key (`restaurantId`) — that one belongs to the
    // restaurant operator and would route the order to the wrong restaurant.
    const rawRestaurantId =
      passedRestaurantId ?? localStorage.getItem('qronos_restaurant_id');
    const restaurantId = rawRestaurantId ? parseInt(rawRestaurantId, 10) : null;

    if (!restaurantId) {
      alert('No restaurant selected. Please pick a restaurant first.');
      navigate('/restaurant-select', { state: { orderType } });
      setLoading(false);
      return;
    }

    const tableNumber =
      passedTableNumber ?? localStorage.getItem('qronos_table') ?? null;

    const user = readStoredUser();
    const draft = readDraft();

    const subtotal = cartTotal - (cartTotal * 0.05) - (orderType === 'delivery' ? 40 : 0);
    const deliveryFee = orderType === 'delivery' ? 40 : 0;
    const tax = cartTotal * 0.05;

    // Resolve customer fields from every source we have so we never POST blank.
    // Order of precedence: typed form value → draft saved on keystroke → logged-in user.
    const pick = (...vals) => {
      for (const v of vals) {
        const t = (v == null ? '' : String(v)).trim();
        if (t) return t;
      }
      return '';
    };
    const finalCustomerName  = pick(customerDetails.name,  draft.name,  user.name);
    const finalCustomerPhone = pick(customerDetails.phone, draft.phone, user.phone);
    const finalCustomerAddr  = pick(customerDetails.address, draft.address, user.address);

    // Hard guard: still nothing → force the customer back to the form.
    if (!finalCustomerName) {
      alert('Please enter your name before placing the order.');
      setLoading(false);
      return;
    }
    if (!finalCustomerPhone) {
      alert('Please enter your phone number before placing the order.');
      setLoading(false);
      return;
    }

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
      customer_name: finalCustomerName,
      customer_phone: finalCustomerPhone,
      delivery_address: finalCustomerAddr || null,
      table_number: orderType === 'dinein' && tableNumber ? String(tableNumber) : null,
      special_instructions: specialInstructions || null
    };

    try {
      // Temporary debug: confirm what's actually being POSTed.
      console.log('[checkout] POST /orders payload =', orderData);
      const response = await apiPost('/orders', orderData);
      console.log('[checkout] POST /orders response =', response);

      if (!response.success) {
        alert(response.message || 'Failed to place order. Please try again.');
        setLoading(false);
        return;
      }

      const newOrderId = response.orderId;

      // Order placed — discard the keystroke-draft so it doesn't leak into a
      // future checkout for a different person.
      localStorage.removeItem('qronos_checkout_draft');

      // Keep localStorage record for client-side order history
      let orders = [];
      try {
        const rawOrders = localStorage.getItem('qronos_orders');
        if (rawOrders && rawOrders !== 'undefined' && rawOrders !== 'null') {
          orders = JSON.parse(rawOrders) || [];
        }
      } catch (_e) { orders = []; }
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