// src/utils/api.js
// Override via REACT_APP_API_URL at build time (e.g. "/api" for nginx reverse proxy on prod).
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get restaurant ID from URL or localStorage
export const getRestaurantId = () => {
  const params = new URLSearchParams(window.location.search);
  const restaurantParam = params.get('restaurantId') || params.get('r');
  if (restaurantParam) {
    localStorage.setItem('restaurantId', restaurantParam);
    return restaurantParam;
  }
  const stored = localStorage.getItem('restaurantId');
  if (stored) return stored;
  return '1';
};

// Main API caller with better error handling
export const apiCall = async (endpoint, options = {}) => {
  const restaurantId = getRestaurantId();
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-restaurant-id': restaurantId,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return { 
      success: false, 
      message: error.message,
      error: true 
    };
  }
};

// API helpers
export const apiGet = async (endpoint) => {
  return apiCall(endpoint, { method: 'GET' });
};

export const apiPost = async (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const apiPut = async (endpoint, data) => {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const apiDelete = async (endpoint) => {
  return apiCall(endpoint, { method: 'DELETE' });
};

// ========== RESTAURANT APIs ==========
export const getRestaurants = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return apiGet(`/restaurants${query ? `?${query}` : ''}`);
};

export const getRestaurantById = (id) => {
  return apiGet(`/restaurants/${id}`);
};

// ========== CATEGORY APIs ==========
export const getCategories = (params = {}) => {
  const query = new URLSearchParams({ status: 'active', ...params }).toString();
  return apiGet(`/categories${query ? `?${query}` : ''}`);
};

// ========== MENU APIs ==========
export const getMenu = (restaurantId, orderType = 'delivery') => {
  const query = new URLSearchParams({ 
    orderType, 
    isAvailable: 'true' 
  }).toString();
  return apiGet(`/restaurants/${restaurantId}/menu?${query}`);
};

export const getMenuItem = (id) => {
  return apiGet(`/menu/${id}`);
};

// ========== CART APIs ==========
export const getCart = (userId, restaurantId, orderType) => {
  const query = new URLSearchParams({ 
    restaurantId, 
    orderType 
  }).toString();
  return apiGet(`/cart/${userId}?${query}`);
};

export const syncCart = (data) => {
  return apiPost('/cart/sync', data);
};

// ========== ORDER APIs ==========
export const createOrder = (orderData) => {
  return apiPost('/orders/create', orderData);
};

export const getOrder = (id) => {
  return apiGet(`/orders/${id}`);
};

export const getUserOrders = (userId) => {
  return apiGet(`/orders/user/${userId}`);
};

// ========== USER APIs ==========
export const getUserDetails = (userId) => {
  return apiGet(`/users/${userId}`);
};

// ========== FALLBACK DATA (When Backend Not Ready) ==========
export const getFallbackCategories = () => {
  return {
    success: true,
    categories: [
      { id: 1, name: 'Starter', item_count: 8 },
      { id: 2, name: 'Main Course', item_count: 12 },
      { id: 3, name: 'Desserts', item_count: 6 },
      { id: 4, name: 'Beverages', item_count: 5 },
      { id: 5, name: 'Breads', item_count: 4 }
    ]
  };
};

export const getFallbackMenu = () => {
  return {
    success: true,
    menuItems: [
      { id: 1, name: 'Margherita Pizza', description: 'Classic cheese & tomato sauce', price: 299, takeaway_price: 269, category_id: 2, is_veg: true, is_popular: true, rating: 4.5, preparation_time: 12, is_available: true, image_url: { emoji: '🍕' } },
      { id: 2, name: 'Pepperoni Pizza', description: 'Spicy pepperoni with extra cheese', price: 399, takeaway_price: 359, category_id: 2, is_veg: false, is_popular: true, rating: 4.6, preparation_time: 15, is_available: true, image_url: { emoji: '🍕' } },
      { id: 3, name: 'Butter Chicken', description: 'Creamy tomato based chicken curry', price: 349, takeaway_price: 314, category_id: 2, is_veg: false, is_popular: true, rating: 4.8, preparation_time: 20, is_available: true, image_url: { emoji: '🍛' } }
    ]
  };
};

// Default export
export default { 
  getRestaurantId,
  getRestaurants,
  getRestaurantById,
  getCategories,
  getMenu, 
  getMenuItem,
  getCart,
  syncCart,
  createOrder, 
  getOrder,
  getUserOrders,
  getUserDetails,
  getFallbackCategories,
  getFallbackMenu,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiCall
};