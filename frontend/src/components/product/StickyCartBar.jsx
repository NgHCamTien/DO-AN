import React from "react";

const StickyCartBar = ({ product, qty, addToCart, buyNow }) => {
  if (!product) return null;

  return (
    <div
      className="
        fixed bottom-0 left-0 right-0 
        bg-white/90 backdrop-blur-md shadow-[0_-3px_10px_rgba(0,0,0,0.1)]
        px-4 py-3 z-50 
        flex items-center justify-between
        border-t border-pink-200
      "
    >
      <div>
        <p className="text-xs text-gray-500">Giá</p>
        <p className="text-pink-600 font-bold text-lg">
          {(product.discountPrice || product.price).toLocaleString()}₫
        </p>
      </div>

      <div className="flex gap-3">
        <button
          className="px-5 py-2 rounded-full bg-pink-200 text-pink-700 font-semibold hover:bg-pink-300 transition"
          onClick={addToCart}
        >
          Thêm vào giỏ
        </button>

        <button
          className="px-5 py-2 rounded-full bg-pink-600 text-white font-semibold hover:bg-pink-700 transition"
          onClick={buyNow}
        >
          Mua ngay
        </button>
      </div>
    </div>
  );
};

export default StickyCartBar;
