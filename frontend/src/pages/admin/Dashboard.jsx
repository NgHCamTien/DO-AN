import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      // Fetch products count
      const productsRes = await fetch('http://localhost:5000/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const productsData = await productsRes.json();
      
      setStats({
        products: productsData.count || productsData.products?.length || 0,
        orders: 0 // Will be implemented when orders API is ready
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use fallback data
      setStats({
        products: 8, // From seed data
        orders: 0
      });
    }
  };

  const fetchRecentOrders = async () => {
    try {
      // This will be implemented when orders are working
      // For now, use empty array
      setRecentOrders([]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setRecentOrders([]);
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Admin Header */}
      <header className="bg-green-800 text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">DTP Flower Shop - Quản trị</h1>
        </div>
        <div className="flex items-center gap-4">
          <span>{user?.name || 'Admin'}</span>
          <button 
            onClick={logout}
            className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </header>
      
      {/* Admin Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link to="/admin/dashboard" className="block py-2 px-4 rounded hover:bg-gray-100">
                  Tổng quan
                </Link>
              </li>
              <li>
                <Link to="/admin/products" className="block py-2 px-4 rounded hover:bg-gray-100">
                  Quản lý sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/admin/orders" className="block py-2 px-4 rounded bg-green-100 text-green-800 font-medium">
                  Quản lý đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/admin/categories" className="block py-2 px-4 rounded hover:bg-gray-100">
                  Quản lý danh mục
                </Link>
              </li>
              <li>
                <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-100 text-blue-700" target="_blank">
                  Xem trang web
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-6">Tổng quan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-green-800 mb-2">Sản phẩm</h3>
              <p className="text-3xl font-bold">{stats.products}</p>
              <Link to="/admin/products" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                Xem chi tiết →
              </Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-green-800 mb-2">Đơn hàng</h3>
              <p className="text-3xl font-bold">{stats.orders}</p>
              <Link to="/admin/orders" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
                Xem chi tiết →
              </Link>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">Đơn hàng gần đây</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-6 text-center">Đang tải...</div>
              ) : recentOrders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Chưa có đơn hàng nào
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map(order => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{order._id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{order.user?.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.totalPrice.toLocaleString('vi-VN')}₫
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;