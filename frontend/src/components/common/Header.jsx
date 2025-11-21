import React, { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { categoryAPI } from "../../api";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const headerRef = useRef(null); // ⭐ create ref

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

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

    navigate(`/product${params.toString() ? `?${params}` : ""}`);
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
                <Link to="/profile" className="hover:text-pink-300">{user.name}</Link>

                {user.role === "admin" && (
                  <Link to="/admin/dashboard" className="hover:text-pink-300">
                    Quản trị
                  </Link>
                )}

                <button onClick={logout} className="hover:text-pink-300">
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link to="/login" className="hover:text-pink-300">Đăng nhập</Link>
            )}
          </div>
        </div>

        {/* MAIN HEADER */}
        <div className="bg-[#fffaf8] shadow-md border-b border-[#f0e2da] px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">

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

            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center border border-[#f0e2da] rounded-full overflow-hidden w-1/2 bg-white"
            >
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-10 bg-[#fff1f3] text-[#4b2c2b] px-3 text-sm focus:outline-none w-24"
              >
                <option value="all">Tất cả</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                ))}
              </select>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm hoa..."
                className="flex-1 px-3 py-2 focus:outline-none text-[#4b2c2b]"
              />

              <button
                type="submit"
                className="bg-[#d15574] text-white px-4 py-2 hover:bg-[#b74662] transition"
              >
                <i className="fas fa-search"></i>
              </button>
            </form>

            <Link
              to="/cart"
              className="relative bg-[#d15574] text-white px-5 py-2 rounded-full flex items-center gap-2 hover:bg-[#b74662] transition shadow-sm"
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
        </div>
      </div>

      {/* SPACER AUTO — dùng JS set đúng chiều cao header */}
      <div
        style={{
          height: `${headerRef.current?.offsetHeight || 110}px`,
        }}
      ></div>
    </>
  );
};

export default Header;
