import React from 'react';
import { Routes, Route } from 'react-router-dom';
// Sửa đường dẫn này - component nằm trong components/product/
import ProtectedAdminRoute from '../components/product/ProtectedAdminRoute';

// Import all admin components
import AdminLogin from '../pages/admin/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminProducts from '../pages/admin/Products';
import AddProduct from '../pages/admin/AddProduct';
import EditProduct from '../pages/admin/EditProduct';
import AdminOrders from '../pages/admin/Orders';
import AdminCategories from '../pages/admin/Categories';
import AdminUsers from '../pages/admin/Users';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Public admin routes (login) */}
      <Route path="/login" element={<AdminLogin />} />
      
      {/* Protected admin routes */}
      <Route path="/dashboard" element={
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      } />
      
      <Route path="/products" element={
        <ProtectedAdminRoute>
          <AdminProducts />
        </ProtectedAdminRoute>
      } />
      
      <Route path="/products/new" element={
        <ProtectedAdminRoute>
          <AddProduct />
        </ProtectedAdminRoute>
      } />
      
      <Route path="/products/edit/:id" element={
        <ProtectedAdminRoute>
          <EditProduct />
        </ProtectedAdminRoute>
      } />
      
      <Route path="/orders" element={
        <ProtectedAdminRoute>
          <AdminOrders />
        </ProtectedAdminRoute>
      } />
      
      <Route path="/categories" element={
        <ProtectedAdminRoute>
          <AdminCategories />
        </ProtectedAdminRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedAdminRoute>
          <AdminUsers />
        </ProtectedAdminRoute>
      } />
    </Routes>
  );
};

export default AdminRoutes;