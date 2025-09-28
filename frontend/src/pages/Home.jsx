import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/product/ProductCard';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Base API URL
  const API_BASE_URL = 'http://localhost:5000/api';
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Lấy danh sách sản phẩm nổi bật
      const response = await axios.get(`${API_BASE_URL}/products?limit=6`);
      
      if (response.data && response.data.products) {
        setFeaturedProducts(response.data.products);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      
      <main className="flex-1">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded m-4 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button 
                onClick={fetchData}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}
        
        {/* Hero Banner Section */}
        <section className="promo-banner flex flex-col md:flex-row justify-between gap-5 my-10 mx-4 max-w-7xl xl:mx-auto">
          <div className="promo relative w-full md:w-1/2">
            <img 
              src="https://i.pinimg.com/474x/73/5c/e5/735ce5fb4b5ee2f429f1918fad3e7c1a.jpg" 
              alt="Banner khuyến mãi 1"
              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
            />
            <div className="promo-text absolute top-8 left-8 text-white font-bold drop-shadow-lg">
              <h2 className="text-4xl mb-3 text-green-700">Hoa Tươi</h2>
              <p className="text-xl mb-4">GIẢM GIÁ TỚI <strong className="text-2xl">30%</strong></p>
              <Link 
                to="/product"
                className="inline-block bg-green-700 py-3 px-6 text-white no-underline rounded-lg hover:bg-green-600 transition-colors transform hover:scale-105"
              >
                Xem ngay
              </Link>
            </div>
          </div>
          
          <div className="promo relative w-full md:w-1/2">
            <img 
              src="https://shophoahong.com/wp-content/uploads/2022/06/h19-e1654479676559.jpg" 
              alt="Banner khuyến mãi 2"
              className="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
            />
            <div className="promo-text absolute top-8 left-8 text-white font-bold drop-shadow-lg">
              <h2 className="text-3xl mb-3 text-green-700">Hoa đẹp</h2>
              <p className="text-xl mb-4">Giao hàng nhanh chóng</p>
              <Link 
                to="/product"
                className="inline-block bg-green-700 py-3 px-6 text-white no-underline rounded-lg hover:bg-green-600 transition-colors transform hover:scale-105"
              >
                MUA NGAY 
              </Link>
            </div>
          </div>
        </section>
        
        {/* Featured productss Section */}
        <section className="best-seller py-12 px-4 text-center max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-green-700 mb-3">
              <i className="fas fa-star text-yellow-500 mr-3"></i> 
              Top bán chạy nhất tuần
            </h2>
            <p className="text-gray-600 text-lg">Khám phá những sản phẩm được yêu thích nhất</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải sản phẩm...</p>
              </div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl text-gray-300 mb-4">🌸</div>
              <h3 className="text-xl font-bold text-gray-600 mb-3">Chưa có sản phẩm nào</h3>
              <p className="text-gray-500 mb-6">Hãy thêm sản phẩm từ trang quản trị</p>
              <Link 
                to="/admin/products"
                className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors inline-block"
              >
                Đến trang quản trị
              </Link>
            </div>
          ) : (
            <div className="product-list grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          
        
        </section>
        
        {/* Features Section */}
        <section className="features py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Tại sao chọn chúng tôi?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="feature-item text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-4xl text-green-700 mb-4">🚚</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Giao hàng nhanh</h3>
                <p className="text-gray-600">Giao hàng trong ngày tại TP.HCM và các tỉnh lân cận</p>
              </div>
              
              <div className="feature-item text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-4xl text-green-700 mb-4">🌸</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Hoa tươi mỗi ngày</h3>
                <p className="text-gray-600">Cam kết hoa tươi, được nhập mỗi ngày từ các vườn hoa uy tín</p>
              </div>
              
              <div className="feature-item text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-4xl text-green-700 mb-4">💝</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Thiết kế độc đáo</h3>
                <p className="text-gray-600">Đội ngũ florist chuyên nghiệp, tạo ra những tác phẩm độc đáo</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;