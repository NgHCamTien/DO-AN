import React, { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const STATUS_LABEL = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
};

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    pendingOrders: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH DATA
  // =========================
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [productsRes, ordersRes, usersRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/orders`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      const usersData = await usersRes.json();

      const orders = ordersData.data || [];

      setStats({
        products: productsData.count || productsData.products?.length || 0,
        orders: orders.length,
        users: usersData.length || 0,
        pendingOrders: orders.filter((o) => o.status === "pending").length,
      });

      const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setRecentOrders(sortedOrders.slice(0, 5));
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <div className="p-6">⏳ Đang tải tổng quan...</div>;
  }

  return (
    <div className="p-6 bg-[#faf8f6] min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🌸 TỔNG QUAN CỬA HÀNG
        </h1>
        <p className="text-sm text-[#8b5e3c]">
          Xin chào,{" "}
          <span className="font-semibold">
            {user?.name || "Admin"}
          </span>
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          {
            title: "🌷 Sản phẩm",
            value: stats.products,
            link: "/admin/products",
          },
          {
            title: "💌 Đơn hàng",
            value: stats.orders,
            link: "/admin/orders",
          },
          {
            title: "👤 Người dùng",
            value: stats.users,
            link: "/admin/users",
          },
          {
            title: "⏳ Chờ xử lý",
            value: stats.pendingOrders,
            link: "/admin/orders",
          },
        ].map((item) => (
          <Link
            to={item.link}
            key={item.title}
            className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition"
          >
            <h3 className="text-sm text-gray-600 mb-2">
              {item.title}
            </h3>
            <p className="text-3xl font-bold text-[#2c2c2c]">
              {item.value}
            </p>
          </Link>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <div className="p-4 border-b font-semibold flex items-center gap-2">
          💐 Đơn hàng gần đây
        </div>

        {recentOrders.length === 0 ? (
          <p className="p-6 text-gray-500">
            Chưa có đơn hàng nào.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Mã đơn</th>
                <th className="p-3 text-left">Khách hàng</th>
                <th className="p-3">Ngày đặt</th>
                <th className="p-3">Tổng tiền</th>
                <th className="p-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">
                    #{order._id.slice(-6)}
                  </td>
                  <td className="p-3">
                    {order.user?.name || "Ẩn danh"}
                  </td>
                  <td className="p-3 text-center">
                    {new Date(order.createdAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </td>
                  <td className="p-3 text-center font-semibold text-[#e06c7f]">
                    {order.totalPrice.toLocaleString("vi-VN")}₫
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-3 py-1 rounded-full text-xs bg-pink-100 text-pink-700">
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
