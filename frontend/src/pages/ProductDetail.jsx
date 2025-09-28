import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchProduct();
    fetchRelatedProducts();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
        console.log('Product data:', data); // Debug log
      } else {
        setError('Không tìm thấy sản phẩm');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}/related`);
      if (response.ok) {
        const data = await response.json();
        setRelatedProducts(data);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 200) {
      alert('Số lượng tối đa là 200 sản phẩm');
      return;
    }
    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // LOẠI BỎ KIỂM TRA QUANTITY VÌ ĐÃ BỎ TRƯỜNG NÀY
    // if (product.quantity <= 0) {
    //   alert('Sản phẩm đã hết hàng');
    //   return;
    // }

    // KIỂM TRA SỐ LƯỢNG MUA KHÔNG VƯỢT QUÁ 200
    if (quantity > 200) {
      alert('Số lượng tối đa là 200 sản phẩm');
      return;
    }

    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      images: product.images,
      image: product.images?.[0],
      quantity: quantity
    };

    addToCart(cartItem);
    alert(`Đã thêm ${quantity} ${product.name} vào giỏ hàng!`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {error || 'Không tìm thấy sản phẩm'}
            </h2>
            <Link to="/product" className="text-green-700 hover:underline">
              ← Quay về danh sách sản phẩm
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  // LOẠI BỎ LOGIC KIỂM TRA HẾT HÀNG VÌ ĐÃ BỎ QUANTITY
  // const isOutOfStock = product.quantity <= 0;
  const isOutOfStock = false; // Luôn có hàng vì đã bỏ quantity

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      
      <main className="flex-1 p-4 max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6">
          <Link to="/" className="text-gray-500 hover:text-green-700">Trang chủ</Link>
          <span className="mx-2"></span>
          <Link to="/product" className="text-gray-500 hover:text-green-700">Sản phẩm</Link>
          <span className="mx-2"></span>
          <Link to={`/category/${product.category?.slug}`} className="text-gray-500 hover:text-green-700">
            {product.category?.name}
          </Link>
          <span className="mx-2"></span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        {/* Product Detail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={product.images?.[selectedImage] ? `http://localhost:5000${product.images[selectedImage]}` : '/api/placeholder/400/400'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/api/placeholder/400/400';
                }}
              />
              
              {/* LOẠI BỎ OVERLAY HẾT HÀNG */}
              {/* {isOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-4xl mb-2">🚫</div>
                    <div className="text-xl font-bold">HẾT HÀNG</div>
                    <div className="text-sm">Đang nhập thêm</div>
                  </div>
                </div>
              )} */}
            </div>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                      selectedImage === index ? 'border-green-700' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={`http://localhost:5000${image}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/64/64';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                <span className="text-gray-600">(5 sao - 15 đánh giá)</span>
              </div>
              
              {/* Price */}
              <div className="mb-6">
                {hasDiscount ? (
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-red-600">
                      {displayPrice.toLocaleString('vi-VN')}₫
                    </div>
                    <div className="text-lg text-gray-500 line-through">
                      {product.price.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-red-600">
                    {displayPrice.toLocaleString('vi-VN')}₫
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div>
                <span className="font-medium">Mô tả:</span>
                <p className="text-gray-600 mt-1">{product.description || 'Hoa tặng sinh nhật'}</p>
              </div>
              
              {/* LOẠI BỎ HIỂN THỊ TÌNH TRẠNG KHO */}
              {/* <div>
                <span className="font-medium">Tình trạng kho:</span>
                <span className={`ml-2 ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                  {isOutOfStock ? '🚫 Hết hàng' : '✅ Còn hàng'}
                </span>
              </div> */}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <span className="font-medium mb-2 block">Số lượng:</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button 
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min="1"
                      max="200"
                      className="w-16 px-3 py-2 text-center border-l border-r border-gray-300 focus:outline-none"
                    />
                    <button 
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 200}
                      className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">Tối đa: 200</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={handleAddToCart}
                  // disabled={isOutOfStock} // LOẠI BỎ DISABLE
                  className="flex-1 bg-green-700 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium"
                  // className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                  //   isOutOfStock 
                  //     ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  //     : 'bg-green-700 text-white hover:bg-green-600'
                  // }`}
                >
                  {/* {isOutOfStock ? '🚫 Hết hàng' : '🛒 Thêm vào giỏ'} */}
                  🛒 Thêm vào giỏ
                </button>
                
                <button 
                  // disabled={isOutOfStock} // LOẠI BỎ DISABLE
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  // className={`px-6 py-3 border rounded-lg transition-colors ${
                  //   isOutOfStock 
                  //     ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                  //     : 'border-gray-300 hover:bg-gray-50'
                  // }`}
                >
                  {/* {isOutOfStock ? '🚫 Không khả dụng' : '❤️ Yêu thích'} */}
                  ❤️ Yêu thích
                </button>
              </div>

              {/* LOẠI BỎ THÔNG BÁO HẾT HÀNG */}
              {/* {isOutOfStock && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <span>🚫</span>
                    <span className="font-medium">Sản phẩm tạm hết hàng</span>
                  </div>
                  <p className="text-red-600 text-sm mt-1">
                    Chúng tôi đang nhanh chóng nhập thêm hàng. Vui lòng quay lại sau!
                  </p>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => (
                <Link 
                  key={relatedProduct._id} 
                  to={`/product/${relatedProduct._id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100">
                    <img 
                      src={relatedProduct.images?.[0] ? `http://localhost:5000${relatedProduct.images[0]}` : '/api/placeholder/200/200'}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/200/200';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="text-red-600 font-bold">
                      {(relatedProduct.discountPrice || relatedProduct.price).toLocaleString('vi-VN')}₫
                    </div>
                    {relatedProduct.discountPrice && (
                      <div className="text-gray-500 text-sm line-through">
                        {relatedProduct.price.toLocaleString('vi-VN')}₫
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;