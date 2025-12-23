import React, { useState, useEffect, useCallback } from "react";
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
  // const [totalPages, setTotalPages] = useState(1);
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
  // 🔥 Lấy danh sách dịp tặng từ sản phẩm
  // ========================================================
  const [uniqueOccasions, setUniqueOccasions] = useState([]);

  const extractOccasions = useCallback((items) => {
    const values = items
      .map((p) => p.occasion)
      .filter((v) => v && v !== "");

    setUniqueOccasions([...new Set(values)]);
  }, []);

  const formatCategoryName = useCallback((slug) => {
    if (!slug) return "";
    return slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, []);

  // ========================================================
  // 🔥 Fetch products (ĐÃ BỌC useCallback → HẾT WARNING)
  // ========================================================
  const fetchProducts = useCallback(async () => {
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

      const data = res.data || {};

      setProducts(data.products || []);
 //     setTotalPages(data.pages || 1);
      setTotalProducts(data.total || 0);

      extractOccasions(data.products || []);

      if (slug) setCategoryName(formatCategoryName(slug));
      else if (searchQuery) setCategoryName("Kết quả tìm kiếm");
      else setCategoryName("Tất cả sản phẩm");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    slug,
    categoryQuery,
    priceQuery,
    flowerQuery,
    occasionQuery,
    currentPage,
    extractOccasions,
    formatCategoryName,
  ]);

  // ========================================================
  // 🔥 useEffect CHUẨN – KHÔNG CÒN ESLINT WARNING
  // ========================================================
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ========================================================
  // 🔥 Update query
  // ========================================================
  const updateQuery = (key, value) => {
    const params = new URLSearchParams(location.search);

    if (value) params.set(key, value);
    else params.delete(key);

    params.delete("page");
    navigate(`/product?${params.toString()}`);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    navigate("/product");
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

  // ========================================================
  // JSX
  // ========================================================
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <Navbar />

      <main className="w-full px-6 py-8 flex-1">
        <h1 className="text-3xl font-playfair font-bold text-[#4b2c35] mb-2">
          {categoryName}
        </h1>

        <p className="text-gray-500 mb-8">
          {searchQuery
            ? `Kết quả tìm kiếm cho “${searchQuery}”`
            : slug
            ? `Những mẫu hoa ${categoryName.toLowerCase()} được yêu thích`
            : "Những mẫu hoa phù hợp cho dịp đặc biệt của bạn"}
        </p>

        {/* SORT */}
        <div className="bg-white border border-pink-100 rounded-xl px-4 py-3 mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <p className="text-gray-600 text-sm">
            Hiển thị <b>{products.length}</b> / {totalProducts} sản phẩm
          </p>

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

        {/* MAIN */}
        <div className="grid grid-cols-[260px_1fr] gap-10 items-start">
          {/* SIDEBAR */}
          <aside className="hidden md:block bg-white border border-pink-100 rounded-xl p-5 sticky top-28 h-fit">
            <h3 className="font-semibold mb-3">Bộ lọc</h3>

            <button
              onClick={clearFilters}
              className="mb-4 text-sm text-[#e06c7f] underline"
            >
              Xóa bộ lọc
            </button>

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

          {/* PRODUCTS */}
          <div>
            {loading ? (
              <p className="text-center py-10 text-gray-500">
                Đang tải sản phẩm...
              </p>
            ) : sortedProducts.length === 0 ? (
              <p className="text-center py-10 text-gray-500">
                Không có sản phẩm nào
              </p>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
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
