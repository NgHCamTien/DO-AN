import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  if (!product) return null;

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  
  // LOẠI BỎ LOGIC KIỂM TRA HẾT HÀNG VÌ ĐÃ BỎ QUANTITY
  // const isOutOfStock = product.quantity <= 0;
  const isOutOfStock = false; // Luôn có hàng vì đã bỏ quantity

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // LOẠI BỎ KIỂM TRA HẾT HÀNG
    // if (isOutOfStock) {
    //   alert('Sản phẩm đã hết hàng');
    //   return;
    // }

    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      images: product.images,
      image: product.images?.[0],
      quantity: 1
    };

    addToCart(cartItem);
    alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          <img 
            src={product.images?.[0] ? `http://localhost:5000${product.images[0]}` : '/api/placeholder/300/300'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = '/api/placeholder/300/300';
            }}
          />
          
          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
              -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
            </div>
          )}
          
          {/* LOẠI BỎ OVERLAY HẾT HÀNG */}
          {/* {isOutOfStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl mb-1">🚫</div>
                <div className="text-sm font-bold">HẾT HÀNG</div>
                <div className="text-xs">Đang nhập thêm</div>
              </div>
            </div>
          )} */}
          
          {/* Featured Badge */}
          {product.isFeatured && !isOutOfStock && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-medium">
              ⭐ Nổi bật
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 hover:text-green-700 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="mb-3">
          {hasDiscount ? (
            <div className="space-y-1">
              <div className="text-lg font-bold text-red-600">
                {displayPrice.toLocaleString('vi-VN')}₫
              </div>
              <div className="text-sm text-gray-500 line-through">
                {product.price.toLocaleString('vi-VN')}₫
              </div>
            </div>
          ) : (
            <div className="text-lg font-bold text-red-600">
              {displayPrice.toLocaleString('vi-VN')}₫
            </div>
          )}
        </div>

        {/* LOẠI BỎ HIỂN THỊ TRẠNG THÁI KHO */}
        {/* <div className="mb-3">
          <span className={`text-xs px-2 py-1 rounded ${
            isOutOfStock 
              ? 'bg-red-100 text-red-600' 
              : 'bg-green-100 text-green-600'
          }`}>
            {isOutOfStock ? '🚫 Hết hàng' : '✅ Còn hàng'}
          </span>
        </div> */}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3 text-sm">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-xs">⭐</span>
            ))}
          </div>
          <span className="text-gray-500">(5.0)</span>
        </div>
        
        <button 
          onClick={handleAddToCart}
          // disabled={isOutOfStock} // LOẠI BỎ DISABLE
          className="w-full bg-green-700 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors font-medium"
          // className={`w-full py-2 px-4 rounded font-medium transition-colors ${
          //   isOutOfStock 
          //     ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
          //     : 'bg-green-700 text-white hover:bg-green-600'
          // }`}
        >
          {/* {isOutOfStock ? '🚫 Hết hàng' : '🛒 Thêm vào giỏ'} */}
          🛒 Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

export default ProductCard;