import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  if (!product) return null;

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  // ✅ Chuẩn hóa đường dẫn ảnh
  const imagePath = product?.images?.[0] || '';
  const imageSrc = imagePath.startsWith('http')
    ? imagePath
    : `${API_URL}${imagePath.replace(/\\/g, '/')}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      images: product.images,
      image: product.images?.[0],
      quantity: 1,
    };
    addToCart(cartItem);
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-md overflow-hidden group transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
      <Link to={`/product/${product._id}`} className="block relative overflow-hidden">
        {/* ✅ Ảnh sản phẩm */}
        <img
          src={imageSrc || '/placeholder.png'}
          alt={product.name}
          className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => (e.currentTarget.src = '/placeholder.png')}
        />

        {/* Hiệu ứng hover */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-500">
          <Link
            to={`/product/${product._id}`}
            className="bg-white text-green-700 font-semibold px-4 py-2 rounded-full shadow hover:bg-green-50 transition-all duration-300"
          >
            Xem chi tiết
          </Link>
          <button
            onClick={handleAddToCart}
            className="bg-green-700 text-white font-semibold px-4 py-2 rounded-full shadow hover:bg-green-600 transition-all duration-300"
          >
            🛒 Thêm giỏ
          </button>
        </div>

        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-[#f28ca0] text-white px-2 py-1 rounded text-sm font-medium shadow-sm">
            -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
          </div>
        )}

        {product.isFeatured && (
          <span className="absolute top-3 right-3 bg-yellow-400 text-white text-sm font-semibold px-3 py-1 rounded-full shadow">
            🌟 Nổi bật
          </span>
        )}
      </Link>

      {/* Thông tin sản phẩm */}
      <div className="p-4 text-center">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 hover:text-green-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="min-h-[56px] flex flex-col justify-center">
          {hasDiscount ? (
            <>
              <p className="text-lg font-bold text-red-600">
                {displayPrice.toLocaleString('vi-VN')}₫
              </p>
              <p className="text-sm text-gray-400 line-through">
                {product.price.toLocaleString('vi-VN')}₫
              </p>
            </>
          ) : (
            <p className="text-lg font-bold text-red-600">
              {displayPrice.toLocaleString('vi-VN')}₫
            </p>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className="w-full bg-[#e86b84] text-white py-2 px-4 rounded-lg hover:bg-[#d85a75] transition-colors duration-300 shadow-sm hover:shadow-md font-medium"
        >
          🛒 Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
