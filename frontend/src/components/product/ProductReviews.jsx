import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const API_REVIEW = "http://localhost:5000/api/reviews";

const ProductReviews = ({ reviews, onSubmitReview }) => {
  const { user } = useContext(AuthContext);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // ⭐ State lưu nội dung phản hồi admin cho từng review
  const [adminReplyText, setAdminReplyText] = useState({});

  const handleSubmit = () => {
    if (!comment.trim()) {
      alert("Vui lòng nhập nội dung đánh giá");
      return;
    }
    onSubmitReview({ rating: Number(rating), comment });
    setComment("");
  };

  // ⭐ Admin gửi phản hồi
  const handleReply = async (reviewId) => {
    if (!adminReplyText[reviewId] || !adminReplyText[reviewId].trim()) {
      alert("Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      await axios.put(
        `${API_REVIEW}/${reviewId}/reply`,
        { reply: adminReplyText[reviewId] },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );

      alert("Đã gửi phản hồi!");
      window.location.reload();
    } catch (err) {
      console.error("❌ Reply error:", err);
      alert("Không thể gửi phản hồi!");
    }
  };

  return (
    <div className="mt-4">
      {/* FORM ĐÁNH GIÁ */}
      <div className="p-4 bg-pink-50 rounded-2xl mb-6">
        <p className="font-semibold mb-2 text-[#4b2c35]">Viết đánh giá của bạn</p>

        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm text-gray-600">Chọn số sao:</span>
          <select
            className="border border-pink-200 rounded px-2 py-1 text-sm"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} sao</option>
            ))}
          </select>
        </div>

        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
          className="w-full border border-pink-200 rounded-lg px-3 py-2 text-sm"
        />

        <button
          onClick={handleSubmit}
          className="mt-3 bg-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-pink-700 transition"
        >
          Gửi đánh giá
        </button>
      </div>

      {/* DANH SÁCH ĐÁNH GIÁ */}
      {(!reviews || reviews.length === 0) && (
        <p className="text-sm text-gray-500">Chưa có đánh giá nào.</p>
      )}

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r._id} className="p-4 bg-white border rounded-2xl shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#4b2c35]">
                {r.user?.name || "Khách hàng"}
              </p>
              <p className="text-sm text-yellow-500">
                {"★".repeat(r.rating)} <span className="text-gray-500">
                  ({r.rating} / 5)
                </span>
              </p>
            </div>

            <p className="mt-2 text-sm text-gray-700">{r.comment}</p>

            {/* ADMIN REPLY (đã có) */}
            {r.adminReply && (
              <div className="mt-3 ml-3 border-l-4 border-pink-200 pl-3 text-sm bg-pink-50 rounded-md py-2">
                <p className="font-semibold text-pink-700 mb-1">Phản hồi từ shop:</p>
                <p>{r.adminReply}</p>
              </div>
            )}

            {/* FORM ADMIN TRẢ LỜI */}
            {user?.role === "admin" && (
              <div className="mt-3">
                <textarea
                  rows={2}
                  placeholder="Nhập phản hồi shop..."
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={adminReplyText[r._id] || ""}
                  onChange={(e) =>
                    setAdminReplyText({
                      ...adminReplyText,
                      [r._id]: e.target.value,
                    })
                  }
                />

                <button
                  onClick={() => handleReply(r._id)}
                  className="mt-2 bg-pink-600 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-700 transition"
                >
                  Gửi phản hồi
                </button>
              </div>
            )}

            <p className="mt-2 text-[11px] text-gray-400">
              {r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN") : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
