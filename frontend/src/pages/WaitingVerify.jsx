// src/pages/WaitingVerify.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const WaitingVerify = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [latestProof, setLatestProof] = useState(null);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  const fetchLatestProof = useCallback(async () => {
    if (!user?.token) return;

    try {
      const res = await axios.get(
        `${API_URL}/payment-proof/my`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const proofs = res.data?.data || [];
      setLatestProof(proofs[0] || null);
    } catch (err) {
      console.error("fetchLatestProof error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ================= EFFECT =================
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchLatestProof();
  }, [user, navigate, fetchLatestProof]);

  // ================= RENDER STATUS =================
  const renderStatus = () => {
    if (!latestProof) {
      return (
        <p className="text-gray-500">
          Bạn chưa gửi ảnh xác minh thanh toán nào.
        </p>
      );
    }

    switch (latestProof.status) {
      case "APPROVED":
        return (
          <span className="text-green-600 font-semibold">
            ✔ Thanh toán đã được xác nhận
          </span>
        );
      case "REJECTED":
        return (
          <span className="text-red-600 font-semibold">
            ❌ Thanh toán bị từ chối
          </span>
        );
      default:
        return (
          <span className="text-yellow-600 font-semibold">
            ⏳ Đang chờ admin xác nhận
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#fff7f9] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[#4b2c35] mb-4">
          Trạng thái thanh toán
        </h1>

        {loading ? <p>Đang kiểm tra trạng thái...</p> : renderStatus()}

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => navigate("/my-payments")}
            className="w-full py-2 rounded-xl bg-[#e06c7f] text-white hover:bg-[#cc5f72]"
          >
            📦 Theo dõi thanh toán
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full py-2 rounded-xl border border-pink-300 text-[#e06c7f]"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default WaitingVerify;
