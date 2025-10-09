import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useContext(CartContext);
  const [warning, setWarning] = useState('');

  if (!item || !item._id) return null;

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity > 200) { setWarning('Tối đa 200 sản phẩm cho mỗi loại'); return; }
    if (newQuantity < 1) { setWarning('Số lượng phải lớn hơn 0'); return; }
    setWarning('');
    updateQuantity(item._id, newQuantity);
  };

  const handleIncrease = () => {
    const currentQuantity = item.quantity || 1;
    if (currentQuantity >= 200) { setWarning('Đã đạt giới hạn tối đa 200 sản phẩm'); return; }
    setWarning('');
    updateQuantity(item._id, currentQuantity + 1);
  };

  const handleDecrease = () => {
    const currentQuantity = item.quantity || 1;
    if (currentQuantity <= 1) { setWarning('Số lượng phải lớn hơn 0'); return; }
    setWarning('');
    updateQuantity(item._id, currentQuantity - 1);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return `http://localhost:5000${imagePath}`;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  const currentQuantity = item.quantity || 1;

  return (
    <div className="cart-item flex flex-col md:flex-row items-center p-4 mb-4 border-b border-neutral rounded-lg bg-accent shadow-sm">
      
      {/* Hình ảnh */}
      <div className="cart-item-image w-24 h-24 overflow-hidden rounded">
        <Link to={`/product/${item._id}`}>
          <img 
            src={getImageUrl(item.image || item.images?.[0])} 
            alt={item.name || 'Sản phẩm'} 
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = '/placeholder.jpg'; }}
          />
        </Link>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="cart-item-details flex-1 mx-4">
        <Link to={`/product/${item._id}`} className="no-underline">
          <h3 className="font-serif text-primary text-lg">{item.name || 'Sản phẩm'}</h3>
        </Link>

        <div className="price mt-1">
          {item.discountPrice ? (
            <>
              <del className="text-neutral mr-2">{(item.price || 0).toLocaleString('vi-VN')}₫</del>
              <span className="text-secondary font-bold">{item.discountPrice.toLocaleString('vi-VN')}₫</span>
            </>
          ) : (
            <span className="text-secondary font-bold">{(item.price || 0).toLocaleString('vi-VN')}₫</span>
          )}
        </div>

        {warning && (
          <div className="text-highlight text-sm mt-1">⚠️ {warning}</div>
        )}

        {currentQuantity > 100 && (
          <div className="text-highlight text-sm mt-1">⚠️ Số lượng lớn (tối đa 200)</div>
        )}
      </div>

      {/* Số lượng */}
      <div className="cart-item-quantity mx-4">
        <div className="flex items-center">
          <button 
            onClick={handleDecrease}
            className="bg-secondary px-3 py-1 rounded-l hover:bg-highlight disabled:opacity-50"
            disabled={currentQuantity <= 1}
          >-</button>
          <input
            type="number"
            min="1"
            max="200"
            value={currentQuantity}
            onChange={handleQuantityChange}
            className="w-16 text-center border-t border-b border-neutral py-1"
          />
          <button 
            onClick={handleIncrease}
            className="bg-secondary px-3 py-1 rounded-r hover:bg-highlight disabled:opacity-50"
            disabled={currentQuantity >= 200}
          >+</button>
        </div>
        <div className="text-xs text-neutral text-center mt-1">Tối đa: 200</div>
      </div>

      {/* Tổng tiền */}
      <div className="cart-item-total mx-4 font-bold text-primary">
        {((item.discountPrice || item.price || 0) * currentQuantity).toLocaleString('vi-VN')}₫
      </div>

      {/* Xóa sản phẩm */}
      <button 
        onClick={() => removeFromCart(item._id)}
        className="text-secondary hover:text-highlight ml-4 text-xl"
        title="Xóa sản phẩm"
      >
        ×
      </button>
    </div>
  );
};

export default CartItem;
