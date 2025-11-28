// src/pages/Checkout.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

import Header from "../components/common/Header";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

import Select from "react-select";
import { FaUser, FaPhone, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";

const API_URL = "http://localhost:5000/api";

// Danh sách toàn bộ quận/huyện HCM
const districtOptions = [
  { value: "quan1", label: "Quận 1" },
  { value: "quan3", label: "Quận 3" },
  { value: "quan4", label: "Quận 4" },
  { value: "quan5", label: "Quận 5" },
  { value: "quan6", label: "Quận 6" },
  { value: "quan7", label: "Quận 7" },
  { value: "quan8", label: "Quận 8" },
  { value: "quan10", label: "Quận 10" },
  { value: "quan11", label: "Quận 11" },
  { value: "quan12", label: "Quận 12" },
  { value: "binhthanh", label: "Bình Thạnh" },
  { value: "govap", label: "Gò Vấp" },
  { value: "phunhuan", label: "Phú Nhuận" },
  { value: "tanbinh", label: "Tân Bình" },
  { value: "tanphu", label: "Tân Phú" },
  { value: "binhtan", label: "Bình Tân" },
  { value: "thuduc", label: "TP Thủ Đức" },
  { value: "binhchanh", label: "Huyện Bình Chánh" },
  { value: "hocmon", label: "Huyện Hóc Môn" },
  { value: "nhabe", label: "Huyện Nhà Bè" },
  { value: "cuchi", label: "Huyện Củ Chi" },
  { value: "cangio", label: "Huyện Cần Giờ" },
];

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentProof, setPaymentProof] = useState(null);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "hcm",
    district: "",
    notes: "",
    paymentMethod: "cod", // cod | bank | e_wallet
  });

  const cartTotal = getCartTotal();
  const shippingFee = cartTotal >= 500000 ? 0 : 30000;
  const finalTotal = cartTotal + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDistrictChange = (selected) => {
    setFormData((prev) => ({ ...prev, district: selected?.value || "" }));
  };

  const handleFileSelect = (file) => {
    if (file) {
      setPaymentProof(file);
    }
  };

  const validateForm = () => {
    if (!user) {
      alert("Vui lòng đăng nhập để đặt hàng.");
      navigate("/login");
      return false;
    }

    if (
      !formData.fullName.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.district
    ) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin giao hàng.");
      return false;
    }

    if (
      formData.paymentMethod !== "cod" &&
      !paymentProof
    ) {
      alert("⚠️ Vui lòng tải lên ảnh xác nhận thanh toán.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const districtLabel =
        districtOptions.find((d) => d.value === formData.district)?.label || "";

      // 1️⃣ Chuẩn bị dữ liệu tạo đơn
      const orderData = {
        orderItems: cartItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image || item.images?.[0],
          price: item.discountPrice || item.price,
          product: item._id,
        })),
        shippingAddress: {
          address: `${formData.address}, ${districtLabel}`,
          phone: formData.phone,
          city: "TP Hồ Chí Minh",
        },
        paymentMethod:
          formData.paymentMethod === "cod"
            ? "COD"
            : formData.paymentMethod === "bank"
            ? "BANK_TRANSFER"
            : "E_WALLET",
        totalPrice: finalTotal,
        notes: formData.notes,
      };

      // 2️⃣ Gọi API tạo đơn hàng
      const resOrder = await axios.post(`${API_URL}/orders`, orderData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const orderId = resOrder.data?.data?._id;

      // 3️⃣ Nếu thanh toán online → upload ảnh xác nhận
      if (formData.paymentMethod !== "cod" && paymentProof && orderId) {
        const uploadData = new FormData();
        uploadData.append("paymentProof", paymentProof);

        await axios.post(
          `${API_URL}/orders/upload-payment/${orderId}`,
          uploadData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
      }

      // 4️⃣ Clear giỏ hàng & chuyển sang trang cảm ơn
      clearCart();
      navigate("/thank-you", {
        state: {
          orderId,
          customerInfo: formData,
          total: finalTotal,
        },
      });
    } catch (err) {
      console.error("❌ Lỗi đặt hàng:", err);
      setError(err.response?.data?.message || "Có lỗi xảy ra khi đặt hàng!");
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="flex flex-col min-h-screen bg-[#fff7f9]">
        <Header />
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto p-6">
          <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-pink-100">
            <h2 className="text-2xl font-bold text-[#4b2c35] mb-2">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-4">
              Bạn chưa có sản phẩm nào trong giỏ hàng.
            </p>
            <Link
              to="/product"
              className="inline-block px-6 py-2 rounded-full bg-[#e06c7f] text-white font-semibold hover:bg-[#cc5f72] transition"
            >
              🌸 Tiếp tục mua sắm
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fff7f9]">
      <Header />
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <h1 className="text-3xl font-bold text-[#4b2c35] mb-6 text-center">
          Thanh toán đơn hàng
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* LEFT: SHIPPING + PAYMENT */}
          <div className="md:col-span-2 bg-white p-6 shadow-md rounded-2xl border border-pink-100">
            {/* 🔹 THÔNG TIN GIAO HÀNG */}
            <h2 className="text-xl font-bold mb-4 text-[#4b2c35]">
              🌸 Thông tin giao hàng
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Họ tên */}
              <div className="flex items-center gap-2 border border-pink-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#e06c7f]">
                <FaUser className="text-gray-500 text-lg" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Họ và tên"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div className="flex items-center gap-2 border border-pink-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#e06c7f]">
                <FaEnvelope className="text-gray-500 text-lg" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent"
                />
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 border border-pink-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#e06c7f]">
                <FaPhone className="text-gray-500 text-lg" />
                <input
                  type="text"
                  name="phone"
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent"
                  required
                />
              </div>

              {/* District dropdown */}
              <div>
                <label className="text-gray-700 font-medium mb-1 block">
                  Quận / Huyện
                </label>
                <Select
                  classNamePrefix="react-select"
                  options={districtOptions}
                  placeholder="Chọn Quận/Huyện..."
                  value={
                    districtOptions.find(
                      (d) => d.value === formData.district
                    ) || null
                  }
                  onChange={handleDistrictChange}
                />
              </div>

              {/* Address full width */}
              <div className="md:col-span-2 flex items-center gap-2 border border-pink-200 rounded-xl px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#e06c7f] mt-2">
                <FaMapMarkerAlt className="text-gray-500 text-lg" />
                <input
                  type="text"
                  name="address"
                  placeholder="Ví dụ: 123 Nguyễn Trãi, P.7"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="text-gray-700 font-medium mb-1 block">
                Ghi chú đơn hàng
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border border-pink-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#e06c7f] bg-white"
                placeholder="Ví dụ: giao buổi sáng, kèm thiệp chúc mừng..."
              />
            </div>

            {/* 🔹 PHƯƠNG THỨC THANH TOÁN */}
            <h2 className="text-xl font-bold mt-6 mb-3 text-[#4b2c35]">
              💳 Phương thức thanh toán
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {[
                { id: "cod", label: "🚚 Thanh toán khi nhận hàng" },
                { id: "bank", label: "🏦 Chuyển khoản ngân hàng" },
                { id: "e_wallet", label: "📱 Ví MoMo" },
              ].map((pm) => (
                <label
                  key={pm.id}
                  className={`flex items-center justify-center text-center gap-2 border rounded-xl py-2 px-3 cursor-pointer text-sm transition 
                    ${
                      formData.paymentMethod === pm.id
                        ? "border-[#e06c7f] bg-[#ffe9f0] text-[#e06c7f] shadow-sm"
                        : "border-pink-200 hover:border-[#e06c7f]"
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.id}
                    checked={formData.paymentMethod === pm.id}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span>{pm.label}</span>
                </label>
              ))}
            </div>

            {/* BANK INFO + QR */}
            {formData.paymentMethod === "bank" && (
              <div className="mt-3 p-4 border border-pink-200 rounded-xl bg-[#fff8fb]">
                <h3 className="font-semibold mb-2 text-[#4b2c35]">
                  Thông tin chuyển khoản ngân hàng
                </h3>
                <p>
                  <b>Ngân hàng:</b> VietTinBank
                </p>
                <p>
                  <b>STK:</b> 0383 654 182
                </p>
                <p>
                  <b>Tên:</b> DOAN THI MY DUYEN
                </p>
                <p>
                  <b>Nội dung chuyển khoản:</b>{" "}
                  {formData.phone || "SĐT của bạn"}
                </p>

                <div className="mt-3 text-center">
                  <p className="font-medium text-gray-700">
                    💳 Quét mã QR để thanh toán:
                  </p>
                  <img
                    className="w-44 mx-auto mt-2 rounded-xl shadow border border-pink-200 bg-white"
                    src={`https://img.vietqr.io/image/970436-0123456789-compact.png?amount=${finalTotal}&addInfo=${
                      formData.phone || "DDT Flower"
                    }`}
                    alt="QR Banking"
                  />
                </div>
              </div>
            )}

            {/* WALLET INFO + QR */}
            {formData.paymentMethod === "e_wallet" && (
              <div className="mt-3 p-4 border border-pink-200 rounded-xl bg-[#f8f0ff]">
                <h3 className="font-semibold mb-2 text-[#4b2c35]">
                  Thanh toán qua ví MoMo
                </h3>
                <p>
                  <b>SĐT:</b> 0383 654 182
                </p>
                <p>
                  <b>Tên:</b> DOAN THI MY DUYEN
                </p>
                <div className="mt-3 text-center">
                  <p className="font-medium text-gray-700">
                    💳 Quét mã QR để thanh toán:
                  </p>
                  <img
                    className="w-44 mx-auto mt-2 rounded-xl shadow border border-pink-200 bg-white"
                    src={`https://img.vietqr.io/image/MOMO-0383654182-compact.png?amount=${finalTotal}&addInfo=${
                      formData.phone || "DDT Flower"
                    }`}
                    alt="QR MoMo"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  📌 Sau khi thanh toán, vui lòng chụp màn hình và tải lên ảnh
                  xác nhận bên dưới để shop kiểm tra nhanh hơn.
                </p>
              </div>
            )}

            {/* FILE UPLOAD */}
            {formData.paymentMethod !== "cod" && (
              <div className="mt-4">
                <label className="font-medium block mb-1 text-[#4b2c35]">
                  Ảnh xác nhận thanh toán *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="block w-full text-sm text-gray-600"
                />
                {paymentProof && (
                  <p className="text-green-600 text-sm mt-1">
                    ✓ Đã chọn ảnh: <b>{paymentProof.name}</b>
                  </p>
                )}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="w-full bg-[#e06c7f] text-white py-3 rounded-xl text-lg font-bold mt-5 hover:bg-[#cc5f72] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading
                ? "Đang xử lý..."
                : `Đặt hàng (${finalTotal.toLocaleString("vi-VN")}₫)`}
            </button>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="bg-white p-6 shadow-md rounded-2xl border border-pink-100">
            <h2 className="font-bold text-lg mb-3 text-[#4b2c35]">
              🧺 Đơn hàng của bạn
            </h2>

            {cartItems.map((item) => (
              <div
                key={item._id}
                className="flex justify-between border-b border-pink-50 py-2 text-sm"
              >
                <span className="text-[#4b2c35]">
                  {item.name} × {item.quantity}
                </span>
                <span className="text-[#4b2c35] font-medium">
                  {(
                    (item.discountPrice || item.price) * item.quantity
                  ).toLocaleString("vi-VN")}
                  ₫
                </span>
              </div>
            ))}

            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[#4b2c35]">Tạm tính:</span>
                <span>{cartTotal.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4b2c35]">Phí ship:</span>
                <span className={shippingFee ? "text-[#4b2c35]" : "text-green-600"}>
                  {shippingFee ? "30.000₫" : "Miễn phí"}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-3 border-t border-pink-100">
              <span className="text-[#4b2c35] font-semibold">Tổng cộng:</span>
              <span className="text-[#e06c7f] font-bold text-xl">
                {finalTotal.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
