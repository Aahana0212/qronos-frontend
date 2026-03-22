import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderType, setOrderType] = useState('dinein');
  const [tableNumber, setTableNumber] = useState(null);

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

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('qronos_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, loading]);

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) {
      removeItem(id);
      return;
    }
    setCartItems(items => items.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setCartItems([]);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05;
  const deliveryFee = orderType === 'delivery' ? (subtotal > 500 ? 0 : 40) : 0;
  const total = subtotal + tax + deliveryFee;

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

  if (loading) return <div className="loading">Loading cart...</div>;

  return (
    <div className="cart-page">
      <div className="cart-wrapper">
        {/* Header */}
        <div className="cart-header">
          <button className="back-link" onClick={() => navigate('/menu')}>← Continue Shopping</button>
          <h1>Your Cart</h1>
          {cartItems.length > 0 && (
            <button className="clear-cart" onClick={clearCart}>Clear Cart</button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items yet</p>
            <button className="browse-btn" onClick={() => navigate('/menu')}>Browse Menu</button>
          </div>
        ) : (
          <div className="cart-content">
            {/* Left Column - Cart Items */}
            <div className="cart-items-section">
              <div className="order-badge">
                <span className="order-icon">{getOrderIcon()}</span>
                <span className="order-label">{getOrderLabel()}</span>
                {orderType === 'dinein' && tableNumber && (
                  <span className="table-badge">Table {tableNumber}</span>
                )}
              </div>

              <div className="cart-items-list">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-image">
                      <span className="item-emoji">{item.image || '🍽️'}</span>
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <div className="item-meta">
                        <span className="item-category">{item.category || 'Dish'}</span>
                        <span className="item-price">₹{item.price}</span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <div className="quantity-selector">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <div className="item-total">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                      <button className="remove-item" onClick={() => removeItem(item.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="order-summary">
              <h3>Order Summary</h3>
              
              <div className="summary-items">
                {cartItems.map(item => (
                  <div key={item.id} className="summary-item">
                    <span className="summary-name">{item.name}</span>
                    <span className="summary-qty">x{item.quantity}</span>
                    <span className="summary-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>GST (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                {orderType === 'delivery' && (
                  <div className="total-row">
                    <span>Delivery Fee</span>
                    {deliveryFee === 0 ? <span className="free">FREE</span> : <span>₹{deliveryFee.toFixed(2)}</span>}
                  </div>
                )}
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {orderType === 'delivery' && subtotal > 500 && (
                <div className="free-delivery-tag">✨ Free delivery applied! You saved ₹40</div>
              )}

              <button className="checkout-btn" onClick={() => navigate('/checkout')}>
                Proceed to Checkout → ₹{total.toFixed(2)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;