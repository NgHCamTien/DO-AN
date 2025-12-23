import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const UploadPaymentProof = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Redirect đúng chuẩn React
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const uploadPaymentProof = async () => {
    if (!file) {
      alert("Vui lòng chọn ảnh chuyển khoản");
      return;
    }

    const formData = new FormData();
    formData.append("image", file); // ✅ CÁCH 1 – KHÔNG cần orderId

    try {
      setLoading(true);

      await axios.post(`${API_URL}/payment-proof`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // ✅ Upload xong → sang chờ duyệt
      navigate("/waiting-verify");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload thất bại, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fff7f9] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-md">
        <h1 className="text-xl font-bold text-[#4b2c35] mb-4">
          Gửi ảnh xác minh thanh toán
        </h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 w-full"
        />

        {/* ✅ Preview ảnh */}
        {file && (
          <div className="mb-4">
            <p className="text-sm text-green-600 mb-1">
              ✓ Đã chọn ảnh: <b>{file.name}</b>
            </p>
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-40 rounded-lg border mx-auto"
            />
          </div>
        )}

        <button
          onClick={uploadPaymentProof}
          disabled={loading}
          className="w-full py-2 rounded-xl bg-[#e06c7f] text-white hover:bg-[#cc5f72] disabled:opacity-60"
        >
          {loading ? "Đang gửi..." : "Gửi ảnh chuyển khoản"}
        </button>
      </div>
    </div>
  );
};

export default UploadPaymentProof;
