import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet } from '../../utils/api';
import './OrderTrackingPage.css';

// Map the backend `order_status` (set by kitchen / admin) to the step key the tracker UI uses.
// "ready" / "delivered" mean different things depending on order type, so the type matters.
const mapBackendStatus = (backendStatus, orderType) => {
  switch (backendStatus) {
    case 'pending':
    case 'confirmed':
      return 'confirmed';
    case 'preparing':
      return 'preparing';
    case 'ready':
      return 'ready';
    case 'out_for_delivery':
      return 'out-for-delivery';
    case 'delivered':
      if (orderType === 'dinein') return 'served';
      if (orderType === 'takeaway') return 'picked';
      return 'delivered';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'confirmed';
  }
};

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState(0);

  // Professional SVG Icons (inline SVGs)
  const icons = {
    confirmed: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    preparing: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6H8V4Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M6 6H18L17 20H7L6 6Z" stroke="currentColor" strokeWidth="2"/>
        <circle cx="9" cy="14" r="1" fill="currentColor"/>
        <circle cx="15" cy="14" r="1" fill="currentColor"/>
      </svg>
    ),
    ready: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15 7H9L12 2Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M5 9L9 12L5 15" stroke="currentColor" strokeWidth="2"/>
        <path d="M19 9L15 12L19 15" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    served: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H20V10C20 12.2091 18.2091 14 16 14H8C5.79086 14 4 12.2091 4 10V4Z" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 14V20" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 14V20" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 2V4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    delivery: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="2"/>
        <circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M5 18H3V8H16L19 12H21V18H19" stroke="currentColor" strokeWidth="2"/>
        <path d="M16 8V12H19" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    pickup: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M7 10H17" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 14H12" stroke="currentColor" strokeWidth="2"/>
      </svg>
    )
  };

  // Order status steps
  const orderSteps = [
    { status: 'confirmed', label: 'Order Confirmed', icon: icons.confirmed, description: 'Your order has been received' },
    { status: 'preparing', label: 'Preparing', icon: icons.preparing, description: 'Chef is preparing your food' },
    { status: 'ready', label: 'Ready', icon: icons.ready, description: 'Your order is ready' },
    { status: 'out-for-delivery', label: 'Out for Delivery', icon: icons.delivery, description: 'Rider is on the way' },
    { status: 'delivered', label: 'Delivered', icon: icons.confirmed, description: 'Order delivered successfully' }
  ];

  // Dine In steps
  const dineInSteps = [
    { status: 'confirmed', label: 'Order Confirmed', icon: icons.confirmed, description: 'Order sent to kitchen' },
    { status: 'preparing', label: 'Preparing', icon: icons.preparing, description: 'Chef is preparing' },
    { status: 'ready', label: 'Ready', icon: icons.ready, description: 'Food is ready' },
    { status: 'served', label: 'Served', icon: icons.served, description: 'Food served at your table' }
  ];

  // Takeaway steps
  const takeawaySteps = [
    { status: 'confirmed', label: 'Order Confirmed', icon: icons.confirmed, description: 'Order received' },
    { status: 'preparing', label: 'Preparing', icon: icons.preparing, description: 'Preparing your order' },
    { status: 'ready', label: 'Ready for Pickup', icon: icons.pickup, description: 'Your order is ready' },
    { status: 'picked', label: 'Picked Up', icon: icons.confirmed, description: 'Order picked up' }
  ];

  useEffect(() => {
    loadOrder();
    // Poll backend every 5s so kitchen / admin status changes show up live.
    const interval = setInterval(() => loadOrder({ silent: true }), 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const loadOrder = async ({ silent = false } = {}) => {
    // 1) Try backend (authoritative).
    try {
      const resp = await apiGet(`/orders/${orderId}`);
      if (resp && resp.success && resp.order) {
        const o = resp.order;
        const orderType = o.order_type;
        const liveOrder = {
          // shape the UI reads
          orderId: o.order_id,
          orderType,
          status: mapBackendStatus(o.order_status, orderType),
          total: Number(o.total_amount),
          orderDate: o.created_at,
          paymentMethod: o.payment_method,
          customerDetails: {
            name: o.customer_name,
            phone: o.customer_phone,
            address: o.delivery_address,
          },
          items: (resp.items || []).map(it => ({
            name: it.name,
            quantity: it.quantity,
            price: Number(it.price_at_time),
          })),
          // keep backend fields too for shape-agnostic helpers
          order_status: o.order_status,
          total_amount: o.total_amount,
          created_at: o.created_at,
        };
        setOrder(liveOrder);
        if (!silent) setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Order fetch failed, falling back to localStorage:', e?.message || e);
    }

    // 2) Fallback to localStorage entry (offline / unknown order).
    if (!silent) {
      const orders = JSON.parse(localStorage.getItem('qronos_orders') || '[]');
      const foundOrder = orders.find(o => o.orderId === orderId);
      setOrder(foundOrder || null);
      setLoading(false);
    }
  };

  const getSteps = () => {
    if (!order) return dineInSteps;
    if (order.orderType === 'dinein') return dineInSteps;
    if (order.orderType === 'takeaway') return takeawaySteps;
    return orderSteps;
  };

  const steps = getSteps();
  const currentStepIndex = steps.findIndex(s => s.status === order?.status) || 0;
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // CheckoutPage and the API use snake_case (total_amount, price_at_time) while older entries
  // may use camelCase (total, price). Normalize so the UI never crashes on undefined.
  const toMoney = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : '0.00';
  };
  const orderTotal = order?.total ?? order?.total_amount ?? order?.cartTotal ?? 0;
  const orderDate = order?.orderDate ?? order?.created_at ?? Date.now();
  const orderItems = Array.isArray(order?.items) ? order.items : [];
  const itemPrice = (it) => Number(it?.price ?? it?.price_at_time ?? 0);
  const itemQty = (it) => Number(it?.quantity ?? 1);
  const itemName = (it) => it?.name || `Item #${it?.menu_item_id ?? ''}`;

  if (loading) {
    return (
      <div className="tracking-loading">
        <div className="tracking-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="tracking-not-found">
        <div className="not-found-content">
          <div className="not-found-icon">🔍</div>
          <h2>Order Not Found</h2>
          <p>We couldn't find your order. Please check the order ID.</p>
          <button onClick={() => navigate('/order-type')} className="go-home-btn">Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tracking-page">
      <div className="tracking-bg"></div>
      
      <div className="tracking-wrapper">
        {/* Header */}
        <div className="tracking-header">
          <button className="tracking-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 className="tracking-title">Track Your Order</h1>
          <div className="tracking-order-badge">#{order.orderId}</div>
        </div>

        {/* Order Info Card */}
        <div className="order-info-card">
          <div className="order-status-badge">
            <span className={`status-label ${order.status}`}>
              {order.status === 'confirmed' && '📋 Order Confirmed'}
              {order.status === 'preparing' && '👨‍🍳 Preparing'}
              {order.status === 'ready' && '🍽️ Ready'}
              {order.status === 'out-for-delivery' && '🛵 Out for Delivery'}
              {order.status === 'delivered' && '✅ Delivered'}
              {order.status === 'served' && '🍽️ Served'}
              {order.status === 'picked' && '✅ Picked Up'}
            </span>
          </div>
          
          <div className="order-details-row">
            <div className="order-detail">
              <span className="detail-label">Order Date</span>
              <span className="detail-value">{new Date(orderDate).toLocaleString()}</span>
            </div>
            <div className="order-detail">
              <span className="detail-label">Total Amount</span>
              <span className="detail-value">₹{toMoney(orderTotal)}</span>
            </div>
            <div className="order-detail">
              <span className="detail-label">Payment Method</span>
              <span className="detail-value">
                {order.paymentMethod === 'qr' ? '📱 QR Scan' : 
                 order.paymentMethod === 'cash' ? '💵 Cash' : 
                 order.paymentMethod === 'card' ? '💳 Card' : '🏦 UPI'}
              </span>
            </div>
            <div className="order-detail">
              <span className="detail-label">Order Type</span>
              <span className="detail-value">
                {order.orderType === 'dinein' ? '🍽️ Dine In' : 
                 order.orderType === 'takeaway' ? '🥡 Takeaway' : '🚚 Delivery'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Section with SVG Icons */}
        <div className="progress-section">
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <div className="progress-steps">
            {steps.map((step, index) => (
              <div key={step.status} className={`progress-step ${index <= currentStepIndex ? 'completed' : ''} ${index === currentStepIndex ? 'active' : ''}`}>
                <div className="step-icon-wrapper">
                  <div className="step-icon-svg">
                    {step.icon}
                  </div>
                  <div className="step-status-dot"></div>
                </div>
                <div className="step-label">{step.label}</div>
                <div className="step-desc">{step.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items Card */}
        <div className="order-items-card">
          <h3>Order Items</h3>
          <div className="items-list">
            {orderItems.length === 0 ? (
              <div className="order-item"><div className="item-info"><div className="item-name">No item details</div></div></div>
            ) : (
              orderItems.map((item, idx) => (
                <div key={idx} className="order-item">
                  <div className="item-info">
                    <div className="item-name">{itemName(item)}</div>
                    <div className="item-meta">
                      {('isVeg' in (item || {})) && (
                        <span className={`item-veg ${item.isVeg ? 'veg' : 'non-veg'}`}>
                          {item.isVeg ? '🌱 Vegetarian' : '🍗 Non-Veg'}
                        </span>
                      )}
                      <span className="item-quantity">Quantity: {itemQty(item)}</span>
                    </div>
                  </div>
                  <div className="item-price">₹{toMoney(itemPrice(item) * itemQty(item))}</div>
                </div>
              ))
            )}
          </div>

          <div className="items-total">
            <span>Total Amount</span>
            <span>₹{toMoney(orderTotal)}</span>
          </div>
        </div>

        {/* Service Info Card */}
        {order.orderType === 'dinein' && (
          <div className="service-info-card">
            <div className="service-icon-svg">{icons.served}</div>
            <div className="service-details">
              <div className="service-label">Table Service</div>
              <div className="service-message">Food will be served at your table shortly</div>
            </div>
          </div>
        )}

        {order.orderType === 'takeaway' && (
          <div className="service-info-card pickup">
            <div className="service-icon-svg">{icons.pickup}</div>
            <div className="service-details">
              <div className="service-label">Pickup Information</div>
              <div className="service-message">Please show your order ID at the counter</div>
            </div>
          </div>
        )}

        {order.orderType === 'delivery' && order.customerDetails?.address && (
          <div className="service-info-card delivery">
            <div className="service-icon-svg">{icons.delivery}</div>
            <div className="service-details">
              <div className="service-label">Delivery Address</div>
              <div className="service-message">{order.customerDetails.address}</div>
              <div className="service-contact">📞 {order.customerDetails.phone} | 👤 {order.customerDetails.name}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="tracking-actions">
          <button onClick={() => navigate('/menu')} className="reorder-btn">
            🔄 Reorder Items
          </button>
          <button onClick={() => navigate('/order-type')} className="home-btn">
            🏠 Go to Home
          </button>
        </div>

        {/* Help Section */}
        <div className="help-section">
          <p>📞 Need help? Contact our support team at <strong>+91 98765 43210</strong></p>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;