import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import ProductCard from '../components/product/ProductCard';
import { productAPI, categoryAPI } from '../api'; // Import từ file API

const ProductList = () => {
  const { slug } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');
  const categoryQuery = queryParams.get('category');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [categoryName, setCategoryName] = useState('');
  const [category, setCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  useEffect(() => {
    setCurrentPage(1); // Reset về trang 1 khi search mới
    fetchProducts();
  }, [slug, searchQuery, categoryQuery]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('=== FETCH PRODUCTS DEBUG ===');
      console.log('Current slug:', slug);
      console.log('Search query:', searchQuery);
      console.log('Category query:', categoryQuery);
      console.log('Current page:', currentPage);
      
      let response;
      
      // Xây dựng API call dựa trên loại tìm kiếm
      if (searchQuery || categoryQuery) {
        // Tìm kiếm với từ khóa và/hoặc danh mục
        console.log(`Calling search API with keyword: ${searchQuery}, category: ${categoryQuery}`);
        
        response = await productAPI.searchProducts({
          keyword: searchQuery,
          category: categoryQuery,
          page: currentPage
        });
        
        if (response.data) {
          const productsData = response.data.products || [];
          setProducts(productsData);
          setTotalPages(response.data.pages || 1);
          setTotalProducts(response.data.total || productsData.length);
          
          // Tạo tên hiển thị
          let displayName = '';
          if (searchQuery && categoryQuery && categoryQuery !== 'all') {
            displayName = `Tìm kiếm "${searchQuery}" trong danh mục "${categoryQuery}"`;
          } else if (searchQuery) {
            displayName = `Kết quả tìm kiếm: "${searchQuery}"`;
          } else if (categoryQuery && categoryQuery !== 'all') {
            displayName = `Danh mục: ${categoryQuery}`;
          }
          
          setCategoryName(displayName);
          
          console.log('Search API Response Debug:', {
            totalFromAPI: response.data.total,
            countFromAPI: response.data.count,
            productsLength: productsData.length,
            pagesFromAPI: response.data.pages
          });
        }
        
      } else if (slug) {
        // Xem sản phẩm theo category slug từ URL
        console.log(`Calling category API: ${slug}`);
        
        try {
          response = await categoryAPI.getProductsByCategory(slug, currentPage);
          console.log('Category API Response:', response.data);
          
          if (response.data) {
            const productsData = response.data.products || [];
            setProducts(productsData);
            setCategory(response.data.category);
            setCategoryName(response.data.category?.name || 'Danh mục');
            setTotalPages(response.data.pages || 1);
            setTotalProducts(response.data.total || productsData.length);
            
            console.log('Category API Response Debug:', {
              totalFromAPI: response.data.total,
              countFromAPI: response.data.count,
              productsLength: productsData.length,
              categoryName: response.data.category?.name
            });
          }
        } catch (categoryError) {
          console.error('Category API Error:', categoryError);
          
          // Fallback: gọi API sản phẩm chung
          response = await productAPI.getProducts('', currentPage);
          
          if (response.data) {
            const productsData = response.data.products || [];
            setProducts(productsData);
            setCategoryName(`Không tìm thấy danh mục "${slug}"`);
            setTotalPages(response.data.pages || 1);
            setTotalProducts(response.data.total || productsData.length);
          }
        }
        
      } else {
        // Hiển thị tất cả sản phẩm
        console.log(`Calling general API`);
        response = await productAPI.getProducts('', currentPage);
        
        if (response.data) {
          const productsData = response.data.products || [];
          setProducts(productsData);
          setCategoryName('Tất cả sản phẩm');
          setTotalPages(response.data.pages || 1);
          setTotalProducts(response.data.total || productsData.length);
          
          console.log('General API Response Debug:', {
            totalFromAPI: response.data.total,
            countFromAPI: response.data.count,
            productsLength: productsData.length,
            pagesFromAPI: response.data.pages
          });
        }
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('=== FETCH ERROR ===');
      console.error('Error details:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi tải sản phẩm.';
      
      if (error.response) {
        errorMessage = `Lỗi ${error.response.status}: ${error.response.data?.message || 'Không thể tải sản phẩm'}`;
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  // Sắp xếp sản phẩm
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOrder) {
      case 'price-asc':
        const priceA = a.discountPrice || a.price || 0;
        const priceB = b.discountPrice || b.price || 0;
        return priceA - priceB;
      case 'price-desc':
        const priceA2 = a.discountPrice || a.price || 0;
        const priceB2 = b.discountPrice || b.price || 0;
        return priceB2 - priceA2;
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '', 'vi');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '', 'vi');
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default:
        return 0;
    }
  });
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <Navbar />
        
        <main className="flex-1 p-4 max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tìm kiếm sản phẩm...</p>
              {searchQuery && (
                <p className="text-sm text-gray-500 mt-2">Từ khóa: "{searchQuery}"</p>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <Navbar />
        
        <main className="flex-1 p-4 max-w-7xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <h3 className="font-bold mb-2">Lỗi tải dữ liệu</h3>
            <p className="mb-3">{error}</p>
            
            <button 
              onClick={fetchProducts}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      
      <main className="flex-1 p-4 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <a href="/" className="hover:text-green-700">Trang chủ</a>
          <span className="mx-2">›</span>
          <span className="text-gray-700">Sản phẩm</span>
          {(searchQuery || categoryQuery) && (
            <>
              <span className="mx-2">›</span>
              <span className="text-gray-700">Tìm kiếm</span>
            </>
          )}
        </nav>

        {/* Search Summary */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{categoryName}</h1>
          
          {searchQuery && (
            <div className="text-gray-600 mb-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                Từ khóa: "{searchQuery}"
              </span>
            </div>
          )}
          
          {categoryQuery && categoryQuery !== 'all' && (
            <div className="text-gray-600 mb-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                Danh mục: {categoryQuery}
              </span>
            </div>
          )}
          
          {/* FIX: Hiển thị số sản phẩm chính xác */}
          <p className="text-gray-500">
            Tìm thấy <strong>{products.length}</strong> sản phẩm trên trang này
            {totalProducts > products.length && (
              <span> (Tổng cộng: <strong>{totalProducts}</strong> sản phẩm)</span>
            )}
            {totalPages > 1 && (
              <span> - Trang <strong>{currentPage}</strong>/<strong>{totalPages}</strong></span>
            )}
          </p>
        </div>
        
        {category && category.description && (
          <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">{category.description}</p>
        )}
        
        {/* Sort Options */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm">
          <div className="mb-4 md:mb-0 text-gray-500">
            Hiển thị <strong>{sortedProducts.length}</strong> sản phẩm
            {sortOrder !== 'default' && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                Đã sắp xếp
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium">Sắp xếp theo:</label>
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="default">Mặc định</option>
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
              <option value="name-asc">Tên: A-Z</option>
              <option value="name-desc">Tên: Z-A</option>
            </select>
          </div>
        </div>
        
        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="text-6xl text-gray-300 mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-600 mb-4">Không tìm thấy sản phẩm</h2>
              <p className="text-gray-500 mb-6">
                {searchQuery ? (
                  <>Không có sản phẩm nào phù hợp với từ khóa <strong>"{searchQuery}"</strong></>
                ) : (
                  'Không có sản phẩm nào trong danh mục này.'
                )}
              </p>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Gợi ý:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Kiểm tra lại chính tả từ khóa</li>
                  <li>• Thử sử dụng từ khóa khác</li>
                  <li>• Thử tìm kiếm trong tất cả danh mục</li>
                </ul>
              </div>
              
              <div className="space-x-4 mt-6">
                <button 
                  onClick={() => window.history.back()}
                  className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Quay lại
                </button>
                
                <a 
                  href="/products"
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors inline-block"
                >
                  Xem tất cả sản phẩm
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <div className="flex gap-2 bg-white p-4 rounded-lg shadow-sm">
                  {currentPage > 1 && (
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                    >
                      ← Trước
                    </button>
                  )}
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                    if (page > totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 border rounded transition-colors ${
                          currentPage === page
                            ? 'bg-green-500 text-white border-green-500'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  {currentPage < totalPages && (
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                    >
                      Sau →
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        

      </main>
      
      <Footer />
    </div>
  );
};

export default ProductList;