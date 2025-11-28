import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api/reviews";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [activeReview, setActiveReview] = useState(null);
    const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      let allReviews = [];

      for (const p of res.data.products || []) {
        const rv = await axios.get(`${API_BASE}/${p._id}`);
        if (rv.data.data.length > 0) {
          allReviews.push(
            ...rv.data.data.map((r) => ({ ...r, productName: p.name }))
          );
        }
      }
      setReviews(allReviews);
    } catch (err) {
      console.error("❌ Lỗi lấy đánh giá:", err);
    }
    setLoading(false);
  };

 const submitReply = async () => {
  if (!activeReview) return;

  try {
    // Lấy token đúng format (tự động detect)
    const userData =
      JSON.parse(localStorage.getItem("userInfo")) ||
      JSON.parse(localStorage.getItem("user")) ||
      {};

    const token = userData?.token || localStorage.getItem("token");

    if (!token) {
      alert("Bạn chưa đăng nhập Admin! Không thể phản hồi.");
      return;
    }

    await axios.put(
      `${API_BASE}/${activeReview._id}/reply`,
      { reply: replyText },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Phản hồi thành công!");
    setReplyText("");
    setActiveReview(null);
    fetchReviews();
  } catch (err) {
    console.error("❌ Lỗi reply:", err);
    alert("Không thể phản hồi.");
  }
};

  return (
    <div className="p-2">

      {/* Tiêu đề */}
      <h2 className="text-2xl font-bold text-[#4b2c35] mb-6 flex items-center gap-2">
        🌸 Quản lý đánh giá sản phẩm
      </h2>

      {reviews.length === 0 && (
        <p className="text-gray-500">Chưa có đánh giá nào.</p>
      )}

      <div className="space-y-5">
        {reviews.map((rv) => (
          <div
            key={rv._id}
            className="border border-[#f1d7d7] rounded-xl p-5 bg-white shadow-md hover:shadow-lg transition"
          >
            <div className="flex justify-between">
              <p className="font-medium text-[#4b2c35]">
                {rv.user?.name} •{" "}
                <span className="text-yellow-500 font-bold">{rv.rating}★</span>
              </p>
              <p className="text-sm text-gray-500 italic">{rv.productName}</p>
            </div>

            <p className="mt-2 text-gray-700 leading-relaxed">{rv.comment}</p>

            {rv.adminReply && (
              <div className="mt-3 p-4 bg-[#fff5f7] border border-[#f7cddd] rounded-lg">
                <p className="font-semibold text-[#d05975] mb-1">Phản hồi của Admin:</p>
                <p className="text-gray-700">{rv.adminReply}</p>
              </div>
            )}

            <button
              className="mt-4 px-4 py-1.5 bg-[#e06c7f] text-white text-sm rounded-full shadow hover:bg-[#cc5f72] transition"
              onClick={() => {
                setActiveReview(rv);
                setReplyText(rv.adminReply || "");
              }}
            >
              💬 Trả lời
            </button>
            <button
            className="mt-4 ml-3 px-4 py-1.5 bg-white text-[#e06c7f] border border-[#e06c7f] text-sm rounded-full shadow hover:bg-[#ffe6eb] transition"
            onClick={() => navigate(`/product/${rv.product}`)}
            >
            🔍 Xem sản phẩm
            </button>


          </div>
        ))}
      </div>

      {/* POPUP */}
      {activeReview && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl w-[400px] shadow-2xl border border-pink-200">

            <h3 className="text-lg font-semibold mb-3 text-[#4b2c35]">
              🌸 Trả lời đánh giá
            </h3>

            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              className="w-full border border-pink-300 rounded-lg p-3 focus:ring-1 focus:ring-pink-400 focus:outline-none"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                onClick={() => setActiveReview(null)}
              >
                Hủy
              </button>

              <button
                className="px-4 py-1 bg-[#e06c7f] text-white rounded-lg shadow hover:bg-[#cc5f72] transition"
                onClick={submitReply}
              >
                Gửi phản hồi
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
