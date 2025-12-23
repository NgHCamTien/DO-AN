import React, { useEffect, useMemo, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/common/Header";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";
const API_URL = `${API_BASE}/api/payment-requests/my`;

const statusMap = {
  PENDING: {
    label: "Chờ xác minh",
    color: "text-yellow-700",
    pill: "bg-yellow-100 text-yellow-800 border-yellow-200",
    cardBg: "bg-[#fffdf5]",
    step: 1,
  },
  APPROVED: {
    label: "Đã xác nhận",
    color: "text-green-700",
    pill: "bg-green-100 text-green-800 border-green-200",
    cardBg: "bg-[#f3fff7]",
    step: 3,
  },
  REJECTED: {
    label: "Bị từ chối",
    color: "text-red-700",
    pill: "bg-red-100 text-red-800 border-red-200",
    cardBg: "bg-[#fff5f5]",
    step: 2,
  },
};

const StepDot = ({ active }) => (
  <div
    className={`w-3 h-3 rounded-full ${
      active ? "bg-pink-500" : "bg-gray-300"
    }`}
  />
);

// ✅ FIX URL ẢNH: hỗ trợ "uploads/..", "/uploads/..", "http..."
const toPublicUrl = (p) => {
  if (!p) return "";
  if (typeof p !== "string") return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;

  // nếu DB lưu "uploads/abc.jpg" -> "/uploads/abc.jpg"
  const normalized = p.startsWith("/") ? p : `/${p}`;
  return `${API_BASE}${normalized}`;
};

const formatVND = (n) => {
  const num = Number(n || 0);
  return num.toLocaleString("vi-VN") + "đ";
};

const UserPaymentTracking = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openProof, setOpenProof] = useState(null); // item đang mở modal

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchData();
    // eslint-disable-next-line
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setList(res.data.data || []);
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const sorted = useMemo(() => {
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [list]);

 return (
  <>
    <Header />
    <Navbar />

    <main className="bg-[#fff] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#4b2c35]">
            📦 Theo dõi thanh toán
          </h1>

          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-lg border border-pink-200 bg-white hover:bg-pink-50 text-sm text-[#4b2c35]"
          >
            Làm mới
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-xl p-6 border border-pink-100 text-gray-600">
            Đang tải dữ liệu...
          </div>
        )}

        {/* EMPTY */}
        {!loading && sorted.length === 0 && (
          <div className="bg-white rounded-xl p-6 border border-pink-100 text-gray-600">
            Bạn chưa có yêu cầu thanh toán nào.
          </div>
        )}

        {/* LIST */}
        <div className="space-y-5">
          {!loading &&
            sorted.map((item) => {
              const status = statusMap[item.status] || statusMap.PENDING;
              const items = item?.orderSnapshot?.orderItems || [];
              const first = items[0];
              const totalQty = items.reduce(
                (s, it) => s + Number(it.quantity || 0),
                0
              );

              const productImage =
                first?.image || first?.images?.[0] || first?.thumbnail;

              const proofUrl = toPublicUrl(item.image);
              const productUrl = toPublicUrl(productImage);

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl p-5 border border-pink-100"
                >
                  {/* TOP */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-[#4b2c35]">
                        Đơn #{item._id.slice(-6).toUpperCase()}
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full border ${status.pill}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* PRODUCT */}
                    <div className="flex gap-4 flex-1">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border bg-white flex items-center justify-center">
                        {productUrl ? (
                          <img
                            src={productUrl}
                            alt={first?.name || "product"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="text-xs text-gray-400 px-2 text-center">
                            Không có ảnh
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="text-lg font-semibold text-[#4b2c35]">
                          {first?.name || "Sản phẩm"}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Số lượng: <b>{totalQty || 1}</b>
                          {items.length > 1 && (
                            <span className="text-gray-500">
                              {" "}
                              (gồm {items.length} món)
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">
                          Tổng tiền:{" "}
                          <b className="text-[#e06c7f]">
                            {formatVND(item?.orderSnapshot?.totalPrice)}
                          </b>
                        </div>

                        {item?.orderSnapshot?.note && (
                          <div className="text-sm text-gray-600 mt-2 line-clamp-2">
                            📝 Ghi chú: {item.orderSnapshot.note}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="md:w-[260px] flex md:flex-col gap-3 md:items-stretch items-center justify-between">
                      <button
                        onClick={() => setOpenProof(item)}
                        className="px-4 py-2 rounded-lg bg-white border border-pink-200 hover:bg-pink-50 text-sm"
                      >
                        Xem ảnh chuyển khoản
                      </button>

                      {item.status === "APPROVED" && item.order && (
                        <button
                          onClick={() => navigate(`/order/${item.order}`)}
                          className="px-4 py-2 rounded-lg bg-[#e06c7f] text-white hover:bg-[#cc5f72] text-sm"
                        >
                          Xem chi tiết →
                        </button>
                      )}

                      {item.status === "REJECTED" && item.adminNote && (
                        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                          ❗ Lý do: <b>{item.adminNote}</b>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* TIMELINE */}
                  <div className="mt-6">
                    <div className="flex items-center gap-3">
                      <StepDot active />
                      <div className="flex-1 h-[2px] bg-pink-200" />
                      <StepDot active={item.status !== "PENDING"} />
                      <div className="flex-1 h-[2px] bg-pink-200" />
                      <StepDot active={item.status === "APPROVED"} />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Đã gửi</span>
                      <span>{item.status === "REJECTED" ? "Từ chối" : "Duyệt"}</span>
                      <span>Hoàn tất</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* MODAL */}
      {openProof && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setOpenProof(null)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-xl overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold text-[#4b2c35]">
                Ảnh chuyển khoản – Đơn #{openProof._id.slice(-6).toUpperCase()}
              </div>
              <button
                onClick={() => setOpenProof(null)}
                className="px-3 py-1 rounded-lg border hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>

            <div className="p-4 bg-[#fff7f9]">
              {toPublicUrl(openProof.image) ? (
                <img
                  src={toPublicUrl(openProof.image)}
                  alt="payment-proof"
                  className="w-full max-h-[70vh] object-contain rounded-lg bg-white"
                />
              ) : (
                <div className="p-6 text-gray-500">
                  Không tìm thấy ảnh chuyển khoản.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>

    <Footer />
  </>
);

};

export default UserPaymentTracking;
