import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Navbar: Error fetching categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-accent text-light flex justify-between items-center py-3 px-8 shadow-md relative z-20">
      {/* Logo */}
      <Link
        to="/"
        className="text-2xl font-bold text-primary tracking-wide flex items-center gap-2"
      >
        🌸 <span className="text-light">DDT</span> <span className="text-primary">Flower</span>
      </Link>

      {/* Dropdown danh mục */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-primary text-light font-semibold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#d55b6f] transition-all shadow"
        >
          ☰ Danh mục sản phẩm
          <span className="ml-1 text-sm opacity-90">
            {loading ? "..." : `(${categories.length})`}
          </span>
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 w-72 bg-secondary shadow-lg rounded-xl mt-2 border border-[#e6ddd5] overflow-hidden animate-fadeIn">
            {loading ? (
              <div className="p-4 text-center text-accent">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                <p>Đang tải danh mục...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-3xl mb-2">📝</div>
                <p className="text-accent font-medium mb-1">
                  Chưa có danh mục nào
                </p>
                <Link
                  to="/admin/categories"
                  className="text-primary font-semibold hover:underline"
                  onClick={() => setShowDropdown(false)}
                >
                  Thêm danh mục
                </Link>
              </div>
            ) : (
              <ul className="py-2 max-h-80 overflow-y-auto">
                {categories.map((category) => (
                  <li
                    key={category._id}
                    className="px-4 py-2 hover:bg-[#f8efeb] text-accent border-b border-[#efe5dd] last:border-none"
                  >
                    <Link
                      to={`/category/${category.slug}`}
                      onClick={() => setShowDropdown(false)}
                      className="flex justify-between items-center group"
                    >
                      <span className="group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                      <span className="text-gray-400 text-xs group-hover:text-primary">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
                <li className="px-4 py-3 border-t border-[#e4d8ce] bg-[#faf8f6] text-center">
                  <Link
                    to="/product"
                    className="text-primary font-bold hover:underline"
                    onClick={() => setShowDropdown(false)}
                  >
                    📦 Xem tất cả sản phẩm
                  </Link>
                </li>
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Menu chính */}
      <div className="flex gap-8 text-base font-medium">
        <Link
          to="/"
          className="hover:text-primary transition-colors duration-200"
        >
          Trang chủ
        </Link>
        <Link
          to="/product"
          className="hover:text-primary transition-colors duration-200"
        >
          Sản phẩm
        </Link>
        <Link
          to="/about"
          className="hover:text-primary transition-colors duration-200"
        >
          Giới thiệu
        </Link>
        <Link
          to="/contact"
          className="hover:text-primary transition-colors duration-200"
        >
          Liên hệ
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
