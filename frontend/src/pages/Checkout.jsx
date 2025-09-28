import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { orderAPI } from '../api'; // THÊM IMPORT API

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false); // THÊM LOADING STATE
  const [error, setError] = useState(''); // THÊM ERROR STATE
  
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'hcm',
    district: '',
    notes: '',
    paymentMethod: 'cod'
  });

  // Danh sách các quận TP.HCM
  const hcmDistricts = [
    { value: 'quan1', label: 'Quận 1' },
    { value: 'quan2', label: 'Quận 2' },
    { value: 'quan3', label: 'Quận 3' },
    { value: 'quan4', label: 'Quận 4' },
    { value: 'quan5', label: 'Quận 5' },
    { value: 'quan6', label: 'Quận 6' },
    { value: 'quan7', label: 'Quận 7' },
    { value: 'quan8', label: 'Quận 8' },
    { value: 'quan9', label: 'Quận 9' },
    { value: 'quan10', label: 'Quận 10' },
    { value: 'quan11', label: 'Quận 11' },
    { value: 'quan12', label: 'Quận 12' },
    { value: 'binhtan', label: 'Quận Bình Tân' },
    { value: 'binhthạnh', label: 'Quận Bình Thạnh' },
    { value: 'govap', label: 'Quận Gò Vấp' },
    { value: 'phunhuan', label: 'Quận Phú Nhuận' },
    { value: 'tanbình', label: 'Quận Tân Bình' },
    { value: 'tanphu', label: 'Quận Tân Phú' },
    { value: 'thuduc', label: 'TP. Thủ Đức' }
  ];
  
  const calculateShippingFee = () => {
    const cartTotal = getCartTotal();
    return cartTotal >= 500000 ? 0 : 30000;
  };

  const shippingFee = calculateShippingFee();
  const finalTotal = getCartTotal() + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'city') {
      setFormData(prev => ({
        ...prev,
        district: ''
      }));
    }
  };
  
  // ========== SỬA HANDLESUBMIT ĐỂ GỌI API THẬT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra đăng nhập
    if (!user) {
      alert('Vui lòng đăng nhập để đặt hàng');
      navigate('/login');
      return;
    }

    // Validate form
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.district) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🛒 Đang tạo đơn hàng...');
      
      // Chuẩn bị dữ liệu đơn hàng theo format backend mong đợi
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          image: item.image || item.images?.[0] || '/uploads/default.jpg',
          price: item.discountPrice || item.price,
          product: item._id // Product ID
        })),
        shippingAddress: {
          address: `${formData.address}, ${hcmDistricts.find(d => d.value === formData.district)?.label || formData.district}`,
          city: 'TP. Hồ Chí Minh',
          phone: formData.phone,
          postalCode: ''
        },
        paymentMethod: formData.paymentMethod === 'cod' ? 'COD' : 'BANK_TRANSFER',
        totalPrice: finalTotal
      };

      console.log('📦 Order data to send:', orderData);

      // Gọi API tạo đơn hàng
      const response = await orderAPI.createOrder(orderData);
      
      console.log('✅ Order response:', response.data);

      // Kiểm tra response
      if (response.data && (response.data.success || response.data._id)) {
        const orderId = response.data.data?._id || response.data._id;
        
        console.log(`🎉 Đặt hàng thành công! Order ID: ${orderId}`);
        
        // Xóa giỏ hàng
        clearCart();
        
        // Chuyển đến trang cảm ơn với thông tin đơn hàng
        navigate('/thank-you', {
          state: {
            orderData: response.data,
            customerInfo: formData
          }
        });
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (error) {
      console.error('❌ Error creating order:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      
      if (error.response) {
        // Server trả về lỗi
        const serverError = error.response.data;
        errorMessage = serverError.message || `Lỗi ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // Không nhận được response
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      }
      
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <Navbar />
        
        <main className="flex-1 p-4 max-w-6xl mx-auto">
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-6">Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
            <Link to="/product" className="inline-block bg-green-700 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      
      <main className="flex-1 p-4 max-w-6xl mx-auto my-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Thanh toán</h1>
        
        {/* HIỂN THỊ LỖI NẾU CÓ */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Lỗi:</strong> {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <form onSubmit={handleSubmit}>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin giao hàng</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="fullName" className="block text-gray-700 mb-2">Họ tên *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="example@gmail.com"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 mb-2">Số điện thoại *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0901234567"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 mb-2">Địa chỉ cụ thể *</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Số nhà, tên đường, phường/xã..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block text-gray-700 mb-2">Thành phố *</label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-100"
                    disabled
                  >
                    <option value="hcm">TP. Hồ Chí Minh</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hiện tại chỉ giao hàng trong TP.HCM</p>
                </div>
                
                <div>
                  <label htmlFor="district" className="block text-gray-700 mb-2">Quận/Huyện *</label>
                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Chọn Quận/Huyện</option>
                    {hcmDistricts.map(district => (
                      <option key={district.value} value={district.value}>
                        {district.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="notes" className="block text-gray-700 mb-2">Ghi chú đơn hàng</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng hoặc địa chỉ giao chi tiết hơn..."
                ></textarea>
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-4 pt-4 border-t border-gray-200">Phương thức thanh toán</h2>
              
              <div className="space-y-3 mb-6">
                <label className="flex items-start p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="mr-3 text-green-600 mt-1"
                  />
                  <div>
                    <span className="font-medium">💰 Thanh toán khi nhận hàng (COD)</span>
                    <p className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </label>
                
                <label className="flex items-start p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank"
                    checked={formData.paymentMethod === 'bank'}
                    onChange={handleChange}
                    className="mr-3 text-green-600 mt-1"
                  />
                  <div className="flex-1">
                    <span className="font-medium">🏦 Chuyển khoản ngân hàng</span>
                    <p className="text-sm text-gray-500 mb-2">Chuyển khoản trước khi giao hàng</p>
                  </div>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-8 rounded-lg font-bold text-lg transition-colors ${
                  loading 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-red-600 text-white hover:bg-red-500'
                }`}
              >
                {loading ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                    Đang xử lý...
                  </>
                ) : (
                  `🛒 Đặt hàng (${finalTotal.toLocaleString('vi-VN')}₫)`
                )}
              </button>
            </form>
          </div>
          
          <div className="order-summary bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">Đơn hàng của bạn</h2>
            
            <div className="space-y-3 mb-4">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="text-gray-600 ml-2">× {item.quantity}</span>
                  </div>
                  <div className="font-medium text-gray-800">
                    {((item.discountPrice || item.price) * item.quantity).toLocaleString('vi-VN')}₫
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mb-2">
              <span>Tạm tính:</span>
              <span>{getCartTotal().toLocaleString('vi-VN')}₫</span>
            </div>
            
            <div className="flex justify-between mb-2">
              <span>Phí giao hàng:</span>
              <span className={shippingFee === 0 ? "text-green-600" : "text-gray-800"}>
                {shippingFee === 0 ? 'Miễn phí' : '30.000₫'}
              </span>
            </div>
            
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200">
              <span>Tổng cộng:</span>
              <span className="text-red-600">{finalTotal.toLocaleString('vi-VN')}₫</span>
            </div>
            
            <div className="mt-6 p-3 bg-green-50 rounded-lg">
              {getCartTotal() >= 500000 ? (
                <p className="text-sm text-green-700">
                  🎉 <strong>Chúc mừng!</strong> Bạn được miễn phí giao hàng
                </p>
              ) : (
                <p className="text-sm text-orange-700">
                  🚚 Mua thêm <strong>{(500000 - getCartTotal()).toLocaleString('vi-VN')}₫</strong> để được miễn phí giao hàng
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Checkout;