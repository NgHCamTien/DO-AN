import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/product/ProductCard';

// ✅ Đảm bảo đường dẫn này đúng với cấu trúc thư mục bạn vừa sửa
import ChatBox from '../ChatBox'; 

// ✅ FIX LỖI 3: Mang banners ra ngoài component để nó không bị tạo lại mỗi lần render
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

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // --- Tự động chuyển slide ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []); // Banners giờ là biến tĩnh bên ngoài nên không cần thêm vào đây

  // --- Gọi API sản phẩm nổi bật ---
  // ✅ FIX LỖI 2: Đưa fetchData vào trong useEffect
  useEffect(() => {
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

    fetchData();
  }, [API_URL]); // Thêm API_URL vào dependency cho đúng chuẩn

  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <Navbar />

      <main className="flex-1">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded m-4 max-w-7xl mx-auto">
             {error}
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
              <img src={banner.image} alt={banner.title} className="w-full h-full object-cover brightness-90" />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 z-20">
                <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#fff1f3] drop-shadow-md">
                  {banner.title}
                </h2>
                <p className="text-base md:text-lg mb-5 text-[#ffe4e9]">{banner.subtitle}</p>
                <Link to="/product" className="bg-[#ff8fab] hover:bg-[#ff6b81] text-white font-semibold px-6 py-2 rounded-full shadow-md transition-all">
                  Xem ngay
                </Link>
              </div>
            </div>
          ))}
        </section>

        {/* 🌿 Sản phẩm nổi bật */}
        <section className="best-seller py-12 px-4 text-center max-w-7xl mx-auto">
           {/* (Giữ nguyên phần hiển thị sản phẩm của bạn) */}
           <h2 className="text-3xl font-bold text-green-700 mb-8">Top bán chạy nhất tuần</h2>
           
           {loading ? (
             <p>Đang tải...</p>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
             </div>
           )}
        </section>
      </main>

      <Footer />

      {/* ✅ FIX LỖI 1: Thêm ChatBox vào đây */}
      <ChatBox /> 
    </div>
  );
};

export default Home;