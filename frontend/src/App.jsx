import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import AuthProvider from "./context/AuthContext";
import CartProvider from "./context/CartContext";

// 🔔 TOAST
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ===== USER PAGES =====
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ThankYou from "./pages/ThankYou";
import WaitingVerify from "./pages/WaitingVerify";
import UserPaymentTracking from "./pages/UserPaymentTracking";
import OrderDetail from "./pages/OrderDetail";

// ===== COMMON =====
import Contact from "./components/common/Contact";
import About from "./pages/About";

// ===== AUTH =====
import FacebookCallback from "./pages/FacebookCallback";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ===== ADMIN =====
import AdminRoutes from "./routes/AdminRoutes";
import SendEmailPage from "./pages/admin/SendEmailPage";

function App() {
  return (
    <GoogleOAuthProvider clientId="113611760953-p18dbq9qh37ad9lnsrjvvu4uako8a9i1.apps.googleusercontent.com">
      <AuthProvider>
        <CartProvider>
          <Router
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <div className="App">
              {/* 🔔 TOAST */}
              <ToastContainer
                position="top-right"
                autoClose={2500}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
              />

              <Routes>
                {/* ===== PUBLIC ===== */}
                <Route path="/" element={<Home />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />

                <Route path="/product" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/category/:slug" element={<ProductList />} />

                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />

                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />

                <Route path="/thank-you" element={<ThankYou />} />

                {/* 👉 THEO DÕI THANH TOÁN */}
                <Route
                  path="/payment-tracking"
                  element={<UserPaymentTracking />}
                />

                {/* 👉 CHI TIẾT ĐƠN */}
                <Route path="/order/:id" element={<OrderDetail />} />

                {/* (OPTIONAL) CHỜ XÁC MINH */}
                <Route
                  path="/waiting-verify"
                  element={<WaitingVerify />}
                />

                {/* ===== AUTH ===== */}
                <Route
                  path="/auth/facebook/callback"
                  element={<FacebookCallback />}
                />
                <Route
                  path="/forgot-password"
                  element={<ForgotPassword />}
                />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />

                {/* ===== ADMIN ===== */}

                {/* Route gửi email cũ */}
                <Route
                  path="/admin/email-send"
                  element={<SendEmailPage />}
                />

                {/* Các route admin còn lại */}
                <Route
                  path="/admin/*"
                  element={<AdminRoutes />}
                />
              </Routes>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
