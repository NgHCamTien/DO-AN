import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
    </div>;
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" />;
  }
  
  return children;
};

export default ProtectedAdminRoute;