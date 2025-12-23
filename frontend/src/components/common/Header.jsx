
import React, { useContext, useState, useEffect, useRef } from "react";

import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { FaClipboardCheck } from "react-icons/fa";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const headerRef = useRef(null);
  const searchWrapperRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("q") || "");
  }, [location.search]);

  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/products/suggest?q=${encodeURIComponent(
            searchTerm.trim()
          )}`,
          { signal: controller.signal }
        );
        setSuggestions(res.data.results || []);
        setShowSuggestions(true);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Suggest error:", err);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);

    setShowSuggestions(false);
    navigate(`/product${params.toString() ? `?${params}` : ""}`);
  };

  const handleSuggestionClick = (id) => {
    setShowSuggestions(false);
    setSearchTerm("");
    navigate(`/product-detail/${id}`);
  };

  return (
    <>
      <div
        ref={headerRef}
        id="header-wrapper"
        className="fixed top-0 left-0 w-full z-50"
        style={{
          "--header-height": `${headerRef.current?.offsetHeight || 110}px`,
        }}
      >
        {/* TOP BAR */}
        <div className="bg-gray-800 text-white text-sm flex justify-between px-6 py-2">
          <p>🌸 DDT Flower Shop - Nơi gửi gắm yêu thương 🌸</p>

          <div className="flex gap-4">
            {user ? (
              <>
                <Link to="/profile" className="hover:text-pink-300">
                  {user.name}
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="hover:text-pink-300"
                  >
                    Quản trị
                  </Link>
                )}

                <button onClick={logout} className="hover:text-pink-300">
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-pink-300">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>

        {/* MAIN HEADER */}
        <div className="bg-[#fffdfd] shadow-md border-b border-[#f0e2da] px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/DDT.png"
                alt="Logo"
                className="w-14 h-14 rounded-full border border-[#f0e2da] shadow-sm"
              />
              <span className="text-2xl font-serif text-[#4b2c2b] font-semibold">
                DDT Flower
              </span>
            </Link>

            {/* Search */}
            <div className="relative flex-1 max-w-xl" ref={searchWrapperRef}>
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center border border-[#f0e2da] rounded-full overflow-hidden bg-white"
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên hoa, loại hoa, tag, dịp tặng..."
                  className="flex-1 px-4 py-2 focus:outline-none text-[#4b2c2b] text-sm"
                />

                <button
                  type="submit"
                  className="bg-[#d15574] text-white px-4 py-2 hover:bg-[#b74662] transition"
                >
                  <i className="fas fa-search" />
                </button>
              </form>


              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-pink-100 rounded-xl shadow-lg max-h-72 overflow-y-auto text-sm z-50">
                  {suggestions.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => handleSuggestionClick(item._id)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-pink-50 text-left"
                    >
                      {item.thumbnail && (
                        <img
                          src={`${API_URL}${item.thumbnail}`}
                          alt={item.name}
                          className="w-10 h-10 rounded-md object-cover border border-pink-100"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-[#4b2c2b] line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.discountPrice
                            ? `${item.discountPrice.toLocaleString(
                                "vi-VN"
                              )}đ`
                            : `${item.price.toLocaleString("vi-VN")}đ`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-3">
              {user && (
                <Link
                  to="/payment-tracking"
                  className="flex items-center gap-2 px-4 py-2 rounded-full 
                             bg-[#fff0f4] text-[#e06c7f]
                             hover:bg-[#ffe1ea] transition shadow-sm"
                >
                  <FaClipboardCheck />
                  Theo dõi thanh toán
                </Link>
              )}

              <Link
                to="/cart"
                className="relative bg-[#d15574] text-white px-5 py-2 rounded-full flex items-center gap-2 hover:bg-[#b74662] transition shadow-sm"
              >
                <i className="fas fa-shopping-cart" />
                <span>Giỏ hàng</span>

                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

     
      <div
        style={{
          height: `${headerRef.current?.offsetHeight || 110}px`,
        }}
      />
    </>
  );
};


export default Header;

