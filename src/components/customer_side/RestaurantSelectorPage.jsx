// src/components/customer_side/RestaurantSelectorPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiGet } from '../../utils/api';
import './RestaurantSelectorPage.css';

const ORDER_TYPE_LABELS = {
  takeaway: 'Take Away',
  delivery: 'Delivery',
  dinein: 'Dine In',
};

// Fallback restaurant images keyed by cuisine type (lowercased substring match).
// When a restaurant doesn't have its own image_url uploaded, we fall back to a
// curated Unsplash photo that loosely matches its cuisine.
const CUISINE_IMAGE_MAP = [
  { match: ['pizza', 'italian'],   url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
  { match: ['burger', 'fast'],     url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80' },
  { match: ['indian', 'curry'],    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80' },
  { match: ['chinese', 'asian'],   url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800&q=80' },
  { match: ['sushi', 'japanese'],  url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80' },
  { match: ['mexican', 'taco'],    url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80' },
  { match: ['cafe', 'coffee'],     url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' },
  { match: ['dessert', 'bakery', 'ice cream', 'sweet'], url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=800&q=80' },
  { match: ['biryani', 'mughlai'], url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80' },
  { match: ['south indian', 'dosa'], url: 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=800&q=80' },
  { match: ['fine dining', 'continental'], url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80' },
];

// Generic fallbacks rotated by restaurant id so different restaurants don't
// all show the same placeholder.
const GENERIC_FALLBACKS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
];

const resolveRestaurantImage = (r) => {
  if (r.image_url && /^https?:\/\//i.test(r.image_url)) return r.image_url;
  const cuisine = (r.cuisine_type || '').toLowerCase();
  if (cuisine) {
    const hit = CUISINE_IMAGE_MAP.find((row) =>
      row.match.some((kw) => cuisine.includes(kw))
    );
    if (hit) return hit.url;
  }
  const idx = Math.abs(Number(r.id) || 0) % GENERIC_FALLBACKS.length;
  return GENERIC_FALLBACKS[idx];
};

const RestaurantSelectorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const orderType =
    location.state?.orderType ||
    localStorage.getItem('qronos_order_type') ||
    'takeaway';
  const deliveryAddress =
    location.state?.deliveryAddress ||
    localStorage.getItem('deliveryAddress') ||
    '';

  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await apiGet('/restaurants');
      if (cancelled) return;
      if (res?.error || res?.success === false) {
        setError(res?.message || 'Failed to load restaurants');
        setRestaurants([]);
      } else {
        const list = Array.isArray(res) ? res : res?.restaurants || [];
        setRestaurants(list);
        setError(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = restaurants.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.name || '').toLowerCase().includes(q) ||
      (r.cuisine_type || '').toLowerCase().includes(q) ||
      (r.address || '').toLowerCase().includes(q)
    );
  });

  const pickRestaurant = (r) => {
    localStorage.setItem('qronos_restaurant_id', String(r.id));
    localStorage.setItem('qronos_restaurant_name', r.name || '');

    navigate('/menu', {
      state: {
        orderType,
        restaurantId: r.id,
        restaurantName: r.name,
        deliveryAddress,
      },
    });
  };

  return (
    <div className="rsel-container">
      <div className="rsel-card">
        <button className="rsel-back" onClick={() => navigate('/order-type')}>
          ← Back
        </button>

        <div className="rsel-header">
          <span className="rsel-mode-badge">
            {ORDER_TYPE_LABELS[orderType] || 'Order'}
          </span>
          <h1>Choose a Restaurant</h1>
          <p>
            {orderType === 'delivery'
              ? 'Pick a restaurant to deliver from.'
              : orderType === 'takeaway'
              ? 'Pick a restaurant to order takeaway from.'
              : 'Pick a restaurant.'}
          </p>
          {orderType === 'delivery' && deliveryAddress && (
            <div className="rsel-address">📍 {deliveryAddress}</div>
          )}
        </div>

        <div className="rsel-search">
          <input
            type="text"
            placeholder="Search by name, cuisine, or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <div className="rsel-state">Loading restaurants...</div>}

        {!loading && error && (
          <div className="rsel-state rsel-error">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rsel-state">
            {restaurants.length === 0
              ? 'No restaurants registered yet.'
              : 'No restaurants match your search.'}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="rsel-grid">
            {filtered.map((r) => (
              <button
                key={r.id}
                type="button"
                className="rsel-item"
                onClick={() => pickRestaurant(r)}
              >
                <div className="rsel-item-thumb">
                  <img
                    src={resolveRestaurantImage(r)}
                    alt={r.name}
                    loading="lazy"
                    onError={(e) => {
                      // If the cuisine/curated image fails, fall back to a
                      // deterministic generic image — still better than emoji.
                      const idx = Math.abs(Number(r.id) || 0) % GENERIC_FALLBACKS.length;
                      e.currentTarget.src = GENERIC_FALLBACKS[idx];
                    }}
                  />
                </div>
                <div className="rsel-item-body">
                  <div className="rsel-item-name">{r.name}</div>
                  {r.cuisine_type && (
                    <div className="rsel-item-cuisine">{r.cuisine_type}</div>
                  )}
                  <div className="rsel-item-meta">
                    {r.rating != null && (
                      <span className="rsel-rating">★ {Number(r.rating).toFixed(1)}</span>
                    )}
                    {r.timings && <span className="rsel-timings">{r.timings}</span>}
                  </div>
                  {r.address && (
                    <div className="rsel-item-address">📍 {r.address}</div>
                  )}
                </div>
                <div className="rsel-item-cta">View Menu →</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSelectorPage;
