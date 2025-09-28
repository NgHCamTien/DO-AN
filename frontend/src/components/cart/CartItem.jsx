import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useContext(CartContext);
  const [warning, setWarning] = useState('');

  // ============ THÊM VALIDATION ============
  if (!item) {
    console.error('CartItem: item is undefined');
    return null;
  }

  if (!item._id) {
    console.error('CartItem: item._id is undefined', item);
    return null;
  }

  // ============ VALIDATION SỐ LƯỢNG VỚI GIỚI HẠN 200 ============
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    
    if (newQuantity > 200) {
      setWarning('Tối đa 200 sản phẩm cho mỗi loại');
      return;
    }
    
    if (newQuantity < 1) {
      setWarning('Số lượng phải lớn hơn 0');
      return;
    }
    
    setWarning('');
    if (newQuantity && newQuantity > 0) {
      updateQuantity(item._id, newQuantity);
    }
  };

  // ============ VALIDATION CHO NÚT TĂNG/GIẢM ============
  const handleIncrease = () => {
    const currentQuantity = item.quantity || 1;
    if (currentQuantity >= 200) {
      setWarning('Đã đạt giới hạn tối đa 200 sản phẩm');
      return;
    }
    setWarning('');
    updateQuantity(item._id, currentQuantity + 1);
  };

  const handleDecrease = () => {
    const currentQuantity = item.quantity || 1;
    if (currentQuantity <= 1) {
      setWarning('Số lượng phải lớn hơn 0');
      return;
    }
    setWarning('');
    updateQuantity(item._id, currentQuantity - 1);
  };

  // ============ SỬA LỖI HÌNH ẢNH ============
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    
    if (imagePath.startsWith('http')) return imagePath;
    
    if (imagePath.startsWith('/uploads')) {
      return `http://localhost:5000${imagePath}`;
    }
    
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  const currentQuantity = item.quantity || 1;

  return (
    <div className="cart-item flex flex-col md:flex-row items-center p-4 border-b border-gray-200">
      <div className="cart-item-image w-24 h-24 overflow-hidden rounded">
        <Link to={`/product/${item._id}`}>
          <img 
            src={getImageUrl(item.image || item.images?.[0])} 
            alt={item.name || 'Sản phẩm'} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder.jpg';
            }}
          />
        </Link>
      </div>
      
      <div className="cart-item-details flex-1 mx-4">
        <Link to={`/product/${item._id}`} className="no-underline">
          <h3 className="font-medium text-lg text-gray-800">{item.name || 'Sản phẩm'}</h3>
        </Link>
        <div className="price mt-2">
          {item.discountPrice ? (
            <>
              <del className="text-gray-500 mr-2">{(item.price || 0).toLocaleString('vi-VN')}₫</del>
              <span className="text-red-600 font-bold">{item.discountPrice.toLocaleString('vi-VN')}₫</span>
            </>
          ) : (
            <span className="text-red-600 font-bold">{(item.price || 0).toLocaleString('vi-VN')}₫</span>
          )}
        </div>
        
        {/* ============ HIỂN THỊ THÔNG BÁO LỖI ============ */}
        {warning && (
          <div className="text-red-500 text-sm mt-1">
            ⚠️ {warning}
          </div>
        )}
        
        {/* ============ CẢNH BÁO KHI SỐ LƯỢNG LỚN ============ */}
        {currentQuantity > 100 && (
          <div className="text-orange-500 text-sm mt-1">
            ⚠️ Số lượng lớn (tối đa 200)
          </div>
        )}
      </div>
      
      <div className="cart-item-quantity mx-4">
        <div className="flex items-center">
          <button 
            onClick={handleDecrease}
            className="bg-gray-200 px-3 py-1 rounded-l hover:bg-gray-300 disabled:opacity-50"
            disabled={currentQuantity <= 1}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max="200"
            value={currentQuantity}
            onChange={handleQuantityChange}
            className="w-16 text-center border-t border-b border-gray-200 py-1"
            title="Tối đa 200 sản phẩm"
          />
          <button 
            onClick={handleIncrease}
            className="bg-gray-200 px-3 py-1 rounded-r hover:bg-gray-300 disabled:opacity-50"
            disabled={currentQuantity >= 200}
          >
            +
          </button>
        </div>
        
        {/* ============ HIỂN THỊ GIỚI HẠN ============ */}
        <div className="text-xs text-gray-500 text-center mt-1">
          Tối đa: 200
        </div>
      </div>
      
      <div className="cart-item-total mx-4 font-bold">
        {(((item.discountPrice || item.price) || 0) * currentQuantity).toLocaleString('vi-VN')}₫
      </div>
      
      <button 
        onClick={() => removeFromCart(item._id)}
        className="text-red-500 hover:text-red-700 ml-4 text-xl"
        title="Xóa sản phẩm"
      >
        ×
      </button>
    </div>
  );
};

export default CartItem;