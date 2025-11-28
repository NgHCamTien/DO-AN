import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // ✅ THÊM DÒNG NÀY
import AuthProvider from './context/AuthContext';
import CartProvider from './context/CartContext';

// Import components
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Profile from './pages/Profile';
import ThankYou from './pages/ThankYou';
import FacebookCallback from "./pages/FacebookCallback";
// Forgot / Reset password
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Admin
import AdminRoutes from './routes/AdminRoutes';
import AdminReviews from "./pages/admin/AdminReviews";
import AdminNotifications from "./pages/admin/AdminNotifications";
import SendEmailPage from "./pages/admin/SendEmailPage";
function App() {
  return (
    // ✅ Bọc toàn bộ app trong GoogleOAuthProvider
    <GoogleOAuthProvider clientId="113611760953-p18dbq9qh37ad9lnsrjvvu4uako8a9i1.apps.googleusercontent.com">
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
          
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/product" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/category/:slug" element={<ProductList />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/auth/facebook/callback" element={<FacebookCallback />} />

                {/* Admin pages email */}
                <Route path="/admin/email-send" element={<SendEmailPage />} />

                {/* Forgot / Reset password */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Admin routes */}
                <Route path="/admin/*" element={<AdminRoutes />} />
          
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
