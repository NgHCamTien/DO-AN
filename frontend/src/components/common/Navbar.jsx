import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Navbar = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Base API URL
  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Navbar: Fetching categories from database...');
      const response = await axios.get(`${API_BASE_URL}/categories`);
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Navbar: Categories loaded:', response.data.length);
        setCategories(response.data);
      } else {
        console.warn('Navbar: No categories found in database');
        setCategories([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Navbar: Error fetching categories:', error);
      setCategories([]);
      setLoading(false);
    }
  };

  return (
    <nav className="menu bg-green-800 text-white flex justify-center items-center gap-8 py-3 px-4">
      <div className="relative">
        <button 
          className="menu-button bg-white text-green-800 border-none py-2 px-4 rounded cursor-pointer font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          ☰ DANH MỤC SẢN PHẨM
          <span className="ml-1 text-xs">
            {loading ? '...' : `(${categories.length})`}
          </span>
        </button>
        
        {showDropdown && (
          <div className="absolute top-full left-0 w-72 bg-white shadow-lg z-10 mt-1 rounded-lg border">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-700 mx-auto mb-2"></div>
                <p className="text-green-800 text-sm">Đang tải danh mục...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-4 text-center">
                <div className="text-gray-400 text-3xl mb-2">📝</div>
                <p className="text-green-800 font-medium mb-2">Chưa có danh mục nào</p>
                <p className="text-gray-600 text-sm mb-3">Hãy thêm danh mục từ trang quản trị</p>
                <Link 
                  to="/admin/categories"
                  className="inline-block bg-green-700 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  onClick={() => setShowDropdown(false)}
                >
                  Quản lý danh mục
                </Link>
              </div>
            ) : (
              <ul className="py-2 max-h-80 overflow-y-auto">
                {categories.map((category) => (
                  <li 
                    key={category._id}
                    className="px-4 py-3 hover:bg-gray-100 text-green-800 font-medium border-b border-gray-100 last:border-b-0"
                  >
                    <Link 
                      to={`/category/${category.slug}`} 
                      className="block w-full flex items-center justify-between group"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span className="group-hover:text-green-600">{category.name}</span>
                      <span className="text-gray-400 text-xs">→</span>
                    </Link>
                  </li>
                ))}
                
                {/* Link xem tất cả */}
                <li className="px-4 py-3 border-t-2 border-gray-200">
                  <Link 
                    to="/product" 
                    className="block w-full text-center text-green-700 font-bold hover:text-green-800"
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
      
      <div className="menu-links flex gap-6">
        <Link to="/" className="text-white no-underline font-medium hover:underline transition-all">Trang chủ</Link>
        <Link to="/product" className="text-white no-underline font-medium hover:underline transition-all">Sản phẩm</Link>
      </div>
    </nav>
  );
};

export default Navbar;