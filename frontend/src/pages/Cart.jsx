import React, { useContext, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import Header from "../components/common/Header";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import CartItem from "../components/cart/CartItem";

import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const SHIPPING_FEE = 30000;
const MAX_PER_PRODUCT = 3;

const Cart = () => {
  const {
    cartItems,
    clearCart,
    getCartSubtotal,
    getDiscountAmount,
    getCartTotal,
  } = useContext(CartContext);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 🔒 KHÓA THANH TOÁN NẾU CÓ SẢN PHẨM = 3
  const isCheckoutLocked = useMemo(() => {
    return cartItems.some(
      (item) => (item.quantity || 1) >= MAX_PER_PRODUCT
    );
  }, [cartItems]);

  const handleCheckout = () => {
    if (isCheckoutLocked) return;

    if (!user) {
      navigate("/login");
      return;
    }

    navigate("/checkout");
  };

  const subtotal = getCartSubtotal();
  const discountAmount = getDiscountAmount();
  const finalTotal = getCartTotal() + SHIPPING_FEE;

  return (
    <div className="flex flex-col min-h-screen bg-[#fff]">
      <Header />
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-[#4b2c35] mb-6 text-center">
          🧺 Giỏ hàng của bạn
        </h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center">
            <p className="text-gray-500 mb-4">
              Giỏ hàng của bạn đang trống
            </p>
            <Link
              to="/product"
              className="inline-block bg-[#e06c7f] text-white px-6 py-2 rounded-xl hover:bg-[#cc5f72]"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-pink-100">
              {cartItems.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}

              <div className="flex justify-between mt-6 pt-4 border-t border-pink-100">
                <Link
                  to="/product"
                  className="text-[#e06c7f] font-medium hover:underline"
                >
                  ← Tiếp tục mua sắm
                </Link>

                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-600 font-medium"
                >
                  🗑️ Xóa giỏ hàng
                </button>
              </div>
            </div>

            {/* RIGHT */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-pink-100">
              <h2 className="text-xl font-bold text-[#4b2c35] mb-4">
                💳 Thanh toán
              </h2>

              <div className="space-y-2 text-gray-700 text-sm">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{subtotal.toLocaleString("vi-VN")}₫</span>
                </div>

                <div className="flex justify-between">
                  <span>Phí giao hàng</span>
                  <span>{SHIPPING_FEE.toLocaleString("vi-VN")}₫</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>
                      -{discountAmount.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-pink-100">
                <span className="font-semibold text-[#4b2c35]">
                  Tổng cộng
                </span>
                <span className="text-2xl font-bold text-[#e06c7f]">
                  {finalTotal.toLocaleString("vi-VN")}₫
                </span>
              </div>

              {/* 🔒 NÚT THANH TOÁN */}
              <button
                onClick={handleCheckout}
                disabled={isCheckoutLocked}
                className={`w-full mt-6 py-3 rounded-xl font-bold transition ${
                  isCheckoutLocked
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-[#e06c7f] text-white hover:bg-[#cc5f72]"
                }`}
              >
                Tiến hành thanh toán
              </button>

              {/* LÝ DO KHÓA */}
              {isCheckoutLocked && (
                <p className="mt-3 text-sm text-[#c24d73] text-center">
                  🌸 Đơn hàng có sản phẩm đạt số lượng tối đa (3 bó).  
                  Vui lòng liên hệ shop để đặt số lượng lớn.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
