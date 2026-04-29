import React, { createContext, useState, useContext, useEffect } from 'react';

const RestaurantContext = createContext();

export const useRestaurant = () => useContext(RestaurantContext);

export const RestaurantProvider = ({ children }) => {
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get restaurant ID from URL or localStorage
    const params = new URLSearchParams(window.location.search);
    let id = params.get('restaurantId') || params.get('r');
    
    if (!id) {
      id = localStorage.getItem('restaurantId');
    }
    
    if (!id) {
      id = '1'; // default
    }
    
    localStorage.setItem('restaurantId', id);
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