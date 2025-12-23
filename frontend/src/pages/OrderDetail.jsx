import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

import Header from "../components/common/Header";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const API_BASE = "http://localhost:5000";
const API_URL = `${API_BASE}/api/orders`;

const statusText = {
  processing: "Đang xử lý",
  shipped: "Đang giao hàng",
  delivered: "Đã giao",
  cancelled: "Đã huỷ",
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchOrder();
    // eslint-disable-next-line
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setOrder(res.data.data || res.data);
    } catch (err) {
      alert("Không tìm thấy đơn hàng");
      navigate("/payment-tracking");
    } finally {
      setLoading(false);
    }
  };

const toImageUrl = (img) => {
  if (!img) return null;

  // nếu backend đã trả URL đầy đủ
  if (img.startsWith("http")) return img;

  // nếu lưu "uploads/xxx.jpg" hoặc "xxx.jpg"
  return `http://localhost:5000/${img.replace(/^\/+/, "")}`;
};

  if (loading) {
    return (
      <>
        <Header />
        <Navbar />
        <div className="p-10 text-center">Đang tải đơn hàng...</div>
        <Footer />
      </>
    );
  }

  if (!order) return null;

return (
  <>
    <Header />
    <Navbar />

    <main className="bg-[#fff] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4">
        {/* ===== TITLE ===== */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#4b2c35]">
          📦 Chi tiết đơn hàng #{order._id.slice(-6).toUpperCase()}
        </h1>

        {/* ===== STATUS + TIMELINE ===== */}
        <div className="bg-white rounded-xl p-5 border border-pink-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div className="text-lg font-semibold text-[#4b2c35]">
              Trạng thái:{" "}
              <span className="text-[#e06c7f]">
                {statusText[order.status] || order.status}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleString("vi-VN")}
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#e06c7f]" />
            <div className="flex-1 h-[2px] bg-pink-200" />
            <div
              className={`w-3 h-3 rounded-full ${
                order.status !== "processing"
                  ? "bg-[#e06c7f]"
                  : "bg-pink-200"
              }`}
            />
            <div className="flex-1 h-[2px] bg-pink-200" />
            <div
              className={`w-3 h-3 rounded-full ${
                order.status === "delivered"
                  ? "bg-[#e06c7f]"
                  : "bg-pink-200"
              }`}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Đặt hàng</span>
            <span>Đang giao</span>
            <span>Hoàn tất</span>
          </div>
        </div>

        {/* ===== PRODUCTS ===== */}
        <div className="bg-white rounded-xl p-5 border border-pink-100 mb-6">
          <h2 className="font-semibold text-lg mb-4 text-[#4b2c35]">
            🛍️ Sản phẩm
          </h2>

          <div className="space-y-4">
            {order.orderItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 border-b border-pink-100 pb-4 last:border-b-0"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden border bg-white">
                  {item.image ? (
                    <img
                      src={toImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-gray-400 flex items-center justify-center h-full">
                      Không có ảnh
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-medium text-[#4b2c35]">
                    {item.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Số lượng: {item.quantity}
                  </div>
                </div>

                <div className="font-semibold text-[#e06c7f]">
                  {(item.price * item.quantity).toLocaleString("vi-VN")}₫
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== SHIPPING + PAYMENT ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* SHIPPING */}
          {/* ===== RECEIVER INFO ===== */}
          <div className="bg-white rounded-xl p-5 border border-pink-100 h-full">
            <h2 className="font-semibold text-lg mb-3 text-[#4b2c35]">
              👤 Người nhận
            </h2>

            <div className="text-sm text-gray-700 space-y-1">
              <div>
                <b>Họ tên:</b>{" "}
                {order.shippingAddress?.fullName || "—"}
              </div>
              <div>
                <b>Số điện thoại:</b>{" "}
                {order.shippingAddress?.phone || "—"}
              </div>
              <div>
                <b>Địa chỉ giao hàng:</b>{" "}
                {order.shippingAddress?.address || "—"}
              </div>
            </div>
          </div>
          {/* PAYMENT */}
          <div className="bg-white rounded-xl p-5 border border-pink-100 h-full">

            <h2 className="font-semibold text-lg mb-3 text-[#4b2c35]">
              💳 Thanh toán
            </h2>

            <div className="text-sm text-gray-700 space-y-1">
              <div>
                <b>Phương thức:</b>{" "}
                {order.paymentMethod === "COD"
                  ? "Thanh toán khi nhận hàng"
                  : "Chuyển khoản qua mã QR"}
              </div>

              {order.paymentMethod !== "COD" && (
                <div className="text-xs text-gray-500 mt-1">
                  * Đơn hàng được xác nhận sau khi shop kiểm tra giao dịch
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== TOTAL ===== */}
        <div className="bg-white rounded-xl p-5 border border-pink-100 flex justify-between items-center mb-6">
          <span className="font-semibold text-lg text-[#4b2c35]">
            Tổng tiền
          </span>
          <span className="text-2xl font-bold text-[#e06c7f]">
            {order.totalPrice.toLocaleString("vi-VN")}₫
          </span>
        </div>

        {/* ===== BACK ===== */}
        <button
          onClick={() => navigate("/payment-tracking")}
          className="text-[#e06c7f] hover:underline"
        >
          ← Quay lại theo dõi thanh toán
        </button>
      </div>
    </main>

    <Footer />
  </>
);
};

export default OrderDetail;