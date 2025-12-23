import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const hideTimeout = useRef(null);

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/categories`);
      if (Array.isArray(res.data)) setCategories(res.data);
      else setCategories([]);
    } catch (err) {
      console.error("Navbar: Error fetching categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    hideTimeout.current = setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  return (
 <nav
  className="
    bg-[#1e293b]
    text-white
    shadow-md
    w-full
    sticky
    z-30
  "
  style={{
    top: "var(--header-height)",   // ⭐ navbar luôn nằm ngay dưới header
  }}
>

      <div className="max-w-7xl mx-auto flex justify-center py-2 px-6">
        <ul className="flex items-center justify-around gap-8 
                       text-base font-medium">
          
          <li>
            <Link to="/" className="hover:text-[#f472b6] transition">
              Trang chủ
            </Link>
          </li>

          <li>
            <Link to="/product" className="hover:text-[#f472b6] transition">
              Sản phẩm
            </Link>
          </li>

          {/* DANH MỤC */}
          <li
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex items-center gap-1 hover:text-[#f472b6] transition">
              Danh mục <span className="text-sm">▼</span>
            </button>

            {showDropdown && (
              <div
                className="
                  absolute top-full left-1/2 -translate-x-1/2 
                  bg-white border border-gray-200 shadow-xl rounded-xl 
                  mt-2 w-60 z-50 animate-fadeIn
                "
              >
                {loading ? (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    Đang tải danh mục...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="p-3 text-center text-gray-600 text-sm">
                    Chưa có danh mục
                  </div>
                ) : (
                  <ul className="max-h-72 overflow-y-auto">
                    {categories.map((category) => (
                      <li key={category._id}>
                        <Link
                          to={`/category/${category.slug}`}
                          className="block px-4 py-2 text-gray-800 
                                     hover:bg-[#fdf2f8] hover:text-[#d9467a]
                                     transition"
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                    <li className="border-t border-gray-200">
                      <Link
                        to="/product"
                        className="block px-4 py-2 text-center text-[#d9467a] 
                                   font-semibold hover:underline"
                      >
                        Xem tất cả
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </li>

          


<li>
            <Link to="/about" className="hover:text-[#f472b6] transition">
              Giới thiệu
            </Link>
          </li>

          <li>
            <Link to="/contact" className="hover:text-[#f472b6] transition">
              Liên hệ
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

