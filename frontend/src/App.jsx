import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import CartProvider from './context/CartContext';

// Import components
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Profile from './pages/Profile'; // THÊM IMPORT NÀY
import ThankYou from './pages/ThankYou';

// ============ THÊM IMPORT CHO FORGOT/RESET PASSWORD ============
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Import admin routes
import AdminRoutes from './routes/AdminRoutes';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/product" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              
              {/* THÊM ROUTE CHO CATEGORY*/}
              <Route path="/category/:slug" element={<ProductList />} />
              
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} /> {/* THÊM ROUTE NÀY */}
              <Route path="/thank-you" element={<ThankYou />} />
              
              {/* ============ THÊM ROUTES CHO FORGOT/RESET PASSWORD ============ */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* Admin routes */}
              <Route path="/admin/*" element={<AdminRoutes />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;