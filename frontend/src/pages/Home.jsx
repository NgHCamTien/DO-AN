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
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Dùng biến môi trường (linh hoạt khi deploy)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // --- Tự động chuyển slide ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // --- Gọi API sản phẩm nổi bật ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/products?limit=6`);
      if (response.data && response.data.products) {
        setFeaturedProducts(response.data.products);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // --- Banner ---
  const banners = [
    {
      image: "https://i.pinimg.com/1200x/7c/95/bb/7c95bb1faea6b01ae34d00c46d15a983.jpg",
      title: "Hoa Tươi Mỗi Ngày 🌸",
      subtitle: "Giảm giá đến 30% – Giao hàng nhanh & tận tâm",
    },
    {
      image: "https://i.pinimg.com/1200x/ca/81/d3/ca81d3448e06f6b153ccf082770ca039.jpg",
      title: "Trao Yêu Thương Qua Từng Cánh Hoa 💐",
      subtitle: "Thiết kế độc đáo – Sang trọng – Tinh tế",
    },
    {
      image: "https://i.pinimg.com/1200x/45/4c/e2/454ce26e8debe9f1932b3d8c4f5366b1.jpg",
      title: "Hoa Cho Mọi Dịp Đặc Biệt ❤️",
      subtitle: "Tặng người thương, sinh nhật, khai trương, lễ tình nhân...",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />

      <main className="flex-1">
        {/* Hiển thị lỗi */}
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

        {/* 🌸 Hero Banner */}
        <section className="relative my-10 mx-auto max-w-6xl rounded-2xl overflow-hidden shadow-lg h-[350px] md:h-[450px]">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover brightness-90"
              />
              <div className="absolute inset-0 bg-black/40"></div>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-20">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#fff1f3] drop-shadow-md">
                  {banner.title}
                </h2>
                <p className="text-base md:text-lg mb-5 text-[#ffe4e9]">{banner.subtitle}</p>
                <Link
                  to="/product"
                  className="bg-[#ff8fab] hover:bg-[#ff6b81] text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all duration-300 transform hover:scale-105"
                >
                  Xem ngay
                </Link>
              </div>
            </div>
          ))}

          {/* Nút điều hướng */}
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#ffffff90] hover:bg-[#ffffffcc] text-pink-600 text-4xl font-bold p-2 rounded-full backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-110 z-30"
          >
            ❮
          </button>
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#ffffff90] hover:bg-[#ffffffcc] text-pink-600 text-4xl font-bold p-2 rounded-full backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-110 z-30"
          >
            ❯
          </button>

          {/* Dấu chấm nhỏ */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-30">
            {banners.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${
                  currentIndex === i ? "bg-[#ff8fab]" : "bg-white/50"
                }`}
              ></div>
            ))}
          </div>
        </section>

        {/* 🌿 Sản phẩm nổi bật */}
        <section className="best-seller py-12 px-4 text-center max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-green-700 mb-3">
              <i className="fas fa-star text-yellow-500 mr-3"></i>
              Top bán chạy nhất tuần
            </h2>
            <p className="text-gray-600 text-lg">
              Khám phá những sản phẩm được yêu thích nhất
            </p>
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
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </section>

        {/* 💚 Lý do chọn chúng tôi */}
        <section className="features py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Tại sao chọn chúng tôi?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="feature-item text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-4xl text-green-700 mb-4">🚚</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Giao hàng nhanh</h3>
                <p className="text-gray-600">
                  Giao hàng trong ngày tại TP.HCM và các tỉnh lân cận
                </p>
              </div>

              <div className="feature-item text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-4xl text-green-700 mb-4">🌸</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Hoa tươi mỗi ngày</h3>
                <p className="text-gray-600">
                  Cam kết hoa tươi, được nhập mỗi ngày từ các vườn hoa uy tín
                </p>
              </div>

              <div className="feature-item text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="text-4xl text-green-700 mb-4">💝</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">Thiết kế độc đáo</h3>
                <p className="text-gray-600">
                  Đội ngũ florist chuyên nghiệp, tạo ra những tác phẩm độc đáo
                </p>
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
