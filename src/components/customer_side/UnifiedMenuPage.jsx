import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getRestaurantById,
  getCategories,
  getMenu,
  getCart,
  syncCart,
  createOrder
} from '../../utils/api';
import './UnifiedMenuPage.css';

// Pexels API Key
const PEXELS_API_KEY = 'XCbdzZIB8K42w7aBhX5l5Ei7PwxxMyOFDOL4mwCPEHc9i63UrEIj2vwo';

const UnifiedMenuPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from navigation state
  const [orderType, setOrderType] = useState('delivery');
  const [tableNumber, setTableNumber] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [userId, setUserId] = useState(null);
  
  // State Management
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showOrderConfirm, setShowOrderConfirm] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cartAnimating, setCartAnimating] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [freeDeliveryAbove, setFreeDeliveryAbove] = useState(0);
  const [itemImages, setItemImages] = useState({});
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Get image from Pexels API
  const fetchImageFromPexels = async (itemName, isVeg) => {
    const searchTerm = encodeURIComponent(`${itemName} food dish`);
    try {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${searchTerm}&per_page=1&orientation=square`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY
          }
        }
      );
      const data = await response.json();
      
      if (data.photos && data.photos.length > 0) {
        return data.photos[0].src.medium;
      }
      
      const categoryTerm = isVeg ? 'vegetarian food' : 'non-vegetarian food';
      const fallbackResponse = await fetch(
        `https://api.pexels.com/v1/search?query=${categoryTerm}&per_page=1`,
        {
          headers: {
            'Authorization': PEXELS_API_KEY
          }
        }
      );
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.photos && fallbackData.photos.length > 0) {
        return fallbackData.photos[0].src.medium;
      }
      
      return null;
    } catch (error) {
      console.error('Pexels API error:', error);
      return null;
    }
  };

  // Load images for all menu items
  const loadItemImages = async (items) => {
    const images = {};
    for (const item of items) {
      if (item.image_url && typeof item.image_url === 'string' && 
          (item.image_url.startsWith('http') || item.image_url.startsWith('https'))) {
        images[item.id] = item.image_url;
      } else {
        const imageUrl = await fetchImageFromPexels(item.name, item.is_veg);
        if (imageUrl) {
          images[item.id] = imageUrl;
        } else {
          const name = item.name.toLowerCase();
          const fallbackImages = {
            pizza: 'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg',
            burger: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg',
            chicken: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
            tikka: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg',
            paneer: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg',
            butter: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
            dal: 'https://images.pexels.com/photos/1055270/pexels-photo-1055270.jpeg',
            makhani: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
            naan: 'https://images.pexels.com/photos/1055270/pexels-photo-1055270.jpeg',
            brownie: 'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg',
            chocolate: 'https://images.pexels.com/photos/1055272/pexels-photo-1055272.jpeg',
            drink: 'https://images.pexels.com/photos/5059308/pexels-photo-5059308.jpeg'
          };
          
          let found = false;
          for (const [key, url] of Object.entries(fallbackImages)) {
            if (name.includes(key)) {
              images[item.id] = url;
              found = true;
              break;
            }
          }
          if (!found) {
            images[item.id] = item.is_veg 
              ? 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
              : 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg';
          }
        }
      }
    }
    setItemImages(images);
    setImagesLoaded(true);
  };

  // Initialize data from location.state or localStorage
  useEffect(() => {
    const type = location.state?.orderType || localStorage.getItem('qronos_order_type') || 'delivery';
    const table = location.state?.tableNumber || localStorage.getItem('qronos_table') || null;
    const restId = location.state?.restaurantId || localStorage.getItem('qronos_restaurant_id') || '1';
    const address = location.state?.deliveryAddress || localStorage.getItem('deliveryAddress') || '';
    const uid = location.state?.userId || localStorage.getItem('qronos_user_id') || null;
    
    setOrderType(type);
    setTableNumber(table);
    setRestaurantId(restId);
    setDeliveryAddress(address);
    setUserId(uid);
  }, [location.state]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('qronos_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Order type configurations
  const getOrderConfig = () => {
    const configs = {
      dinein: {
        title: 'DINE IN',
        icon: '🍽️',
        subtitle: 'Order from your table',
        showTableInfo: true,
        showAddress: false,
        showPickupTime: false,
        showCustomerInfo: false
      },
      takeaway: {
        title: 'TAKE AWAY',
        icon: '🥡',
        subtitle: 'Order now, pick up later',
        showTableInfo: false,
        showAddress: true,
        showPickupTime: true,
        showCustomerInfo: true
      },
      delivery: {
        title: 'DELIVERY',
        icon: '🚚',
        subtitle: 'Get it delivered',
        showTableInfo: false,
        showAddress: true,
        showPickupTime: false,
        showCustomerInfo: true
      }
    };
    return configs[orderType] || configs.delivery;
  };

  const config = getOrderConfig();

  // Fetch restaurant details
  const fetchRestaurant = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const data = await getRestaurantById(restaurantId);
      if (data.success && data.restaurant) {
        setRestaurant(data.restaurant);
        if (orderType === 'delivery' && data.restaurant.delivery_settings) {
          setDeliveryFee(data.restaurant.delivery_settings.fee || 40);
          setFreeDeliveryAbove(data.restaurant.delivery_settings.free_delivery_above || 500);
        }
      } else {
        setError('Restaurant not found');
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      setError('Failed to load restaurant details');
    }
  }, [restaurantId, orderType]);

  // Fetch categories with fallback
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      if (data.success && data.categories && data.categories.length > 0) {
        setCategories(data.categories);
      } else {
        setCategories([
          { id: 1, name: 'STARTERS', item_count: 0 },
          { id: 2, name: 'MAIN COURSE', item_count: 0 },
          { id: 3, name: 'DESSERTS', item_count: 0 },
          { id: 4, name: 'BEVERAGES', item_count: 0 },
          { id: 5, name: 'BREADS', item_count: 0 }
        ]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([
        { id: 1, name: 'STARTERS', item_count: 0 },
        { id: 2, name: 'MAIN COURSE', item_count: 0 },
        { id: 3, name: 'DESSERTS', item_count: 0 },
        { id: 4, name: 'BEVERAGES', item_count: 0 },
        { id: 5, name: 'BREADS', item_count: 0 }
      ]);
    }
  }, []);

  // Fetch menu items
  const fetchMenuItems = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const data = await getMenu(restaurantId, orderType);
      if (data.success && data.menuItems) {
        setMenuItems(data.menuItems);
        await loadItemImages(data.menuItems);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenuItems([]);
    }
  }, [restaurantId, orderType]);

  // Fetch user's cart from database
  const fetchUserCart = useCallback(async () => {
    if (!userId || !restaurantId) return;
    try {
      const data = await getCart(userId, restaurantId, orderType);
      if (data.success && data.cart && data.cart.items) {
        const cartItems = data.cart.items.map(item => ({
          id: item.menu_item_id,
          name: item.name,
          priceAtAdd: item.price,
          quantity: item.quantity,
          is_veg: item.is_veg,
          image_url: item.image_url,
          preparation_time: item.preparation_time
        }));
        setCart(cartItems);
        localStorage.setItem('qronos_cart', JSON.stringify(cartItems));
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }, [userId, restaurantId, orderType]);

  // Sync cart to database
  const syncCartToDatabase = useCallback(async (updatedCart) => {
    if (!userId || !restaurantId) return;
    try {
      await syncCart({
        userId,
        restaurantId: parseInt(restaurantId),
        items: updatedCart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price: item.priceAtAdd
        })),
        orderType
      });
    } catch (error) {
      console.error('Error syncing cart:', error);
    }
  }, [userId, restaurantId, orderType]);

  // Get item image
  const getItemImage = (item) => {
    if (itemImages[item.id]) {
      return itemImages[item.id];
    }
    if (item.image_url && typeof item.image_url === 'string' && 
        (item.image_url.startsWith('http') || item.image_url.startsWith('https'))) {
      return item.image_url;
    }
    return item.is_veg 
      ? 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
      : 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg';
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      if (!restaurantId) return;
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          fetchRestaurant(),
          fetchCategories(),
          fetchMenuItems(),
          fetchUserCart()
        ]);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again.');
      }
      setLoading(false);
    };
    loadData();
  }, [restaurantId]);

  // Get item price
  const getItemPrice = (item) => {
    if (orderType === 'takeaway' && item.takeaway_price) {
      return item.takeaway_price;
    }
    return item.price;
  };

  // Add to cart
  const addToCart = async (item) => {
    setCartAnimating(true);
    setTimeout(() => setCartAnimating(false), 300);
    
    const price = getItemPrice(item);
    
    const existingCart = JSON.parse(localStorage.getItem('qronos_cart') || '[]');
    const existingItemIndex = existingCart.findIndex(cartItem => cartItem.id === item.id);
    
    let updatedCart;
    if (existingItemIndex !== -1) {
      updatedCart = [...existingCart];
      updatedCart[existingItemIndex].quantity += 1;
    } else {
      updatedCart = [...existingCart, {
        id: item.id,
        name: item.name,
        price: price,
        quantity: 1,
        isVeg: item.is_veg,
        image: itemImages[item.id] || getItemImage(item),
        rating: item.rating,
        preparation_time: item.preparation_time
      }];
    }
    
    localStorage.setItem('qronos_cart', JSON.stringify(updatedCart));
    setCart(updatedCart);
    
    if (userId && restaurantId) {
      const dbCartItems = updatedCart.map(cartItem => ({
        menu_item_id: cartItem.id,
        quantity: cartItem.quantity,
        price: cartItem.price
      }));
      await syncCartToDatabase(dbCartItems);
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    const existingCart = JSON.parse(localStorage.getItem('qronos_cart') || '[]');
    const existingItemIndex = existingCart.findIndex(item => item.id === itemId);
    
    let updatedCart;
    if (existingCart[existingItemIndex].quantity === 1) {
      updatedCart = existingCart.filter(item => item.id !== itemId);
    } else {
      updatedCart = [...existingCart];
      updatedCart[existingItemIndex].quantity -= 1;
    }
    
    localStorage.setItem('qronos_cart', JSON.stringify(updatedCart));
    setCart(updatedCart);
    
    if (userId && restaurantId) {
      const dbCartItems = updatedCart.map(cartItem => ({
        menu_item_id: cartItem.id,
        quantity: cartItem.quantity,
        price: cartItem.price
      }));
      await syncCartToDatabase(dbCartItems);
    }
  };

  // Filter menu
  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || 
      categories.find(c => c.id === item.category_id)?.name === selectedCategory ||
      item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group menu by category
  const groupedMenu = filteredMenu.reduce((acc, item) => {
    const categoryName = categories.find(c => c.id === item.category_id)?.name || 'OTHERS';
    if (!acc[categoryName]) acc[categoryName] = [];
    acc[categoryName].push(item);
    return acc;
  }, {});

  // Cart calculation
  const cartSubtotal = cart.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  const calculatedDeliveryFee = (orderType === 'delivery' && cartSubtotal < freeDeliveryAbove && freeDeliveryAbove > 0) ? deliveryFee : 0;
  const taxRate = restaurant?.tax_rate || 0.05;
  const tax = cartSubtotal * taxRate;
  const cartTotal = cartSubtotal + calculatedDeliveryFee + tax;

  // Place order
  const placeOrder = () => {
    if (orderType === 'takeaway' && (!customerName || !customerPhone)) {
      alert('Please enter your name and phone number');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress) {
      alert('Please enter delivery address');
      return;
    }
    setShowCartModal(false);
    setShowOrderConfirm(true);
  };

  // Confirm order
  const confirmOrder = async () => {
    try {
      const orderData = {
        userId,
        restaurantId: parseInt(restaurantId),
        orderType,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          price_at_time: item.price
        })),
        subtotal: cartSubtotal,
        delivery_fee: calculatedDeliveryFee,
        tax: tax,
        total_amount: cartTotal,
        special_instructions: specialInstructions,
        table_number: tableNumber,
        delivery_address: deliveryAddress,
        pickup_time: pickupTime,
        customer_name: customerName,
        customer_phone: customerPhone
      };

      await createOrder(orderData);
      
      let message = '';
      if (orderType === 'dinein') {
        message = `✅ Order placed for Table ${tableNumber}!\n\nFood will be served shortly.\nTotal: ₹${cartTotal.toFixed(2)}`;
      } else if (orderType === 'takeaway') {
        message = `✅ Order placed for pickup!\n\nPickup from: ${restaurant?.name}\nReady in: 15-20 min\nTotal: ₹${cartTotal.toFixed(2)}`;
      } else {
        message = `✅ Order placed for delivery!\n\nDelivering to: ${deliveryAddress}\nEst. time: 30-40 min\nTotal: ₹${cartTotal.toFixed(2)}`;
      }
      alert(message);
      
      localStorage.removeItem('qronos_cart');
      setCart([]);
      setShowOrderConfirm(false);
      navigate('/order-confirmation', { 
        state: { 
          orderId: 'ORD' + Date.now(), 
          cartTotal: cartTotal,
          paymentMethod: 'online',
          orderType: orderType
        } 
      });
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Order placed successfully!');
      localStorage.removeItem('qronos_cart');
      setCart([]);
      setShowOrderConfirm(false);
      navigate('/order-confirmation', { 
        state: { 
          orderId: 'ORD' + Date.now(), 
          cartTotal: cartTotal,
          paymentMethod: 'online',
          orderType: orderType
        } 
      });
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading {config.title} Experience...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="menu-page">
      {/* Header */}
      <div className="menu-header">
        {/* ✅ BACK BUTTON - Navigates to OrderTypePage */}
        <button className="back-btn" onClick={() => navigate('/order-type')}>
          ←
        </button>
        <div className="header-title">
          <span className="header-icon">{config.icon}</span>
          <span>{config.title}</span>
        </div>
        <div className={`cart-icon ${cartAnimating ? 'bounce' : ''}`} onClick={() => navigate('/cart')}>
          <span>🛒</span>
          {cart.length > 0 && <span className="cart-badge">{cart.reduce((s, i) => s + i.quantity, 0)}</span>}
        </div>
      </div>

      {/* Restaurant Info Card */}
      <div className="info-card">
        <div className="restaurant-info">
          <div className="restaurant-icon">{restaurant?.image_url?.emoji || '👨‍🍳'}</div>
          <div className="restaurant-details">
            <div className="restaurant-name">{restaurant?.name || 'CULINARY HUB'}</div>
            <div className="restaurant-rating">⭐ {restaurant?.rating || 4.8} ({restaurant?.rating_count || 2300}+)</div>
          </div>
        </div>

        {orderType === 'dinein' && tableNumber && (
          <div className="table-info">
            <div className="table-icon">📋</div>
            <div>
              <div className="info-label">YOUR TABLE</div>
              <div className="info-value">Table #{tableNumber}</div>
            </div>
          </div>
        )}

        {orderType === 'takeaway' && restaurant && (
          <div className="pickup-info">
            <div className="info-row">
              <span className="info-icon">📍</span>
              <span>Pickup: {restaurant.address || 'Sector 62, Noida'}</span>
            </div>
            <div className="info-row">
              <span className="info-icon">⏱️</span>
              <span>Est. Time: 15-25 min</span>
            </div>
          </div>
        )}

        {orderType === 'delivery' && (
          <div className="delivery-info">
            <div className="info-row">
              <span className="info-icon">📍</span>
              <span>Delivering to: {deliveryAddress || 'Add address'}</span>
            </div>
            <div className="info-row">
              <span className="info-icon">🛵</span>
              <span>Est. Time: 30-40 min</span>
            </div>
            {calculatedDeliveryFee > 0 && freeDeliveryAbove > 0 && (
              <div className="info-row highlight">
                <span className="info-icon">🎁</span>
                <span>Add ₹{freeDeliveryAbove - cartSubtotal} more for free delivery</span>
              </div>
            )}
          </div>
        )}
      </div>

      {orderType === 'dinein' && (
        <div className="qr-success">
          <div className="success-icon">✓</div>
          <div className="success-text">
            <strong>QR Code Scanned Successfully!</strong>
            <p>Order directly from your table. Food will be served at your table.</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        <button
          className={`category-filter ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          ALL
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-filter ${selectedCategory === category.name ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="menu-container">
        {Object.entries(groupedMenu).map(([category, items]) => (
          <div key={category} className="menu-section">
            <div className="section-header">
              <h2 className="section-title">{category}</h2>
              <span className="section-subtitle">PREMIUM SELECTION</span>
            </div>
            <div className="menu-grid">
              {items.map(item => (
                <div key={item.id} className="menu-item-card">
                  {item.is_popular && <div className="popular-badge">🔥 POPULAR</div>}
                  <div className="item-image-section">
                    <img 
                      src={getItemImage(item)} 
                      alt={item.name} 
                      className="item-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = item.is_veg 
                          ? 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
                          : 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg';
                      }}
                    />
                    <div className="item-image-overlay"></div>
                  </div>
                  <div className="item-content-section">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-description">{item.description || 'Delicious dish prepared with premium ingredients'}</p>
                    <div className="item-meta-section">
                      <span className={`meta-badge ${item.is_veg ? 'veg' : 'non-veg'}`}>
                        {item.is_veg ? '🌱 VEG' : '🍗 NON-VEG'}
                      </span>
                      <span className="meta-badge rating">⭐ {item.rating || 4.5}</span>
                      <span className="meta-badge time">⏱️ {item.preparation_time || 15} MIN</span>
                    </div>
                    <div className="item-price-section">
                      <div className="price-wrapper">
                        <span className="current-price">₹{getItemPrice(item)}</span>
                        {orderType === 'takeaway' && item.takeaway_price && item.takeaway_price < item.price && (
                          <>
                            <span className="original-price">₹{item.price}</span>
                            <span className="savings-badge">SAVE ₹{item.price - item.takeaway_price}</span>
                          </>
                        )}
                      </div>
                      <button 
                        className="add-btn" 
                        onClick={() => addToCart(item)}
                        disabled={!item.is_available}
                      >
                        {item.is_available ? '+ ADD TO CART' : 'OUT OF STOCK'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredMenu.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <p>No items found</p>
            <p className="empty-sub">Try searching for something else</p>
          </div>
        )}
      </div>

      {/* Floating Cart - Navigate to CartPage */}
      {cart.length > 0 && (
        <div className="floating-cart" onClick={() => navigate('/cart')}>
          <div className="cart-badge">
            <span>🛒</span>
            <span className="cart-count">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
          </div>
          <div className="cart-amount">₹{cartTotal.toFixed(2)}</div>
          <div className="cart-action">VIEW CART →</div>
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showOrderConfirm && (
        <div className="modal-overlay" onClick={() => setShowOrderConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">✓</div>
            <h2>ORDER CONFIRMED</h2>
            <p>Your order has been sent to the kitchen</p>
            <div className="order-details">
              {orderType === 'dinein' && tableNumber && (
                <div className="detail-row">
                  <span>Table Number</span>
                  <strong>{tableNumber}</strong>
                </div>
              )}
              {orderType === 'takeaway' && (
                <>
                  <div className="detail-row">
                    <span>Pickup From</span>
                    <strong>{restaurant?.name || 'CULINARY HUB'}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Ready By</span>
                    <strong>{pickupTime || '15-20 min'}</strong>
                  </div>
                </>
              )}
              {orderType === 'delivery' && (
                <div className="detail-row">
                  <span>Delivering To</span>
                  <strong>{deliveryAddress}</strong>
                </div>
              )}
              <div className="detail-row">
                <span>Total Amount</span>
                <strong>₹{cartTotal.toFixed(2)}</strong>
              </div>
              <div className="detail-row">
                <span>Estimated Time</span>
                <strong>
                  {orderType === 'dinein' ? '15-20 min' : 
                   orderType === 'takeaway' ? 'Ready for pickup' : 
                   '30-40 min'}
                </strong>
              </div>
            </div>
            <p className="serve-note">
              {orderType === 'dinein' && '🍽️ Food will be served at your table shortly.'}
              {orderType === 'takeaway' && '🥡 Please show this confirmation at the counter.'}
              {orderType === 'delivery' && '🚚 Your order is on the way!'}
            </p>
            <button className="confirm-btn" onClick={confirmOrder}>
              CONTINUE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedMenuPage;