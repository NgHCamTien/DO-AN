import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext"; 

const API_BASE = "http://localhost:5000/api/reviews";

const AdminReply = ({ review, refresh }) => {
  const [text, setText] = useState(review.adminReply || "");
  const { user } = useContext(AuthContext); // Lấy token đúng chuẩn

  const handleReply = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập lại!");
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/${review._id}/reply`,
        { reply: text },
        {
          headers: {
            Authorization: `Bearer ${user.token}`, // ✔ Token chính xác
          },
        }
      );

      alert("Đã gửi phản hồi thành công!");
      refresh(); // Tải lại danh sách
    } catch (err) {
      console.error("❌ Reply error:", err);
      alert(err.response?.data?.message || "Không thể gửi phản hồi.");
    }
  };

  return (
    <div className="mt-3 border-t pt-3 bg-gray-50 p-3 rounded-lg">
      <p className="font-semibold mb-1 text-pink-600">Phản hồi của Admin:</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-400"
        placeholder="Nhập phản hồi..."
        rows={3}
      />

      <button
        onClick={handleReply}
        className="mt-3 px-5 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all"
      >
        Gửi phản hồi
      </button>
    </div>
  );
};

export default AdminReply;
