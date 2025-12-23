import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { toast } from "react-toastify";

// Layout
import Header from "../components/common/Header";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const API_URL = "http://localhost:5000/api";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { cartItems, clearCart } = useContext(CartContext);

  const [loading, setLoading] = useState(false);
  const [paymentImage, setPaymentImage] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    notes: "",
    paymentMethod: "cod",
  });

  // ===== TÍNH TỔNG TIỀN =====
  const totalPrice = cartItems.reduce(
    (sum, item) =>
      sum + item.quantity * (item.discountPrice || item.price),
    0
  );

  // ===== HANDLE CHANGE =====
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ===== SUBMIT =====
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!formData.fullName || !formData.phone || !formData.address) {
      toast.error("Vui lòng nhập đầy đủ thông tin giao hàng");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    try {
      setLoading(true);

      // ================= COD =================
      if (formData.paymentMethod === "cod") {
        await axios.post(
          `${API_URL}/orders`,
          {
            orderItems: cartItems.map((item) => ({
              product: item._id,
              name: item.name,
              quantity: item.quantity,
              price: item.discountPrice || item.price,
              image: item.image || item.images?.[0],
            })),

            shippingAddress: {
              fullName: formData.fullName,
              phone: formData.phone,
              address: formData.address,
            },

            paymentMethod: "COD",
            totalPrice,
            notes: formData.notes,

            // 👇 thêm thông tin nghiệp vụ
            orderSource: "website",
          },
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        clearCart();
        navigate("/thank-you");
        return;
      }

      // ================= QR / CHUYỂN KHOẢN =================
      if (!paymentImage) {
        toast.error("Vui lòng upload ảnh xác nhận thanh toán");
        return;
      }

      const form = new FormData();
      form.append("image", paymentImage);
      form.append(
        "orderItems",
        JSON.stringify(
          cartItems.map((item) => ({
            product: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.discountPrice || item.price,
            image: item.image || item.images?.[0],
          }))
        )
      );
      form.append(
        "shippingAddress",
        JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        })
      );
      form.append("totalPrice", totalPrice);
      form.append("notes", formData.notes || "");
      form.append("paymentMethod", formData.paymentMethod.toUpperCase());

      await axios.post(`${API_URL}/payment-requests`, form, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      clearCart();
      toast.success("Đã gửi yêu cầu thanh toán, vui lòng chờ shop xác nhận");
      navigate("/payment-tracking");
    } catch (err) {
      console.error(err);
      toast.error("Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fff]">
      <Header />
      <Navbar />

      <main className="flex-1 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-[#4b2c35] mb-8">
            🌸 Thanh toán đơn hàng
          </h1>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* ================= LEFT ================= */}
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold text-[#4b2c35]">
                Thông tin giao hàng
              </h2>

              <input
                type="text"
                name="fullName"
                placeholder="Họ tên người nhận"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border p-3 rounded"
              />

              <input
                type="text"
                name="phone"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border p-3 rounded"
              />

              <input
                type="text"
                name="address"
                placeholder="Địa chỉ giao hàng"
                value={formData.address}
                onChange={handleChange}
                className="w-full border p-3 rounded"
              />

              <textarea
                name="notes"
                placeholder="Ghi chú cho shop (ghi thiệp, giờ giao...)"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full border p-3 rounded"
              />

              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full border p-3 rounded"
              >
                <option value="cod">🚚 Thanh toán khi nhận hàng (COD)</option>
                <option value="bank">🏦 Chuyển khoản ngân hàng (QR)</option>
                <option value="momo">📱 Ví MOMO (QR)</option>
              </select>

              {/* ===== QR INFO ===== */}
              {formData.paymentMethod !== "cod" && (
                <>
                  {/* HƯỚNG DẪN QR */}
                  {/* ===== QR PAYMENT INFO ===== */}
                  <div className="p-4 rounded-xl bg-[#fff0f6] border border-[#f5c2d1] space-y-4">

                    <p className="font-semibold text-[#4b2c35]">
                      📌 Thanh toán bằng mã QR
                    </p>

                {/* QR IMAGE */}
                <div className="flex justify-center">
                  <img
                    src={
                      formData.paymentMethod === "momo"
                        ? "/qr-momo.png"
                        : "/qr-bank.png"
                    }
                    alt="Mã QR thanh toán"
                    className="w-56 h-56 object-contain border rounded-lg bg-white p-2"
                  />
                </div>

                {/* NOTE */}
                <p className="text-xs text-gray-500 text-center">
                  * Mã QR dùng để chuyển khoản đúng số tiền của đơn hàng
                </p>

                {/* INSTRUCTION */}
                <div className="text-sm text-[#4b2c35]">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử</li>
                    <li>
                      <b>Số tiền:</b>{" "}
                      {totalPrice.toLocaleString("vi-VN")}₫
                    </li>
                    <li>
                      <b>Nội dung chuyển khoản:</b>{" "}
                      <span className="text-[#e06c7f] font-medium">
                        {formData.phone || "SĐT đặt hàng"} - DDT Flower
                      </span>
                    </li>
                    <li>Sau khi thanh toán, vui lòng upload ảnh xác nhận bên dưới</li>
                  </ul>
                </div>

              </div>


                  {/* UPLOAD ẢNH */}
                  <div className="border border-dashed p-4 rounded bg-pink-50">
                    <p className="text-xs text-gray-500 mb-2">
                      * Ảnh này giúp shop xác minh giao dịch
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPaymentImage(e.target.files[0])}
                      required
                    />
                  </div>
                </>
              )}
            </div>

           {/* ================= RIGHT ================= */}
            <div className="bg-white rounded-xl shadow p-6 flex flex-col self-start">

              <h2 className="text-xl font-semibold text-[#4b2c35] mb-4">
                Đơn hàng của bạn
              </h2>

              {/* DANH SÁCH SẢN PHẨM */}
              <div className="flex-1 space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between text-sm border-b pb-2"
                  >
                    <div>
                      <p className="font-medium text-[#4b2c35]">{item.name}</p>
                      <p className="text-gray-500">Số lượng: {item.quantity}</p>
                    </div>
                    <div className="font-medium">
                      {(
                        item.quantity *
                        (item.discountPrice || item.price)
                      ).toLocaleString("vi-VN")}
                      ₫
                    </div>
                  </div>
                ))}
              </div>

              {/* TÓM TẮT ĐƠN HÀNG */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span>{totalPrice.toLocaleString("vi-VN")}₫</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí giao hàng</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>

                <div className="flex justify-between font-semibold text-base border-t pt-2">
                  <span>Tổng cộng</span>
                  <span className="text-[#e06c7f]">
                    {totalPrice.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>

              {/* THÔNG TIN THANH TOÁN */}
              <div className="mt-4 p-3 rounded-lg bg-[#fff0f6] text-sm text-[#4b2c35]">
                <p className="font-medium mb-1">💳 Phương thức thanh toán</p>
                <p>
                  {formData.paymentMethod === "cod"
                    ? "Thanh toán khi nhận hàng (COD)"
                    : "Chuyển khoản qua mã QR"}
                </p>

                {formData.paymentMethod !== "cod" && (
                  <p className="mt-1 text-xs text-gray-600">
                    * Sau khi thanh toán, vui lòng upload ảnh xác nhận
                  </p>
                )}
              </div>

              {/* GHI CHÚ (NẾU CÓ) */}
              {formData.notes && (
                <div className="mt-3 text-sm text-gray-600 italic">
                  📝 Ghi chú: {formData.notes}
                </div>
              )}



              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Tổng cộng</span>
                  <span>{totalPrice.toLocaleString("vi-VN")}₫</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-[#e06c7f] text-white py-3 rounded-lg font-semibold"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
