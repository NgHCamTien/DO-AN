import React, { useContext, useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";

import Header from "../components/common/Header";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import CartItem from "../components/cart/CartItem";

import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";

const MAX_ITEM_QTY = 200;
const MAX_CART_QTY = 500;
const SHIPPING_FEE = 30000;

const Cart = () => {
  const {
    cartItems,
    clearCart,
    getCartSubtotal,
    getDiscountAmount,
    getCartTotal,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    couponError
  } = useContext(CartContext);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Auto scroll
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Validation errors (only compute once)
  const validationErrors = useMemo(() => {
    const errors = [];

    const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQty > MAX_CART_QTY) {
      errors.push(`Tổng số lượng không được vượt quá ${MAX_CART_QTY} (hiện tại: ${totalQty})`);
    }

    cartItems.forEach((item) => {
      if (item.quantity > MAX_ITEM_QTY) {
        errors.push(
          `🔴 Sản phẩm "${item.name}" vượt giới hạn ${MAX_ITEM_QTY} (hiện tại: ${item.quantity})`
        );
      }
    });

    return errors;
  }, [cartItems]);

  const handleCheckout = () => {
    if (!user) {
      if (window.confirm("Bạn cần đăng nhập để tiếp tục thanh toán. Đến trang đăng nhập?")) {
        navigate("/login");
      }
      return;
    }

    if (validationErrors.length > 0) {
      alert("Lỗi giỏ hàng:\n" + validationErrors.join("\n"));
      return;
    }

    navigate("/checkout");
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);

    setTimeout(() => {
      const result = applyCoupon(couponInput.trim());
      if (result) setCouponInput("");
      setIsApplyingCoupon(false);
    }, 500);
  };

  const subtotal = getCartSubtotal();
  const discountAmount = getDiscountAmount();
  const finalTotal = getCartTotal() + SHIPPING_FEE;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />

      <main className="flex-1 p-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Giỏ hàng của bạn</h1>

        {/* Empty Cart */}
        {cartItems.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-6">Bạn chưa thêm sản phẩm nào.</p>
            <Link
              to="/product"
              className="inline-block bg-green-700 text-white py-2 px-6 rounded-lg hover:bg-green-600"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT SIDE */}
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-4">
              {validationErrors.length > 0 && (
                <div className="bg-red-100 border border-red-400 px-4 py-3 rounded mb-4">
                  <strong className="font-bold">⚠ Cảnh báo:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    {validationErrors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="hidden md:grid md:grid-cols-5 text-gray-500 pb-4 border-b">
                <div className="md:col-span-2">Sản phẩm</div>
                <div className="text-center">Đơn giá</div>
                <div className="text-center">Số lượng</div>
                <div className="text-center">Thành tiền</div>
              </div>

              {cartItems.map((item) => (
                <CartItem key={item._id} item={item} />
              ))}

              <div className="flex justify-between mt-6 pt-4 border-t">
                <Link to="/product" className="text-green-700">
                  ← Tiếp tục mua sắm
                </Link>
                <button onClick={clearCart} className="text-red-600">
                  Xóa giỏ hàng
                </button>
              </div>
            </div>

            {/* RIGHT SIDE SUMMARY */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tổng giỏ hàng</h2>

              <div className="flex justify-between mb-2">
                <span>Tạm tính:</span>
                <span>{subtotal.toLocaleString("vi-VN")}₫</span>
              </div>

              <div className="flex justify-between mb-2">
                <span>Phí giao hàng:</span>
                <span>{SHIPPING_FEE.toLocaleString("vi-VN")}₫</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Giảm giá:</span>
                  <span>-{discountAmount.toLocaleString("vi-VN")}₫</span>
                </div>
              )}

              {/* Coupon */}
              <div className="mb-4 pb-4 border-b">
                <h3 className="font-medium mb-2">Mã giảm giá</h3>

                {appliedCoupon ? (
                  <div className="bg-green-50 border border-green-200 p-3 rounded flex justify-between">
                    <div>
                      <div className="font-medium text-green-700">{appliedCoupon.code}</div>
                      <div className="text-sm text-green-600">{appliedCoupon.description}</div>
                    </div>
                    <button className="text-red-600" onClick={() => removeCoupon()}>
                      Xóa
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex">
                      <input
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="border flex-1 px-3 py-2"
                        placeholder="Nhập mã giảm giá"
                      />
                      <button
                        className="bg-green-600 text-white px-4 py-2 rounded-r"
                        disabled={!couponInput.trim()}
                        onClick={handleApplyCoupon}
                      >
                        Áp dụng
                      </button>
                    </div>
                    {couponError && <p className="text-red-600 text-sm mt-1">{couponError}</p>}
                  </>
                )}
              </div>

              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng:</span>
                <span className="text-red-600">{finalTotal.toLocaleString("vi-VN")}₫</span>
              </div>

              <button
                className={`w-full mt-6 py-3 rounded-lg font-bold ${
                  validationErrors.length ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 text-white"
                }`}
                disabled={validationErrors.length > 0}
                onClick={handleCheckout}
              >
                {validationErrors.length ? "Vui lòng điều chỉnh số lượng" : "Tiến hành thanh toán"}
              </button>

            </div>
            
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
