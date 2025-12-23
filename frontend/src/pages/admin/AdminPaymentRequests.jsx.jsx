import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";

const API_URL = "http://localhost:5000/api/admin/payment-requests";

const AdminPaymentRequests = () => {
  const { user } = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setList(res.data.data || []);
    } catch (err) {
      toast.error("Không tải được danh sách thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    if (!window.confirm("Duyệt thanh toán này?")) return;

    try {
      await axios.put(
        `${API_URL}/${id}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      toast.success("Đã duyệt & tạo đơn hàng");
      fetchData();
    } catch (err) {
      toast.error("Duyệt thất bại");
    }
  };

  const reject = async () => {
    if (!adminNote) {
      toast.error("Vui lòng nhập lý do");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/${rejectingId}/reject`,
        { adminNote },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      toast.success("Đã từ chối thanh toán");
      setRejectingId(null);
      setAdminNote("");
      fetchData();
    } catch (err) {
      toast.error("Từ chối thất bại");
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        💳 Duyệt thanh toán QR
      </h1>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Khách hàng</th>
              <th className="p-3">Ngày</th>
              <th className="p-3">Tổng tiền</th>
              <th className="p-3">Ảnh QR</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {list.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="p-3">
                  <div className="font-medium">{item.user?.name}</div>
                  <div className="text-gray-500 text-xs">
                    {item.user?.email}
                  </div>
                </td>

                <td className="p-3">
                  {new Date(item.createdAt).toLocaleString("vi-VN")}
                </td>

                <td className="p-3 font-medium">
                  {item.orderSnapshot?.totalPrice?.toLocaleString(
                    "vi-VN"
                  )}
                  ₫
                </td>

                <td className="p-3">
                  <img
                    src={`http://localhost:5000/${item.image}`}
                    alt="qr"
                    className="w-14 h-14 object-cover rounded cursor-pointer"
                    onClick={() =>
                      setPreviewImage(
                        `http://localhost:5000/${item.image}`
                      )
                    }
                  />
                </td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      item.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : item.status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="p-3 space-x-2">
                  {item.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => approve(item._id)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-xs"
                      >
                        Duyệt
                      </button>
                      <button
                        onClick={() => setRejectingId(item._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                      >
                        Từ chối
                      </button>
                    </>
                  )}

                  {item.status === "APPROVED" && item.order && (
                    <span className="text-green-600 text-xs">
                      Đã tạo đơn
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL XEM ẢNH */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="preview"
            className="max-w-lg rounded shadow"
          />
        </div>
      )}

      {/* MODAL TỪ CHỐI */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="font-semibold mb-2">
              Lý do từ chối
            </h3>
            <textarea
              className="w-full border p-2 rounded"
              rows={3}
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setRejectingId(null)}
                className="px-4 py-1 bg-gray-200 rounded"
              >
                Huỷ
              </button>
              <button
                onClick={reject}
                className="px-4 py-1 bg-red-500 text-white rounded"
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentRequests;
