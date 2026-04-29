import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [orderType, setOrderType] = useState('delivery');
  const [tableNumber, setTableNumber] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('cash');

  useEffect(() => {
    loadCart();
    const savedOrderType = localStorage.getItem('qronos_order_type') || 'delivery';
    const savedTable = localStorage.getItem('qronos_table') || null;
    setOrderType(savedOrderType);
    setTableNumber(savedTable);
  }, []);

  const loadCart = () => {
    const savedCart = localStorage.getItem('qronos_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    setLoading(false);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }
    
    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('qronos_cart', JSON.stringify(updatedCart));
  };

  const removeItem = (itemId) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    localStorage.setItem('qronos_cart', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setCart([]);
      localStorage.removeItem('qronos_cart');
    }
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = orderType === 'delivery' && cartSubtotal > 500 ? 0 : (orderType === 'delivery' ? 40 : 0);
  const tax = cartSubtotal * 0.05;
  const cartTotal = cartSubtotal + deliveryFee + tax;

  // ✅ UPI option removed - only Cash, QR Scan, Card
  const paymentOptions = [
    { id: 'cash', name: 'Cash', icon: '💵', description: 'Pay with cash on delivery/pickup' },
    { id: 'qr', name: 'QR Scan', icon: '📱', description: 'Scan QR code to pay via UPI' },
    { id: 'card', name: 'Card', icon: '💳', description: 'Credit/Debit Card payment' }
  ];

  const handleProceedToCheckout = () => {
    // Carry restaurantId and tableNumber forward so checkout posts them to the
    // backend — without these the order can't be routed to the right restaurant.
    const restaurantId = localStorage.getItem('qronos_restaurant_id');
    const restaurantName = localStorage.getItem('qronos_restaurant_name') || '';

    if (!restaurantId) {
      alert('No restaurant selected. Please pick a restaurant first.');
      navigate('/restaurant-select', { state: { orderType } });
      return;
    }

    navigate('/checkout', {
      state: {
        cart,
        cartTotal,
        specialInstructions,
        paymentMethod: selectedPayment,
        orderType: orderType,
        restaurantId,
        restaurantName,
        tableNumber,
      },
    });
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="cart-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-content">
          <div className="cart-empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items yet</p>
          <button onClick={() => navigate('/menu')} className="cart-shop-btn">
            Browse Menu →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-bg"></div>
      
      <div className="cart-wrapper">
        {/* Header Section */}
        <div className="cart-header">
          <button className="cart-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          
          <div className="cart-title-section">
            <h1 className="cart-heading">Your Cart</h1>
            {orderType === 'dinein' && tableNumber && (
              <div className="cart-table-tag">🍽️ Table {tableNumber}</div>
            )}
            {orderType === 'takeaway' && (
              <div className="cart-order-tag">🥡 Takeaway Order</div>
            )}
            {orderType === 'delivery' && (
              <div className="cart-order-tag">🚚 Delivery Order</div>
            )}
          </div>
          
          <button className="cart-clear" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        {/* Main Content */}
        <div className="cart-main-content">
          {/* Left Panel - Cart Items */}
          <div className="cart-items-panel">
            <div className="cart-items-header">
              <div className="col-item">Item Details</div>
              <div className="col-price">Price</div>
              <div className="col-qty">Quantity</div>
              <div className="col-total">Total</div>
              <div className="col-action"></div>
            </div>
            
            <div className="cart-items-container">
              {cart.map(item => (
                <div key={item.id} className="cart-item-row">
                  <div className="col-item">
                    <div className="item-img-wrapper">
                      <img 
                        src={item.image || (item.isVeg 
                          ? 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg' 
                          : 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg')} 
                        alt={item.name}
                        className="item-img"
                      />
                    </div>
                    <div className="item-info">
                      <h3 className="item-name">{item.name}</h3>
                      <div className="item-tags">
                        <span className={`veg-tag ${item.isVeg ? 'veg' : 'non-veg'}`}>
                          {item.isVeg ? '🌱 Veg' : '🍗 Non-Veg'}
                        </span>
                        <span className="rating-tag">⭐ {item.rating || 4.5}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-price">
                    <span className="price-value">₹{item.price}</span>
                  </div>
                  
                  <div className="col-qty">
                    <div className="qty-control">
                      <button 
                        className="qty-btn minus" 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="qty-num">{item.quantity}</span>
                      <button 
                        className="qty-btn plus" 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="col-total">
                    <span className="total-value">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  
                  <div className="col-action">
                    <button className="remove-item" onClick={() => removeItem(item.id)}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Order Summary */}
          <div className="cart-summary-panel">
            <div className="summary-card">
              <div className="summary-header">
                <h3>Order Summary</h3>
                <p>Review your order details</p>
              </div>
              
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal.toFixed(2)}</span>
                </div>
                
                {deliveryFee > 0 && (
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                )}
                
                <div className="summary-row">
                  <span>Tax (5% GST)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-total">
                <span>Total Amount</span>
                <span className="total-price">₹{cartTotal.toFixed(2)}</span>
              </div>
              
              {/* ✅ Payment Options - UPI removed */}
              <div className="payment-section">
                <h4 className="payment-title">Select Payment Method</h4>
                <div className="payment-options">
                  {paymentOptions.map(option => (
                    <div
                      key={option.id}
                      className={`payment-option ${selectedPayment === option.id ? 'active' : ''}`}
                      onClick={() => setSelectedPayment(option.id)}
                    >
                      <div className="payment-option-icon">{option.icon}</div>
                      <div className="payment-option-info">
                        <div className="payment-option-name">{option.name}</div>
                        <div className="payment-option-desc">{option.description}</div>
                      </div>
                      <div className="payment-option-check">
                        {selectedPayment === option.id && <span>✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="instructions-box">
                <textarea
                  placeholder="Add special instructions (e.g., no onions, extra spicy)..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows="3"
                />
              </div>
              
              <button 
                className="checkout-button" 
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout →
              </button>
              
              <div className="secure-badge">
                🔒 Secure checkout • Protected by QRONOS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;