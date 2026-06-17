import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppContext } from './context/AppContext';

// Shared Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import RoleSwitcher from './components/common/RoleSwitcher';

// Customer Pages
import Home from './pages/user/Home';
import Shop from './pages/user/Shop';
import ProductDetails from './pages/user/ProductDetails';
import Cart from './pages/user/Cart';
import Wishlist from './pages/user/Wishlist';
import Checkout from './pages/user/Checkout';
import OrderTracking from './pages/user/OrderTracking';
import Profile from './pages/user/Profile';
import Auth from './pages/user/Auth';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Delivery Pages
import DeliveryLogin from './pages/delivery/DeliveryLogin';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

import './App.css';

function App() {
  const { activeRole, currentUser } = useContext(AppContext);
  const location = useLocation();

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Route Gating Redirects
  const isAuthRoute = location.pathname === '/auth';
  const isDeliveryLoginRoute = location.pathname === '/delivery/login';
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDeliveryRoute = location.pathname === '/delivery';

  // 1. Unauthenticated users (except for login pages) get sent to /auth
  if (!currentUser && !isAuthRoute && !isDeliveryLoginRoute) {
    return <Navigate to="/auth" replace />;
  }

  // 2. Authenticated users trying to go to /auth
  if (currentUser && isAuthRoute) {
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (currentUser.role === 'delivery') {
      return <Navigate to="/delivery" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // 3. Admin routes require admin role
  if (isAdminRoute && currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // 4. Delivery routes require delivery or admin role
  if (isDeliveryRoute && currentUser?.role !== 'delivery' && currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-viewport-wrapper">
      {/* Dynamic Navbar */}
      <Navbar />

      {/* Main Pages Content */}
      <main className="app-main-content-area">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-tracking/:orderId" element={<OrderTracking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth" element={<Auth />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Admin tab routes shortcut */}
          <Route path="/admin/products" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminDashboard />} />
          <Route path="/admin/coupons" element={<AdminDashboard />} />
          {/* Delivery Routes */}
          <Route path="/delivery/login" element={<DeliveryLogin />} />
          <Route path="/delivery" element={<DeliveryDashboard />} />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Dynamic Footer */}
      <Footer />

      {/* Floating Sandbox Developer widget - Restricted to Admin role only */}
      {currentUser?.role === 'admin' && <RoleSwitcher />}
    </div>
  );
}

export default App;
