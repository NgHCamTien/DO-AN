// src/pages/Profile.jsx
import React, { useContext, useEffect, useState } from "react";
import Header from "../components/common/Header";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ===== LOAD MY ORDERS =====
  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user?.token) return;

      try {
        setLoadingOrders(true);
        const res = await axios.get(`${API_URL}/orders/myorders`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setOrders(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchMyOrders();
  }, [user?.token]);

  // ===== FORM HANDLERS =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage("");

    const payload = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
    };

    const result = await updateProfile(payload);
    if (result?.success || result === true) {
      setMessage("Cập nhật thông tin thành công!");
    } else {
      setMessage(result?.message || "Không thể cập nhật. Vui lòng thử lại.");
    }

    setSaving(false);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fff7f9]">
        <Header />
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="bg-white px-8 py-6 rounded-2xl shadow border border-pink-100 text-center">
            <p className="mb-2">Vui lòng đăng nhập để xem trang cá nhân.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fff]">
      <Header />
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#4b2c35] mb-6 text-center">
          Trang cá nhân
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT – THÔNG TIN TÀI KHOẢN */}
          <section className="lg:col-span-1 bg-white rounded-2xl shadow-md border border-pink-100 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-[#e06c7f] text-white flex items-center justify-center text-xl font-bold">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-[#4b2c35]">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="mt-1 text-xs inline-flex px-2 py-0.5 rounded-full bg-[#ffe9f0] text-[#e06c7f]">
                  {user.role === "admin" ? "Quản trị viên" : "Khách hàng thân thiết"}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              Cảm ơn bạn đã tin tưởng DDT Flower Shop. Bạn có thể cập nhật thông
              tin liên hệ và xem lại lịch sử đơn hàng ngay tại đây 🌸
            </p>

            <div className="mt-4 text-sm text-gray-600 space-y-1">
              {user.phone && <p>📞 {user.phone}</p>}
              {user.address && <p>📍 {user.address}</p>}
            </div>
          </section>

          {/* MIDDLE – FORM CHỈNH SỬA */}
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-pink-100 p-6">
            <h2 className="text-xl font-semibold text-[#4b2c35] mb-4">
              Cập nhật thông tin
            </h2>

            {message && (
              <div className="mb-4 text-sm px-4 py-2 rounded-lg border border-pink-200 bg-[#fff7fb] text-[#4b2c35]">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-pink-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#e06c7f]"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-pink-100 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Email dùng để đăng nhập, không thể thay đổi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#e06c7f]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-pink-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#e06c7f]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 rounded-full bg-[#e06c7f] text-white font-semibold hover:bg-[#cc5f72] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </form>
          </section>
        </div>

        {/* LỊCH SỬ ĐƠN HÀNG */}
        <section className="mt-8 bg-white rounded-2xl shadow-md border border-pink-100 p-6">
          <h2 className="text-xl font-semibold text-[#4b2c35] mb-4">
            Lịch sử đơn hàng
          </h2>

          {loadingOrders ? (
            <p className="text-sm text-gray-600">Đang tải đơn hàng...</p>
          ) : orders.length === 0 ? (
            <p className="text-sm text-gray-600">
              Bạn chưa có đơn hàng nào. Hãy đặt một bó hoa thật xinh nhé 🌷
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#faf0f4] text-left">
                    <th className="px-4 py-2">Mã đơn</th>
                    <th className="px-4 py-2">Ngày đặt</th>
                    <th className="px-4 py-2">Tổng tiền</th>
                    <th className="px-4 py-2">Thanh toán</th>
                    <th className="px-4 py-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-pink-50 hover:bg-[#fff7fb]"
                    >
                      <td className="px-4 py-2">{order._id}</td>
                      <td className="px-4 py-2">
                        {new Date(order.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-2 font-semibold text-[#e06c7f]">
                        {order.totalPrice.toLocaleString("vi-VN")}₫
                      </td>
                      <td className="px-4 py-2">
                        {order.paymentStatus === "Paid" ? (
                          <span className="text-green-600 font-medium">
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">
                            {order.paymentStatus || "Chưa thanh toán"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-3 py-1 rounded-full text-xs bg-[#ffe9f0] text-[#e06c7f]">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
