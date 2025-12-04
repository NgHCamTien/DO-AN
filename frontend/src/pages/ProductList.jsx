import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import Header from "../components/common/Header";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import ProductCard from "../components/product/ProductCard";
import { productAPI } from "../api";

const ProductList = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);

  const searchQuery = queryParams.get("q") || "";
  const categoryQuery = queryParams.get("category") || "";
  const priceQuery = queryParams.get("price") || "";
  const flowerQuery = queryParams.get("flower") || "";
  const occasionQuery = queryParams.get("occasion") || "";

  const [products, setProducts] = useState([]);
  const [sortOption, setSortOption] = useState("alpha-asc");
  const [categoryName, setCategoryName] = useState("Tất cả sản phẩm");

  const [currentPage, setCurrentPage] = useState(
    Number(queryParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [loading, setLoading] = useState(true);

  // ========================================================
  // ⭐ Map dịp tặng → tiếng Việt
  // ========================================================
  const OCCASION_LABELS = {
    birthday: "Sinh nhật",
    love: "Tình yêu",
    opening: "Khai trương",
    graduation: "Tốt nghiệp",
  };

  // ========================================================
  // 🔥 Lấy danh sách dịp tặng từ sản phẩm (tự động)
  // ========================================================
  const [uniqueOccasions, setUniqueOccasions] = useState([]);

  const extractOccasions = (items) => {
    const values = items
      .map((p) => p.occasion)
      .filter((v) => v && v !== "" && v !== null);

    const unique = [...new Set(values)];
    setUniqueOccasions(unique);
  };

  // ========================================================
  // 🔥 Gọi API mỗi khi filter/search/page thay đổi
  // ========================================================
  useEffect(() => {
    fetchProducts();
  }, [
    slug,
    searchQuery,
    categoryQuery,
    priceQuery,
    flowerQuery,
    occasionQuery,
    currentPage,
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await productAPI.getProducts({
        search: searchQuery,
        category: slug || categoryQuery,
        price: priceQuery,
        flower: flowerQuery,
        occasion: occasionQuery,
        page: currentPage,
      });

      const data = res.data;

      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotalProducts(data.total || 0);

      extractOccasions(data.products || []);

      if (slug) setCategoryName(`Danh mục: ${slug}`);
      else if (searchQuery) setCategoryName("Kết quả tìm kiếm");
      else setCategoryName("Tất cả sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  // ========================================================
  // 🔥 Hàm cập nhật URL khi user click filter
  // ========================================================
  const updateQuery = (key, value) => {
    const params = new URLSearchParams(location.search);

    if (value) params.set(key, value);
    else params.delete(key);

    params.delete("page"); // reset page về 1

    navigate(`/product?${params.toString()}`);
    setCurrentPage(1);
  };

  // ========================================================
  // 🔥 Sort local
  // ========================================================
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case "alpha-asc":
        return a.name.localeCompare(b.name, "vi");
      case "alpha-desc":
        return b.name.localeCompare(a.name, "vi");
      case "price-asc":
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case "price-desc":
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    navigate("/product");
    setCurrentPage(1);
  };

  // ========================================================
  // JSX Render
  // ========================================================
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <Navbar />

      <main className="w-full px-6 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-6">{categoryName}</h1>

        {/* Sort + Count */}
        <div className="bg-white border border-pink-100 rounded-xl px-4 py-3 mb-8 
                        flex flex-col md:flex-row justify-between md:items-center gap-4">
          <p className="text-gray-600 text-sm">
            Hiển thị <b>{products.length}</b> / {totalProducts} sản phẩm
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sắp xếp:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-pink-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              <option value="alpha-asc">Tên: A → Z</option>
              <option value="alpha-desc">Tên: Z → A</option>
              <option value="price-asc">Giá: thấp → cao</option>
              <option value="price-desc">Giá: cao → thấp</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-[260px_1fr] gap-10 items-start min-h-[500px]">

          {/* Sidebar */}
          <aside className="hidden md:block bg-white border border-pink-100 rounded-xl p-5 shadow-sm
                            sticky top-28 h-fit w-[260px]">

            <h3 className="font-semibold mb-3">Bộ lọc</h3>

            <button
              onClick={clearFilters}
              className="mb-4 text-sm text-[#e06c7f] underline"
            >
              Xóa bộ lọc
            </button>

            {/* PRICE */}
            <div className="mb-4">
              <p className="font-medium mb-2">Giá</p>
              <ul className="space-y-1 text-sm">
                <li><button onClick={() => updateQuery("price", "under-200")}>Dưới 200.000đ</button></li>
                <li><button onClick={() => updateQuery("price", "200-400")}>200.000 - 400.000đ</button></li>
                <li><button onClick={() => updateQuery("price", "above-400")}>Trên 400.000đ</button></li>
              </ul>
            </div>

            {/* FLOWER TYPES */}
            <div className="mb-4">
              <p className="font-medium mb-2">Loại hoa</p>
              <ul className="space-y-1 text-sm">
                <li><button onClick={() => updateQuery("flower", "Hoa hồng")}>Hoa hồng</button></li>
                <li><button onClick={() => updateQuery("flower", "Hoa baby")}>Hoa baby</button></li>
                <li><button onClick={() => updateQuery("flower", "Hoa hướng dương")}>Hoa hướng dương</button></li>
                <li><button onClick={() => updateQuery("flower", "Hoa lan")}>Hoa lan</button></li>
                <li><button onClick={() => updateQuery("flower", "Hoa cẩm tú cầu")}>Hoa cẩm tú cầu</button></li>
                <li><button onClick={() => updateQuery("flower", "Hoa cẩm chướng")}>Hoa cẩm chướng</button></li>
              </ul>
            </div>

            {/* OCCASION */}
            <div className="mb-4">
              <p className="font-medium mb-2">Dịp tặng</p>

              {uniqueOccasions.length === 0 ? (
                <p className="text-sm text-gray-400">Không có dữ liệu</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {uniqueOccasions.map((o, i) => (
                    <li key={i}>
                      <button
                        onClick={() => updateQuery("occasion", o)}
                        className="hover:underline"
                      >
                        {OCCASION_LABELS[o] || o}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="flex-1 min-h-[400px]">

            {loading ? (
              <p className="text-center py-10 text-gray-500">Đang tải sản phẩm...</p>
            ) : sortedProducts.length === 0 ? (
              <p className="text-center py-10 text-gray-500">Không có sản phẩm nào</p>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => updateQuery("page", index + 1)}
                      className={`px-4 py-2 rounded-lg border ${
                        currentPage === index + 1
                          ? "bg-[#e06c7f] text-white border-[#e06c7f]"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductList;
