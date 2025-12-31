import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const API_URL = "http://localhost:5000/api";

const AdminOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ======================
  //  FETCH ALL ORDERS (FIX warning useEffect)
  // ======================
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/orders`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setOrders(res.data.data || []);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      alert("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ======================
  //  UPDATE STATUS
  // ======================
  const updateStatus = async (orderId, status) => {
    if (!window.confirm("Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng này không?"))
      return;

    try {
      await axios.put(
        `${API_URL}/orders/${orderId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      fetchOrders();
    } catch (err) {
      alert("Không thể cập nhật trạng thái!");
    }
  };

  // ======================
  //  CONFIRM PAYMENT
  // ======================
  const confirmPayment = async (orderId) => {
    if (!window.confirm("Xác nhận đơn hàng này đã được thanh toán?"))
      return;

    try {
      await axios.put(
        `${API_URL}/orders/${orderId}/confirm-payment`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Không thể xác nhận thanh toán!");
    }
  };

  // ======================
  //  UI HELPERS
  // ======================
  const renderStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100 font-semibold";
      case "processing":
        return "text-blue-600 bg-blue-100 font-semibold";
      case "shipped":
        return "text-purple-600 bg-purple-100 font-semibold";
      case "delivered":
        return "text-green-600 bg-green-100 font-bold";
      case "cancelled":
        return "text-red-600 bg-red-100 font-semibold";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "pending":
        return "Chờ xác nhận";
      case "processing":
        return "Đang xử lý";
      case "shipped":
        return "Đang giao";
      case "delivered":
        return "Đã giao";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const translatePaymentStatus = (status) => {
    if (status === "Paid") return "Đã thanh toán";
    return "Chưa thanh toán";
  };

  if (loading) return <p className="p-6">⏳ Đang tải đơn hàng...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>

      {/* FIX TRÀN BẢNG */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse shadow bg-white rounded-xl overflow-hidden">
          <thead className="bg-pink-100">
            <tr>
              <th className="p-3">Khách hàng</th>
              <th className="p-3">Sản phẩm</th>
              <th className="p-3">Tổng tiền</th>
              <th className="p-3">Thanh toán</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ngày tạo</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b hover:bg-pink-50">
                {/* USER */}
                <td className="p-3">
                  <b>{order.user?.name}</b>
                  <br />
                  <span className="text-sm text-gray-600">
                    {order.user?.email}
                  </span>
                </td>

                {/* ITEMS */}
                <td className="p-3">
                  {order.orderItems.map((item) => (
                    <div key={item._id}>
                      {item.name} × {item.quantity}
                    </div>
                  ))}
                </td>

                {/* PRICE */}
                <td className="p-3 text-red-600 font-bold">
                  {order.totalPrice.toLocaleString("vi-VN")}₫
                </td>

                {/* PAYMENT */}
                <td className="p-3">
                  <span className="font-semibold">
                    {order.paymentMethod}
                  </span>
                  <br />
                  <span
                    className={
                      order.paymentStatus === "Paid"
                        ? "text-green-600 font-bold"
                        : "text-gray-600"
                    }
                  >
                    {translatePaymentStatus(order.paymentStatus)}
                  </span>

                  {order.paymentMethod !== "COD" &&
                    order.paymentStatus !== "Paid" && (
                      <button
                        onClick={() => confirmPayment(order._id)}
                        className="block mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Xác nhận thanh toán
                      </button>
                    )}
                </td>

                {/* STATUS */}
                <td className="p-3 text-sm">
                  <div className="flex justify-center">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${renderStatusColor(
                        order.status
                      )}`}
                    >
                      {translateStatus(order.status)}
                    </span>
                  </div>
                </td>

                {/* DATE */}
                <td className="p-3 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </td>

                {/* ACTIONS */}
                <td className="p-3 text-center">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateStatus(order._id, e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipped">Đang giao</option>
                    <option value="delivered">Đã giao</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
