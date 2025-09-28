// src/components/common/Header.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import { productAPI, categoryAPI } from '../../api'; // Import từ file API

const Header = () => {
  const { user, logout, isAdmin } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Tính tổng sản phẩm trong giỏ hàng
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Load danh mục khi component mount
  useEffect(() => {
    fetchCategories();
    
    // Lấy search params từ URL khi trang load
    const params = new URLSearchParams(location.search);
    const search = params.get('q') || '';
    const category = params.get('category') || 'all';
    
    setSearchTerm(search);
    setSelectedCategory(category);
  }, [location.search]);

  // Fetch categories từ API
  const fetchCategories = async () => {
    try {
      // Sử dụng API từ file index.js
      const response = await categoryAPI.getCategories();
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories
      setCategories([
        { _id: 'hoa-cuoi', name: 'Hoa cưới', slug: 'hoa-cuoi' },
        { _id: 'hoa-sinh-nhat', name: 'Hoa sinh nhật', slug: 'hoa-sinh-nhat' },
        { _id: 'hoa-chuc-mung', name: 'Hoa chúc mừng', slug: 'hoa-chuc-mung' },
        { _id: 'hoa-valentine', name: 'Hoa Valentine', slug: 'hoa-valentine' }
      ]);
    }
  };

  // Fetch suggestions khi user nhập
  const fetchSuggestions = async (term) => {
    if (term.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // Sử dụng API từ file index.js
      const response = await productAPI.getSearchSuggestions(term);
      setSuggestions(response.data?.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  // Xử lý khi user nhập vào ô tìm kiếm
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce suggestions
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      fetchSuggestions(value);
      setShowSuggestions(value.length > 0);
    }, 300);
  };

  // Xử lý submit form tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  // Thực hiện tìm kiếm
  const performSearch = () => {
    if (!searchTerm.trim() && selectedCategory === 'all') {
      navigate('/product');
      return;
    }

    // Tạo query params
    const params = new URLSearchParams();
    
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    
    // Navigate với query params
    const queryString = params.toString();
    navigate(`/product${queryString ? `?${queryString}` : ''}`);
    
    // Ẩn suggestions
    setShowSuggestions(false);
  };

  // Chọn suggestion
  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    
    // Tự động search
    const params = new URLSearchParams();
    params.set('q', suggestion);
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    
    navigate(`/product?${params.toString()}`);
  };

  return (
    <>
      <div className="top-bar bg-green-800 text-white py-2 px-4 flex justify-between w-full">
        <p>DTP Flower Shop</p>
        <div className="top-links flex gap-4">
          {user ? (
            <>
              <Link to="/profile" className="text-white no-underline">{user.name}</Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="text-white no-underline">Quản trị</Link>
              )}
              <button onClick={logout} className="text-white bg-transparent border-0 cursor-pointer">Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white no-underline">Tài khoản</Link>
            </>
          )}
        </div>
      </div>

      <header className="header bg-gray-200 p-4">
        <div className="header-main flex justify-between items-center">
          <div className="logo">
            <Link to="/">
              <img src="/DTP.png" alt="Logo" className="h-24 w-auto" />
            </Link>
          </div>

          {/* Enhanced Search Box */}
          <div className="search-container relative w-full max-w-md mx-5">
            <form onSubmit={handleSearchSubmit} className="search-box flex items-center border-2 border-green-600 rounded-lg overflow-hidden bg-white">
              {/* Category Selector */}
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 border-none bg-gray-100 px-3 text-sm cursor-pointer focus:outline-none"
              >
                <option value="all">Tất cả</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              {/* Search Input */}
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchInputChange}
                onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Tìm kiếm sản phẩm..."
                className="flex-1 h-10 border-none px-3 text-base focus:outline-none"
              />
              
              {/* Search Button */}
              <button 
                type="submit"
                className="h-10 bg-green-800 text-white cursor-pointer px-4 flex items-center justify-center hover:bg-green-700 transition-colors"
              >
                <i className="fas fa-search"></i>
              </button>
            </form>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <i className="fas fa-search text-gray-400 mr-2"></i>
                      <span>{suggestion}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Popular Searches */}
            {showSuggestions && suggestions.length === 0 && searchTerm.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50">
                <div className="px-4 py-2 text-gray-500 text-sm border-b">
                  Từ khóa phổ biến:
                </div>
                {['hoa hồng', 'hoa sinh nhật', 'hoa cưới', 'hoa valentine'].map((keyword, index) => (
                  <div
                    key={index}
                    onClick={() => selectSuggestion(keyword)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center">
                      <i className="fas fa-fire text-orange-400 mr-2"></i>
                      <span>{keyword}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="cart no-underline text-white bg-green-800 px-5 py-2 rounded-full text-lg font-bold flex items-center gap-2 relative hover:bg-green-700 transition-all duration-300 hover:scale-110"
          >
            <i className="fas fa-shopping-cart"></i> Giỏ hàng
            {cartCount > 0 && (
              <span className="cart-count absolute -top-1 -right-2 bg-orange-500 text-white text-xs p-1 rounded-full font-bold animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>
    </>
  );
};

export default Header;