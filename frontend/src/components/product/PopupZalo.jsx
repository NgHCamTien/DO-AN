import React from "react";

export default function PopupZalo({ open, onClose, maxQty }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[90%] max-w-md text-center shadow-lg">
        <h2 className="text-xl font-bold text-pink-600 mb-3">
          Liên hệ tư vấn đặt hàng
        </h2>

        <p className="mb-4 text-gray-700">
          Số lượng tối đa cho sản phẩm này là <b>{maxQty}</b>.  
          Đơn hàng lớn yêu cầu liên hệ Zalo để xác nhận và đặt cọc 20–50%.
        </p>

        <a
          href="https://zalo.me/your_phone_here"
          target="_blank"
          rel="noreferrer"
          className="block bg-pink-500 text-white py-2 rounded-lg mb-3"
        >
          💬 Liên hệ qua Zalo
        </a>

        <button
          className="text-gray-600 hover:text-gray-900"
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
