import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MenuPage from './components/MenuPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmation from './components/OrderConfirmation';
import OrderTracking from './components/OrderTracking';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfilePage from './components/ProfilePage';
import MyOrdersPage from './components/MyOrdersPage';
import AdminDashboard from './components/AdminDashboard';
import KitchenDisplay from './components/KitchenDisplay';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import OffersPage from './components/OffersPage';
import OrderTypePage from './components/OrderTypePage';
import QRScanPage from './components/QRScanPage';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/offers" element={<OffersPage />} />
        
        {/* ✅ Customer Flow */}
        <Route path="/order-type" element={<OrderTypePage />} />
        <Route path="/scan-qr" element={<QRScanPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/track/:orderId" element={<OrderTracking />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        
        {/* Kitchen Routes */}
        <Route path="/kitchen" element={<KitchenDisplay />} />
      </Routes>
    </Router>
  );
}

export default App;