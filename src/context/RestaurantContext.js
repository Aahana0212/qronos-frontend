import React, { createContext, useState, useContext, useEffect } from 'react';

const RestaurantContext = createContext();

export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider = ({ children }) => {
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Resolve restaurant id from URL (e.g. QR code links carry ?r=N) or from
    // a previous session in localStorage. Do NOT default to a hardcoded id —
    // that would silently bind every fresh visitor to restaurant #1, which
    // also clobbers a freshly-logged-in restaurant's session.
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('restaurantId') || params.get('r');
    const id = fromUrl || localStorage.getItem('restaurantId') || null;

    if (fromUrl) {
      localStorage.setItem('restaurantId', fromUrl);
    }

    setRestaurantId(id);
    setLoading(false);
  }, []);

  const switchRestaurant = (newId) => {
    localStorage.setItem('restaurantId', newId);
    setRestaurantId(newId);
    window.location.reload();
  };

  return (
    <RestaurantContext.Provider value={{ restaurantId, loading, switchRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
};