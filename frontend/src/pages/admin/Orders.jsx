import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const response = await fetch("http://localhost:5000/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Không thể tải danh sách đơn hàng");
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipped: "Đang giao",
      delivered: "Đã giao",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: "bg-[#fff3cd] text-[#8b5e3c]",
      processing: "bg-[#dbeafe] text-[#1e3a8a]",
      shipped: "bg-[#ede9fe] text-[#6b21a8]",
      delivered: "bg-[#dcfce7] text-[#166534]",
      cancelled: "bg-[#fee2e2] text-[#b91c1c]",
    };
    return colorMap[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("vi-VN");

  return (
   <div className="min-h-screen bg-white text-[#2c2c2c] font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 -ml-2">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <span className="text-[#e06c7f]">📦</span> QUẢN LÝ ĐƠN HÀNG
        </h2>
        <button
          onClick={fetchOrders}
          className="bg-[#e06c7f] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#c85b70] transition"
        >
          Làm mới
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-[#ffe6e9] text-[#c85b70] px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#e06c7f]"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#faf8f6] rounded-lg border border-[#f1e4da] p-10 text-center text-[#8b5e3c]">
          <p className="text-lg mb-2">Chưa có đơn hàng nào 🌸</p>
          <p className="text-sm text-[#8b5e3c99]">
            Đơn hàng sẽ hiển thị ở đây khi khách hàng đặt mua sản phẩm.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-[#f1e4da] overflow-hidden">
          <table className="min-w-full text-sm text-[#2c2c2c]">
            <thead className="bg-[#faf8f6] border-b border-[#f1e4da]">
              <tr>
                {[
                  "Mã đơn",
                  "Khách hàng",
                  "Ngày đặt",
                  "Tổng tiền",
                  "Trạng thái",
                ].map((col) => (
                  <th key={col} className="px-6 py-3 text-left font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-[#faf8f6] transition-colors"
                >
                  <td className="px-6 py-4 font-medium">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div>{order.user?.name || "Khách hàng"}</div>
                    <div className="text-xs text-gray-500">
                      {order.user?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4 font-medium">
                    {order.totalPrice?.toLocaleString("vi-VN")}₫
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
