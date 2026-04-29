import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';

// ============ COMMON COMPONENTS ============
import LandingChoicePage from './components/common/LandingChoicePage';

// ============ CUSTOMER SIDE COMPONENTS ============
import LandingPage from './components/customer_side/LandingPage';
import CustomerLoginPage from './components/customer_side/CustomerLoginPage';
import CustomerRegisterPage from './components/customer_side/CustomerRegisterPage';
import OrderTypePage from './components/customer_side/OrderTypePage';
import QRScanPage from './components/customer_side/QRScanPage';
import UnifiedMenuPage from './components/customer_side/UnifiedMenuPage';
import CartPage from './components/customer_side/CartPage';
import CheckoutPage from './components/customer_side/CheckoutPage';
import OrderTrackingPage from './components/customer_side/OrderTrackingPage';
import ProfilePage from './components/customer_side/ProfilePage';
import OrderConfirmationPage from './components/customer_side/OrderConfirmationPage'; // ✅ ADD THIS

// ============ RESTAURANT SIDE COMPONENTS ============
import RestLandingPage from './components/restaurant_side/rest_landingPage';
import RestLoginPage from './components/restaurant_side/rest_loginPage';
import RestRegisterPage from './components/restaurant_side/rest_register';
import OwnerDashboard from './components/restaurant_side/owner_dashboard';
import AdminDashboard from './components/restaurant_side/admin_dashboard';
import KitchenDisplay from './components/restaurant_side/kitchen_display';
import MenuManagement from './components/restaurant_side/menu_management';
import OrdersManagement from './components/restaurant_side/orders_management';
import StaffManagement from './components/restaurant_side/staff_management';
import ReportsPage from './components/restaurant_side/reports_page';

import './App.css';

function App() {
  return (
    <RestaurantProvider>
      <Router>
        <Routes>
          
          {/* ========== COMMON ROUTE ========== */}
          {/* Landing Choice Page - First Page of App */}
          <Route path="/" element={<LandingChoicePage />} />
          
          {/* ========== CUSTOMER SIDE FLOW ========== */}
          {/* Customer Landing & Auth */}
          <Route path="/customer-landing" element={<LandingPage />} />
          <Route path="/customer-login" element={<CustomerLoginPage />} />
          <Route path="/customer-register" element={<CustomerRegisterPage />} />
          
          {/* Customer Order Flow */}
          <Route path="/order-type" element={<OrderTypePage />} />
          <Route path="/scan-qr" element={<QRScanPage />} />
          <Route path="/menu" element={<UnifiedMenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} /> {/* ✅ ADD THIS ROUTE */}
          <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* ========== RESTAURANT SIDE FLOW ========== */}
          {/* Restaurant Landing & Auth */}
          <Route path="/restaurant" element={<RestLandingPage />} />
          <Route path="/restaurant-login" element={<RestLoginPage />} />
          <Route path="/restaurant-register" element={<RestRegisterPage />} />
          
          {/* Restaurant Dashboards */}
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/kitchen" element={<KitchenDisplay />} />
          
          {/* Restaurant Management */}
          <Route path="/restaurant/menu" element={<MenuManagement />} />
          <Route path="/restaurant/orders" element={<OrdersManagement />} />
          <Route path="/restaurant/staff" element={<StaffManagement />} />
          <Route path="/restaurant/reports" element={<ReportsPage />} />
          
          {/* ========== 404 - NOT FOUND ========== */}
          <Route path="*" element={
            <div className="not-found">
              <h2>404 - Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
              <button onClick={() => window.location.href = '/'}>Go to Home</button>
            </div>
          } />
          
        </Routes>
      </Router>
    </RestaurantProvider>
  );
}

export default App;