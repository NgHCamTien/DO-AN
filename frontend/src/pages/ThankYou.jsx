import React, { useEffect } from 'react';

import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const ThankYou = () => {
  const location = useLocation();
  
  // Lấy thông tin đơn hàng từ state nếu có
  const orderData = location.state?.orderData;
  const orderId = orderData?._id || orderData?.data?._id;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      
      <main className="flex-1 p-4 max-w-3xl mx-auto my-10">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mb-6 text-green-700 text-6xl">
            ✓
          </div>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Cảm ơn bạn đã đặt hàng!</h1>
          
          <p className="text-gray-600 mb-6">
            Đơn hàng của bạn đã được xác nhận và đang được xử lý. Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn.
          </p>
          
          <div className="border border-green-200 bg-green-50 rounded-lg p-4 mb-6 inline-block">
            <h2 className="font-bold text-green-800 mb-1">Mã đơn hàng:</h2>
            <p className="text-lg">
              {orderId ? `#${orderId.slice(-8).toUpperCase()}` : `#DTP${Math.floor(Math.random() * 10000)}`}
            </p>
          </div>
          
          <p className="text-gray-600 mb-8">
            Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao. Bạn có thể kiểm tra trạng thái đơn hàng trong trang tài khoản của mình.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/" className="bg-green-700 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors">
              Tiếp tục mua sắm
            </Link>
            <Link 
              to="/profile" 
              state={{ activeTab: 'orders' }}
              className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Xem đơn hàng của tôi
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ThankYou;