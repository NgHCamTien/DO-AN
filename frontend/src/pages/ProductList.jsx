import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

import Header from "../components/common/Header";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import ProductCard from "../components/product/ProductCard";
import { productAPI } from "../api";

const ProductList = () => {
  const { slug } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const searchQuery = queryParams.get("q");
  const categoryQuery = queryParams.get("category");

  const [sortOption, setSortOption] = useState("alpha-asc");
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("Tất cả sản phẩm");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [priceFilter, setPriceFilter] = useState(null);
  const [flowerFilter, setFlowerFilter] = useState(null);
  const [occasionFilter, setOccasionFilter] = useState(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [slug, searchQuery, categoryQuery, priceFilter, flowerFilter, occasionFilter]);

  useEffect(() => {
    fetchProducts();
  }, [slug, searchQuery, categoryQuery, currentPage, priceFilter, flowerFilter, occasionFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProducts({
        search: searchQuery || "",
        category: slug || categoryQuery || "",
        price: priceFilter,
        flower: flowerFilter,
        occasion: occasionFilter,
        page: currentPage,
      });

      const data = response.data;

      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotalProducts(data.total || 0);

      if (slug) setCategoryName(`Danh mục: ${slug}`);
      else if (searchQuery) setCategoryName("Kết quả tìm kiếm");
      else setCategoryName("Tất cả sản phẩm");

    } catch (err) {
      console.error("Lỗi khi tải sản phẩm:", err);
      setError("Không thể tải sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOption) {
      case "alpha-asc": return a.name.localeCompare(b.name, "vi");
      case "alpha-desc": return b.name.localeCompare(a.name, "vi");
      case "price-asc": return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      case "price-desc": return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      case "newest": return new Date(b.createdAt) - new Date(a.createdAt);
      default: return 0;
    }
  });

  const clearFilters = () => {
    setPriceFilter(null);
    setFlowerFilter(null);
    setOccasionFilter(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1">

        <h1 className="text-3xl font-bold mb-4">{categoryName}</h1>

        <div className="bg-white border border-pink-100 shadow-sm rounded-xl px-4 py-3 mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <p className="text-gray-600 text-sm">
            Hiển thị <b>{products.length}</b> / {totalProducts} sản phẩm
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Sắp xếp:</span>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-pink-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer hover:border-[#e06c7f]"
            >
              <option value="alpha-asc">Tên: A → Z</option>
              <option value="alpha-desc">Tên: Z → A</option>
              <option value="price-asc">Giá: thấp → cao</option>
              <option value="price-desc">Giá: cao → thấp</option>
              <option value="newest">Mới nhất</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar */}
          <aside className="hidden md:block w-[260px] bg-white border border-pink-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Bộ lọc</h3>

            <button onClick={clearFilters} className="mb-4 text-sm text-[#e06c7f] underline">
              Xóa bộ lọc
            </button>

            <div className="mb-4">
              <p className="font-medium mb-2">Giá</p>
              <ul className="space-y-1 text-sm">
                <li><button onClick={() => setPriceFilter("under-200")}>Dưới 200.000đ</button></li>
                <li><button onClick={() => setPriceFilter("200-400")}>200.000đ – 400.000đ</button></li>
                <li><button onClick={() => setPriceFilter("above-400")}>Trên 400.000đ</button></li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-medium mb-2">Loại hoa</p>
              <ul className="space-y-1 text-sm">
                <li><button onClick={() => setFlowerFilter("hong")}>Hoa hồng</button></li>
                <li><button onClick={() => setFlowerFilter("baby")}>Hoa baby</button></li>
                <li><button onClick={() => setFlowerFilter("huongduong")}>Hướng dương</button></li>
              </ul>
            </div>

            <div className="mb-4">
              <p className="font-medium mb-2">Dịp tặng</p>
              <ul className="space-y-1 text-sm">
                <li><button onClick={() => setOccasionFilter("birthday")}>Sinh nhật</button></li>
                <li><button onClick={() => setOccasionFilter("graduation")}>Tốt nghiệp</button></li>
                <li><button onClick={() => setOccasionFilter("opening")}>Khai trương</button></li>
              </ul>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-10">
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
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
