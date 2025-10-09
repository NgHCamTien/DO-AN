import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { productAPI, categoryAPI } from "../../api";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    fetchCategories();
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("q") || "");
    setSelectedCategory(params.get("category") || "all");
  }, [location.search]);

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getCategories();
      if (Array.isArray(res.data)) setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    navigate(`/product${params.toString() ? `?${params.toString()}` : ""}`);
    setShowSuggestions(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-800 text-white text-sm flex justify-between px-6 py-2">
        <p>🌸 DDT Flower Shop - Nơi gửi gắm yêu thương 🌸</p>
        <div className="flex gap-4">
          {user ? (
            <>
              <Link to="/profile">{user.name}</Link>
              {user.role === "admin" && (
                <Link to="/admin/dashboard">Quản trị</Link>
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

      {/* Main Header */}
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/DDT.png"
            alt="Logo"
            className="w-14 h-14 rounded-full border"
          />
          <span className="text-2xl font-serif text-gray-700">
            Petals & Poetry
          </span>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center border border-gray-300 rounded-full overflow-hidden w-1/2"
        >
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 bg-gray-100 px-3 text-sm focus:outline-none"
          >
            <option value="all">Tất cả</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm hoa..."
            className="flex-1 px-3 py-2 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-pink-500 text-white px-4 py-2 hover:bg-pink-600"
          >
            <i className="fas fa-search"></i>
          </button>
        </form>

        {/* Cart */}
        <Link
          to="/cart"
          className="relative bg-pink-500 text-white px-5 py-2 rounded-full flex items-center gap-2"
        >
          <i className="fas fa-shopping-cart"></i>
          <span>Giỏ hàng</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-1">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Header;
