import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../utils/storage';
import './MenuPage.css';

const MenuPage = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('Popular');
  const [displayLimit, setDisplayLimit] = useState(20);
  const [user, setUser] = useState(null);
  const [orderType, setOrderType] = useState('dinein');
  const [tableNumber, setTableNumber] = useState(null);
  const [imageCache, setImageCache] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

  // Category groups
  const categoryGroups = {
    'Popular': ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Fast Food', 'Biryani', 'Pizza', 'Burger', 'Momos', 'Rolls'],
    'Indian': ['North Indian', 'South Indian', 'Mughlai', 'Rajasthani', 'Gujarati', 'Bengali', 'Hyderabadi', 'Lucknowi', 'Kashmiri', 'Goan', 'Punjabi', 'Andhra', 'Chettinad', 'Maharashtrian', 'Awadhi', 'Sindhi', 'Parsi'],
    'Chinese': ['Chinese', 'Momos', 'Noodles', 'Dim Sum', 'Szechuan', 'Hunan', 'Asian', 'Burmese', 'Pan Asian'],
    'Italian': ['Italian', 'Pizza', 'Pasta', 'Risotto', 'Lasagna', 'Mediterranean'],
    'Continental': ['Continental', 'French', 'Greek', 'Spanish', 'Portuguese', 'German', 'British', 'Australian'],
    'Asian': ['Thai', 'Japanese', 'Korean', 'Vietnamese', 'Malaysian', 'Indonesian', 'Singaporean', 'Tibetan', 'Mongolian', 'Filipino'],
    'Fast Food': ['Fast Food', 'Burger', 'Pizza', 'Sandwich', 'Rolls', 'Wraps', 'Hot dogs', 'Finger Food', 'Tex-Mex', 'Mexican'],
    'Beverages': ['Beverages', 'Coffee', 'Juices', 'Tea', 'Soft Drinks', 'Mocktails', 'Cocktails', 'Bubble Tea', 'Drinks Only'],
    'Desserts': ['Desserts', 'Ice Cream', 'Bakery', 'Mithai', 'Pastries', 'Cakes', 'Waffles', 'Pancakes', 'Sweets'],
    'Seafood': ['Seafood', 'Fish', 'Prawns', 'Crab', 'Lobster'],
    'Street Food': ['Street Food', 'Chaat', 'Pav Bhaji', 'Vada Pav', 'Samosa', 'Kebab', 'Chole Bhature'],
    'Healthy': ['Salad', 'Raw Meats', 'Organic', 'Gluten Free', 'Vegan', 'Healthy Food'],
    'BBQ & Grill': ['BBQ', 'Grill', 'Tandoor', 'Kebab', 'Charcoal Chicken'],
    'Middle Eastern': ['Middle Eastern', 'Lebanese', 'Turkish', 'Moroccan', 'African', 'Afghan', 'Iranian'],
    'Others': []
  };

  const getInitials = (name) => {
    if (!name) return '👤';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getBadgeText = () => {
    if (orderType === 'dinein' && tableNumber) {
      return `Table ${tableNumber}`;
    } else if (orderType === 'takeaway') {
      return 'Takeaway';
    } else if (orderType === 'delivery') {
      return 'Delivery';
    }
    return 'Restaurant';
  };

  // Fetch image from backend
  const fetchImage = async (dishName) => {
    if (imageCache[dishName]) return;
    if (loadingImages[dishName]) return;
    
    setLoadingImages(prev => ({ ...prev, [dishName]: true }));
    
    try {
      const response = await fetch(`http://localhost:5000/api/images/food/${encodeURIComponent(dishName)}`);
      const data = await response.json();
      
      if (data.success && data.url) {
        setImageCache(prev => ({ ...prev, [dishName]: data.url }));
      }
    } catch (error) {
      console.error('Error fetching image:', error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [dishName]: false }));
    }
  };

  useEffect(() => {
    // Get user
    const userData = localStorage.getItem('qronos_user');
    if (userData && userData !== 'undefined') {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {}
    }

    // Get order type
    const savedOrderType = localStorage.getItem('qronos_order_type');
    if (savedOrderType && savedOrderType !== 'undefined') {
      setOrderType(savedOrderType);
    }

    // Get table number for dine in
    if (savedOrderType === 'dinein') {
      const savedTable = localStorage.getItem('qronos_table');
      if (savedTable && savedTable !== 'undefined') {
        setTableNumber(savedTable);
      } else {
        navigate('/scan-qr');
        return;
      }
    }

    // Load cart
    const savedCart = localStorage.getItem('qronos_cart');
    if (savedCart && savedCart !== 'undefined') {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }

    fetchData();
  }, []);

  // Load images when items change
  useEffect(() => {
    if (menuItems.length > 0) {
      const visibleItems = getFilteredItems();
      visibleItems.forEach(item => {
        fetchImage(item.name);
      });
    }
  }, [menuItems, activeCategory, searchTerm]);

  const fetchData = async () => {
    try {
      const catRes = await fetch('http://localhost:5000/api/menu/categories');
      const catData = await catRes.json();

      const allCategories = [
        { id: 'all', name: 'All', icon: '🍽️' },
        ...catData.map(cat => ({
          id: cat.id.toString(),
          name: cat.name,
          icon: getCategoryIcon(cat.name)
        }))
      ];
      setCategories(allCategories);

      const itemRes = await fetch('http://localhost:5000/api/menu/items?limit=100');
      const itemData = await itemRes.json();
      setMenuItems(itemData);

    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('north indian') || n.includes('punjabi')) return '🍛';
    if (n.includes('south indian') || n.includes('dosa')) return '🥘';
    if (n.includes('chinese') || n.includes('noodles')) return '🥢';
    if (n.includes('italian') || n.includes('pizza')) return '🍕';
    if (n.includes('fast food') || n.includes('burger')) return '🍔';
    if (n.includes('beverages') || n.includes('coffee')) return '🥤';
    if (n.includes('desserts') || n.includes('ice cream')) return '🍰';
    if (n.includes('seafood') || n.includes('fish')) return '🐟';
    if (n.includes('kebab') || n.includes('tandoor')) return '🍗';
    return '🍽️';
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item.id);
      let updatedCart;
      
      if (existingItem) {
        updatedCart = prevCart.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        const category = categories.find(c => c.id === item.category_id.toString());
        const newItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: getCategoryIcon(category?.name),
          category: category?.name || 'Other',
          orderType: orderType,
          tableNumber: orderType === 'dinein' ? tableNumber : null
        };
        updatedCart = [...prevCart, newItem];
      }

      localStorage.setItem('qronos_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
    setCartOpen(true);
  };

  const getGroupCategories = () => {
    if (selectedGroup === 'All') return categories.filter(c => c.id !== 'all');
    const groupNames = categoryGroups[selectedGroup] || [];
    return categories.filter(c => c.id !== 'all' && groupNames.includes(c.name));
  };

  const displayCategories = getGroupCategories();

  const getFilteredItems = () => {
    return menuItems.filter(item => {
      const matchesCategory = activeCategory === 'all' ||
        item.category_id.toString() === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    }).slice(0, displayLimit);
  };

  if (loading) {
    return <div className="loading">Loading Menu...</div>;
  }

  return (
    <div className="menu-page">
      <header className="menu-header">
        <div className="header-content">
          <div className="logo" onClick={() => navigate('/')}>
            <h1>QRONOS</h1>
            <span className="badge">{getBadgeText()}</span>
          </div>
          <div className="header-actions">
            <button className="cart-btn" onClick={() => navigate('/cart')}>
              🛒 <span className="cart-count">{cart.length}</span>
            </button>
            {user ? (
              <div className="user-profile" onClick={() => navigate('/profile')}>
                <div className="user-avatar">{getInitials(user.name)}</div>
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </div>
            ) : (
              <button className="login-btn" onClick={() => navigate('/login')}>
                👤 Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {orderType === 'dinein' && tableNumber && (
        <div className="table-info-banner">
          <span>🍽️ Ordering from <strong>Table {tableNumber}</strong></span>
          <button className="change-table-btn" onClick={() => navigate('/scan-qr')}>
            Change Table
          </button>
        </div>
      )}

      <div className="menu-hero">
        <div className="hero-text">
          <h2>Our Menu</h2>
          <p>Discover {menuItems.length}+ delicious dishes</p>
        </div>
      </div>

      <div className="search-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search for dishes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="category-groups">
        <button className={`group-btn ${selectedGroup === 'Popular' ? 'active' : ''}`} onClick={() => { setSelectedGroup('Popular'); setActiveCategory('all'); }}>🔥 Popular</button>
        {Object.keys(categoryGroups).filter(g => g !== 'Popular' && g !== 'Others').map(group => (
          <button key={group} className={`group-btn ${selectedGroup === group ? 'active' : ''}`} onClick={() => { setSelectedGroup(group); setActiveCategory('all'); }}>{group}</button>
        ))}
        <button className={`group-btn ${selectedGroup === 'All' ? 'active' : ''}`} onClick={() => { setSelectedGroup('All'); setActiveCategory('all'); }}>📋 All Categories</button>
      </div>

      <div className="categories">
        <button className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`} onClick={() => setActiveCategory('all')}>
          <span className="cat-icon">🍽️</span><span className="cat-name">All</span>
        </button>
        {displayCategories.map(cat => (
          <button key={cat.id} className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)}>
            <span className="cat-icon">{cat.icon}</span><span className="cat-name">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="menu-grid-container">
        <div className="menu-grid">
          {getFilteredItems().map(item => {
            const category = categories.find(c => c.id === item.category_id.toString()) || { name: 'Other', icon: '🍽️' };
            return (
              <div key={item.id} className="menu-item-card">
                <div className="item-image">
                  {imageCache[item.name] ? (
                    <img src={imageCache[item.name]} alt={item.name} className="food-image" />
                  ) : (
                    <div className="image-placeholder">
                      <span className="placeholder-emoji">{category.icon}</span>
                    </div>
                  )}
                </div>
                <div className="item-details">
                  <span className="item-category">{category.name}</span>
                  <h3>{item.name}</h3>
                  <p className="item-desc">{item.description || 'Delicious dish'}</p>
                  <div className="item-footer">
                    <span className="item-price">₹{Number(item.price).toFixed(2)}</span>
                    <button className="add-btn" onClick={() => addToCart(item)}>Add to Cart</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {getFilteredItems().length >= displayLimit && menuItems.length > displayLimit && (
          <div className="load-more"><button onClick={() => setDisplayLimit(prev => prev + 20)}>Load More Items</button></div>
        )}
        {getFilteredItems().length === 0 && (<div className="no-results"><h3>No items found</h3><p>Try a different category or search term</p></div>)}
      </div>

      {cartOpen && (
        <>
          <div className="cart-overlay" onClick={() => setCartOpen(false)}></div>
          <div className="cart-sidebar">
            <div className="cart-header"><h2>Shopping Cart ({cart.length} items)</h2><button className="close-cart" onClick={() => setCartOpen(false)}>×</button></div>
            <div className="cart-items">
              {cart.length === 0 ? <div className="empty-cart">Your cart is empty</div> : cart.map(item => (
                <div key={item.id} className="cart-item"><span>{item.name} x{item.quantity}</span><span>₹{(item.price * item.quantity).toFixed(2)}</span></div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="cart-footer">
                <div className="cart-total"><span>Total:</span><span>₹{cart.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}</span></div>
                <button className="checkout-btn" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MenuPage;