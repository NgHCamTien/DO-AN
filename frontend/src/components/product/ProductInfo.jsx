import React, { useState } from "react";
import PopupZalo from "./PopupZalo";

const ProductInfo = ({ product, qty, setQty, addToCart, buyNow }) => {
  const [openPopup, setOpenPopup] = useState(false);

  if (!product) return null;

  // ================== GIÁ GỐC + GIÁ GIẢM ==================
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;

  const displayPrice = hasDiscount ? product.discountPrice : product.price;

  // ================== RÀNG BUỘC SỐ LƯỢNG ==================
  const getMaxQty = (p) => {
    if (p.price > 1000000) return 1;

    if (
      p.category?.name?.toLowerCase().includes("khai trương") ||
      p.name?.toLowerCase().includes("khai trương")
    ) {
      return 2;
    }

    return 3;
  };

  const maxQty = getMaxQty(product);

  const decreaseQty = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const increaseQty = () => {
    if (qty < maxQty) setQty(qty + 1);
    else setOpenPopup(true);
  };

  const handleAddToCart = () => {
    if (qty > maxQty) {
      setOpenPopup(true);
      return;
    }
    addToCart();
  };

  const handleBuyNow = () => {
    if (qty > maxQty) {
      setOpenPopup(true);
      return;
    }
    buyNow();
  };

  return (
    <div className="flex flex-col h-full justify-between">
      {/* Tên sản phẩm */}
      <h1 className="text-[22px] md:text-[24px] font-bold text-[#4b2c35] leading-snug">
        {product.name}
      </h1>

      {/* Rating + Số review */}
      <div className="mt-2 flex items-center gap-3 text-[13px] text-gray-600">
        <span className="flex items-center gap-1">
          <i className="fas fa-star text-yellow-400" />
          <span className="font-semibold">
            {product.rating?.toFixed ? product.rating.toFixed(1) : product.rating || 5}
          </span>
        </span>
        <span>|</span>
        <span>{product.numReviews || 0} đánh giá</span>
      </div>

      {/* Giá */}
      <div className="mt-3">
        {hasDiscount && (
          <p className="text-gray-400 line-through text-[14px]">
            {product.price.toLocaleString()}₫
          </p>
        )}
        <p className="text-pink-600 font-bold text-[24px] md:text-[26px]">
          {displayPrice.toLocaleString()}₫
        </p>
      </div>

      {/* Thông tin nhanh để đỡ trống */}
      <div className="mt-4 text-[14px] text-gray-700 space-y-1">
        <p>
          <strong>Loại hoa:</strong>{" "}
          {product.flowerTypes?.join(", ") || "Đang cập nhật"}
        </p>
        <p>
          <strong>Mùa:</strong> {product.season || "Quanh năm"}
        </p>
        <p>
          <strong>Danh mục:</strong> {product.category?.name || "Đang cập nhật"}
        </p>
        <p>
          <strong>Tags:</strong>{" "}
          {product.tags?.length ? product.tags.join(", ") : "Chưa có"}
        </p>
      </div>

      {/* Đã bán - tồn kho */}
        <p className="text-[13px] text-gray-500 mt-2">
        Đã bán: <span className="font-medium">{product.sold ?? 0}</span>
        {" — "}
        Còn: <span className="font-medium">{product.stock ?? 0}</span>
      </p>

      {/* SỐ LƯỢNG */}
      <div className="mt-6">
        <p className="text-[15px] font-semibold text-[#4b2c35] mb-2">
          Số lượng (Tối đa: {maxQty})
        </p>

        <div className="flex items-center gap-4">
          <button
            onClick={decreaseQty}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition"
          >
            -
          </button>

          <span className="text-[15px] font-medium">{qty}</span>

          <button
            onClick={increaseQty}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100 transition"
          >
            +
          </button>
        </div>
      </div>

      {/* NÚT */}
      <div className="flex gap-4 mt-8">
        <button
          className="px-6 py-3 rounded-full text-[15px] font-semibold bg-pink-200 text-pink-700 hover:bg-pink-300 transition shadow"
          onClick={handleAddToCart}
        >
          Thêm vào giỏ
        </button>

        <button
          className="px-6 py-3 rounded-full text-[15px] font-semibold bg-pink-600 text-white hover:bg-pink-700 transition shadow"
          onClick={handleBuyNow}
        >
          Mua ngay
        </button>
      </div>

      {/* POPUP ZALO */}
      <PopupZalo
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        maxQty={maxQty}
      />
    </div>
  );
};

export default ProductInfo;
