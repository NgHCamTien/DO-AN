import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ products: 0, orders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    setRecentOrders([]);
    setLoading(false);
  }, []);

  const fetchStats = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const res = await fetch('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats({
        products: data.count || data.products?.length || 0,
        orders: 0,
      });
    } catch {
      setStats({ products: 0, orders: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#2c2c2c] font-sans">
          <div className="min-h-screen bg-white text-[#2c2c2c] font-sans">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <span className="text-[#e06c7f]">🌸</span> TỔNG QUAN
          </h2>
          <p className="text-sm text-[#8b5e3c]">
            Xin chào, <span className="font-medium">{user?.name || 'Admin'}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { title: '🌷 Sản phẩm', count: stats.products, link: '/admin/products' },
            { title: '💌 Đơn hàng', count: stats.orders, link: '/admin/orders' },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-lg shadow-sm p-6 border border-[#f1e4da] hover:shadow-md transition"
            >
              <h3 className="text-base font-semibold mb-1">{item.title}</h3>
              <p className="text-4xl font-bold text-[#2c2c2c]">{item.count}</p>
              <Link
                to={item.link}
                className="text-sm text-[#8b5e3c] hover:text-[#e06c7f] mt-2 inline-block transition"
              >
                Xem chi tiết →
              </Link>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-[#f1e4da]">
          <div className="px-6 py-4 border-b border-[#f1e4da] flex items-center gap-2">
            <span>🕊️</span>
            <h3 className="text-base font-semibold">Đơn hàng gần đây</h3>
          </div>

          {loading ? (
            <div className="p-6 text-center text-[#8b5e3c]">Đang tải...</div>
          ) : recentOrders.length === 0 ? (
            <div className="p-6 text-center text-[#e06c7f] text-sm">
              Chưa có đơn hàng nào 🌸
            </div>
          ) : (
            <table className="min-w-full text-sm text-[#2c2c2c]">
              <thead className="bg-[#faf8f6] border-b border-[#f1e4da]">
                <tr>
                  {['Mã đơn', 'Khách hàng', 'Ngày đặt', 'Tổng tiền', 'Trạng thái'].map(
                    (col) => (
                      <th key={col} className="px-6 py-3 text-left font-semibold">
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-[#faf8f6] transition">
                    <td className="px-6 py-4">{order._id}</td>
                    <td className="px-6 py-4">{order.user?.name}</td>
                    <td className="px-6 py-4">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      {order.totalPrice.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#e06c7f22] text-[#2c2c2c]">
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
  );
};

export default AdminDashboard;
