import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import CartItem from '../components/cart/CartItem';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const Cart = () => {
  const { 
    cartItems, 
    clearCart, 
    getCartSubtotal, 
    getCartTotal, 
    getDiscountAmount,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon
  } = useContext(CartContext);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  
  // VALIDATION: Kiểm tra số lượng sản phẩm
  const validateCartQuantities = () => {
    const errors = [];
    
    cartItems.forEach(item => {
      if (item.quantity > 200) {
        errors.push(`Sản phẩm "${item.name}" vượt quá giới hạn 200 sản phẩm (hiện tại: ${item.quantity})`);
      }
    });
    
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 500) {
      errors.push(`Tổng số lượng sản phẩm vượt quá giới hạn 500 (hiện tại: ${totalQuantity})`);
    }
    
    return errors;
  };
  
  const handleCheckout = () => {
    if (!user) {
      if (window.confirm('Bạn cần đăng nhập để tiếp tục thanh toán. Đến trang đăng nhập?')) {
        navigate('/login');
      }
      return;
    }
    
    // VALIDATION: Kiểm tra số lượng trước khi checkout
    const validationErrors = validateCartQuantities();
    if (validationErrors.length > 0) {
      alert('Lỗi giỏ hàng:\n' + validationErrors.join('\n'));
      return;
    }
    
    navigate('/checkout');
  };
  
  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    
    setIsApplyingCoupon(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const success = applyCoupon(couponInput);
      if (success) {
        setCouponInput('');
      }
      setIsApplyingCoupon(false);
    }, 500);
  };
  
  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
  };
  
  // Phí vận chuyển
  const shippingFee = 30000;
  const subtotal = getCartSubtotal();
  const discountAmount = getDiscountAmount();
  const finalTotal = getCartTotal() + shippingFee;
  
  // Kiểm tra và hiển thị cảnh báo nếu có sản phẩm vượt quá giới hạn
  const validationErrors = validateCartQuantities();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      
      <main className="flex-1 p-4 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Giỏ hàng của bạn</h1>
        
        {/* HIỂN THỊ CẢNH BÁO VALIDATION */}
        {validationErrors.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong className="font-bold">Cảnh báo giới hạn số lượng:</strong>
            <ul className="mt-2 list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm">Vui lòng điều chỉnh số lượng sản phẩm trước khi thanh toán.</p>
          </div>
        )}
        
        {cartItems.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-6">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
            <Link to="/product" className="inline-block bg-green-700 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-4">
              <div className="cart-header border-b border-gray-200 pb-4 mb-4 hidden md:grid md:grid-cols-5 text-gray-500">
                <div className="md:col-span-2">Sản phẩm</div>
                <div className="text-center">Đơn giá</div>
                <div className="text-center">Số lượng</div>
                <div className="text-center">Thành tiền</div>
              </div>
              
              <div className="cart-items">
                {cartItems.map(item => (
                  <CartItem key={item._id} item={item} />
                ))}
              </div>
              
              {/* HIỂN THỊ THÔNG TIN GIỚI HẠN */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h3 className="font-medium text-blue-800 mb-2">📋 Thông tin giới hạn mua hàng:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Mỗi sản phẩm tối đa: <strong>200 sản phẩm</strong></li>
                  <li>• Tổng số lượng đơn hàng tối đa: <strong>500 sản phẩm</strong></li>
                  <li>• Tổng số lượng hiện tại: <strong>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm</strong></li>
                </ul>
              </div>
              
              <div className="cart-actions flex justify-between mt-6 pt-4 border-t border-gray-200">
                <Link to="/product" className="text-green-700 hover:text-green-800">
                  ← Tiếp tục mua sắm
                </Link>
                
                <button 
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700"
                >
                  Xóa giỏ hàng
                </button>
              </div>
            </div>
            
            <div className="cart-summary bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Tổng giỏ hàng</h2>
              
              <div className="flex justify-between mb-2">
                <span>Tạm tính:</span>
                <span>{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span>Phí giao hàng:</span>
                <span>{shippingFee.toLocaleString('vi-VN')}₫</span>
              </div>
              
              {/* Discount Display */}
              {discountAmount > 0 && (
                <div className="flex justify-between mb-2 text-green-600">
                  <span>Giảm giá ({appliedCoupon?.code}):</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              
              {/* Coupon Section */}
              <div className="promo-code mb-4 pb-4 border-b border-gray-200">
                <h3 className="font-medium mb-2">Mã giảm giá</h3>
                
                {appliedCoupon ? (
                  // Hiển thị mã đã áp dụng
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-800">{appliedCoupon.code}</div>
                        <div className="text-sm text-green-600">{appliedCoupon.description}</div>
                        <div className="text-sm text-green-600">
                          Tiết kiệm: {discountAmount.toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                      <button 
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ) : (
                  // Form nhập mã giảm giá
                  <div>
                    <div className="flex">
                      <input 
                        type="text" 
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Nhập mã giảm giá" 
                        className="flex-1 border border-gray-300 rounded-l px-3 py-2"
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon || !couponInput.trim()}
                        className="bg-green-600 text-white px-4 py-2 rounded-r hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isApplyingCoupon ? '...' : 'Áp dụng'}
                      </button>
                    </div>
                    
                    {couponError && (
                      <div className="text-red-500 text-sm mt-2">{couponError}</div>
                    )}
                    
                    {/* Gợi ý mã giảm giá */}
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-2">Mã giảm giá khả dụng:</p>
                      <div className="space-y-1">
                        <button 
                          onClick={() => setCouponInput('WELCOME15')}
                          className="block w-full text-left text-sm bg-yellow-50 border border-yellow-200 rounded px-2 py-1 hover:bg-yellow-100"
                        >
                          <span className="font-medium">WELCOME15</span> - Giảm 15% đơn đầu tiên (từ 200k)
                        </button>
                        <button 
                          onClick={() => setCouponInput('SAVE50K')}
                          className="block w-full text-left text-sm bg-blue-50 border border-blue-200 rounded px-2 py-1 hover:bg-blue-100"
                        >
                          <span className="font-medium">SAVE50K</span> - Giảm 50k cho đơn từ 300k
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Tổng cộng:</span>
                <span className="text-red-600">{finalTotal.toLocaleString('vi-VN')}₫</span>
              </div>
              
              {/* Hiển thị tiết kiệm nếu có */}
              {discountAmount > 0 && (
                <div className="text-center mb-4 text-green-600 font-medium">
                  🎉 Bạn đã tiết kiệm {discountAmount.toLocaleString('vi-VN')}₫!
                </div>
              )}
              
              <button 
                onClick={handleCheckout}
                disabled={validationErrors.length > 0}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${
                  validationErrors.length > 0 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-red-600 text-white hover:bg-red-500'
                }`}
              >
                {validationErrors.length > 0 
                  ? 'Vui lòng điều chỉnh số lượng' 
                  : 'Tiến hành thanh toán'
                }
              </button>
              
              <div className="payment-methods mt-4">
                <p className="text-sm text-gray-500 mb-2 text-center">Chúng tôi chấp nhận:</p>
                <div className="flex justify-center gap-2">
                  <span className="p-1 bg-white border rounded text-xs">Tiền mặt</span>
                  <span className="p-1 bg-white border rounded text-xs">Banking</span>
                  <span className="p-1 bg-white border rounded text-xs">Visa</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;