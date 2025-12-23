import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../../context/CartContext";

const MAX_PER_PRODUCT = 3;

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useContext(CartContext);
  const [warning, setWarning] = useState("");

  if (!item || !item._id) return null;

  // ========================
  // HANDLE QUANTITY
  // ========================
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);

    if (isNaN(newQuantity) || newQuantity < 1) {
      setWarning("Vui lòng chọn ít nhất 1 bó hoa.");
      return;
    }

    if (newQuantity > MAX_PER_PRODUCT) {
      setWarning(
        "Mỗi mẫu hoa chỉ cho đặt tối đa 3 bó. Vui lòng liên hệ shop để đặt số lượng lớn."
      );
      return;
    }

    setWarning("");
    updateQuantity(item._id, newQuantity);
  };

  const handleIncrease = () => {
    const currentQuantity = item.quantity || 1;

    if (currentQuantity >= MAX_PER_PRODUCT) {
      setWarning(
        "Đơn hàng từ 4 bó trở lên vui lòng liên hệ shop để được tư vấn."
      );
      return;
    }

    setWarning("");
    updateQuantity(item._id, currentQuantity + 1);
  };

  const handleDecrease = () => {
    const currentQuantity = item.quantity || 1;

    if (currentQuantity <= 1) {
      setWarning("Số lượng tối thiểu là 1 bó hoa.");
      return;
    }

    setWarning("");
    updateQuantity(item._id, currentQuantity - 1);
  };

  // ========================
  // IMAGE URL
  // ========================
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "/placeholder.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/uploads"))
      return `http://localhost:5000${imagePath}`;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  const currentQuantity = item.quantity || 1;

  return (
    <div className="cart-item flex flex-col md:flex-row items-center p-4 mb-4 border-b border-neutral rounded-lg bg-accent shadow-sm">
      {/* IMAGE */}
      <div className="w-24 h-24 overflow-hidden rounded">
        <Link to={`/product/${item._id}`}>
          <img
            src={getImageUrl(item.image || item.images?.[0])}
            alt={item.name || "Sản phẩm"}
            className="w-full h-full object-cover"
            onError={(e) => (e.currentTarget.src = "/placeholder.jpg")}
          />
        </Link>
      </div>

      {/* INFO */}
      <div className="flex-1 mx-4">
        <Link to={`/product/${item._id}`}>
          <h3 className="font-serif text-primary text-lg">
            {item.name || "Sản phẩm"}
          </h3>
        </Link>

        <div className="mt-1">
          {item.discountPrice ? (
            <>
              <del className="text-neutral mr-2">
                {(item.price || 0).toLocaleString("vi-VN")}₫
              </del>
              <span className="text-secondary font-bold">
                {item.discountPrice.toLocaleString("vi-VN")}₫
              </span>
            </>
          ) : (
            <span className="text-secondary font-bold">
              {(item.price || 0).toLocaleString("vi-VN")}₫
            </span>
          )}
        </div>

        {warning && (
          <div className="text-highlight text-sm mt-1">⚠️ {warning}</div>
        )}
      </div>

      {/* QUANTITY */}
      <div className="mx-4 text-center">
        <div className="flex items-center">
          <button
            onClick={handleDecrease}
            disabled={currentQuantity <= 1}
            className="bg-secondary px-3 py-1 rounded-l hover:bg-highlight disabled:opacity-50"
          >
            -
          </button>

          <input
            type="number"
            min="1"
            max={MAX_PER_PRODUCT}
            value={currentQuantity}
            onChange={handleQuantityChange}
            className="w-14 text-center border-t border-b border-neutral py-1"
          />

          <button
            onClick={handleIncrease}
            disabled={currentQuantity >= MAX_PER_PRODUCT}
            className="bg-secondary px-3 py-1 rounded-r hover:bg-highlight disabled:opacity-50"
          >
            +
          </button>
        </div>

        <div className="text-xs text-neutral mt-1">
          Đặt tối đa 3 bó cho mỗi mẫu hoa
        </div>

        {/* CALL OUT – LIÊN HỆ SHOP */}
        {currentQuantity >= MAX_PER_PRODUCT && (
          <div className="mt-2 bg-[#fff0f6] border border-[#f5c2d1] text-[#c24d73]
                          text-sm px-3 py-2 rounded-lg">
            🌸 Đơn hàng số lượng lớn vui lòng{" "}
            <span
              className="underline cursor-pointer font-medium hover:text-[#a83f60]"
              onClick={() =>
                alert("Vui lòng liên hệ shop qua chat để được tư vấn chi tiết 🌸")
              }
            >
              liên hệ shop
            </span>
          </div>
        )}
      </div>

      {/* TOTAL */}
      <div className="mx-4 font-bold text-primary">
        {(
          (item.discountPrice || item.price || 0) * currentQuantity
        ).toLocaleString("vi-VN")}
        ₫
      </div>

      {/* REMOVE */}
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
