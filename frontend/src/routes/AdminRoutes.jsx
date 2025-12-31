import React from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedAdminRoute from "./ProtectedAdminRoute";
import AdminLayout from "../layouts/AdminLayout";

// Auth
import AdminLogin from "../pages/Login";

// Dashboard
import AdminDashboard from "../pages/admin/Dashboard";

// Products
import AdminProducts from "../pages/admin/Products";
import AddProduct from "../pages/admin/AddProduct";
import EditProduct from "../pages/admin/EditProduct";

// Orders
import AdminOrders from "../pages/admin/AdminOrders";

// Categories
import AdminCategories from "../pages/admin/Categories";

// Users
import AdminUsers from "../pages/admin/AdminUsers";

// Notifications
import AdminNotifications from "../pages/admin/AdminNotifications";

// Reviews
import AdminReviews from "../pages/admin/AdminReviews";

// ⭐ Payment Proof Verification (QUAN TRỌNG – đã sửa)
import AdminPaymentRequests from "../pages/admin/AdminPaymentRequests";

// Email system
import EmailDashboard from "../pages/admin/EmailDashboard";
import SendEmailPage from "../pages/admin/SendEmailPage";
import EmailTemplates from "../pages/admin/EmailTemplates";
import EmailHistory from "../pages/admin/EmailHistoryPage";

// Chat Support
import AdminChat from "../pages/admin/AdminChat";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Public admin route (no sidebar) */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected admin routes (with sidebar) */}
      <Route
        path="/"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        {/* Dashboard */}
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Products */}
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AddProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />

        {/* Orders */}
        <Route path="orders" element={<AdminOrders />} />

        {/* Categories */}
        <Route path="categories" element={<AdminCategories />} />

        {/* Users */}
        <Route path="users" element={<AdminUsers />} />

        {/* Notifications */}
        <Route path="notifications" element={<AdminNotifications />} />

        {/* Reviews */}
        <Route path="reviews" element={<AdminReviews />} />

        {/* Payment requests */}
        <Route
          path="payment-requests"
          element={<AdminPaymentRequests />}
        />

        {/* Email system */}
        <Route path="email" element={<EmailDashboard />} />
        <Route path="email/send" element={<SendEmailPage />} />
        <Route path="email/templates" element={<EmailTemplates />} />
        <Route path="email/history" element={<EmailHistory />} />

        {/* Chat */}
        <Route path="chat" element={<AdminChat />} />

      </Route>
    </Routes>
  );
};

export default AdminRoutes;
