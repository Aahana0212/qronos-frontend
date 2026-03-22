import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    // Add to cart
    const addToCart = (item) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id);
            
            if (existingItem) {
                return prevItems.map(i =>
                    i.id === item.id 
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                );
            } else {
                return [...prevItems, { ...item, quantity: 1 }];
            }
        });
        setCartOpen(true);
    };

    // Remove from cart
    const removeFromCart = (itemId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    // Update quantity
    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(itemId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId 
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        );
    };

    // Calculate total
    const cartTotal = cartItems.reduce(
        (sum, item) => sum + (item.price * item.quantity), 
        0
    );

    const itemCount = cartItems.reduce(
        (sum, item) => sum + item.quantity, 
        0
    );

    return (
        <CartContext.Provider value={{
            cartItems,
            cartOpen,
            setCartOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            cartTotal,
            itemCount
        }}>
            {children}
        </CartContext.Provider>
    );
};