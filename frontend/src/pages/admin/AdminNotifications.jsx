import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const API_BASE = "http://localhost:5000/api/notifications";

const AdminNotifications = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenu, setOpenMenu] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("❌ Lỗi:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await axios.put(
        `${API_BASE}/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };
  const deleteNoti = async (id) => {
  if (!window.confirm("Xóa thông báo này?")) return;

  try {
    await axios.delete(`${API_BASE}/${id}`, {
      headers: { Authorization: `Bearer ${user?.token}` },
    });
    fetchNotifications();
  } catch (err) {
    console.error(err);
  }
};


  const markAll = async () => {
    try {
      await axios.put(
        `${API_BASE}/mark-all`,
        {},
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#2c2c2c] font-sans">

      {/* Header */}
      <div className="flex justify-between items-center mb-10 -ml-2">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <span className="text-[#e06c7f]">🔔</span> THÔNG BÁO HỆ THỐNG
        </h2>

        <button
          onClick={markAll}
          className="bg-[#e06c7f] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#c85b70] transition"
        >
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#e06c7f]"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-[#faf8f6] text-[#8b5e3c] border border-[#f1e4da] rounded-lg p-8 text-center">
          Không có thông báo nào 🌸
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-[#f1e4da] overflow-hidden">
          <table className="min-w-full text-sm text-[#2c2c2c]">
            <thead className="bg-[#faf8f6] border-b border-[#f1e4da]">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Nội dung</th>
                <th className="px-6 py-3 text-left font-semibold">Thời gian</th>
                <th className="px-6 py-3 text-left font-semibold">Trạng thái</th>
                <th className="px-6 py-3 text-left font-semibold">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {notifications.map((n) => (
                <tr
                  key={n._id}
                  className={`transition ${
                    !n.read ? "bg-[#fff3f6]" : "hover:bg-[#faf8f6]"
                  }`}
                >
                  <td className="px-6 py-4">{n.message}</td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(n.createdAt).toLocaleString("vi-VN")}
                  </td>

                  <td className="px-6 py-4">
                    {n.read ? (
                      <span className="text-green-600 font-medium">Đã đọc</span>
                    ) : (
                      <span className="text-[#e06c7f] font-medium">Chưa đọc</span>
                    )}
                  </td>

                <td className="px-6 py-4 relative flex items-center gap-3">

                {/* Nếu chưa đọc, hiện nút đánh dấu */}
                {!n.read && (
                    <button
                    onClick={() => markRead(n._id)}
                    className="text-[#8b5e3c] hover:text-[#e06c7f]"
                    >
                    Đánh dấu đã đọc
                    </button>
                )}

                {/* Nút mở dropdown */}
                <button
                    onClick={() => setOpenMenu(openMenu === n._id ? null : n._id)}
                    className="px-2 py-1 text-lg hover:bg-gray-100 rounded"
                >
                    ⋮
                </button>

                {/* MENU DROPDOWN */}
                {openMenu === n._id && (
                    <div className="absolute right-0 top-10 w-44 bg-white shadow-lg border rounded-lg z-20">

                    {/* Xem chi tiết */}
                    <button
                        onClick={() => {
                        window.location.href = "/admin/reviews";
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-pink-50"
                    >
                        👀 Xem chi tiết
                    </button>

                    {/* Đánh dấu đã đọc */}
                    {!n.read && (
                        <button
                        onClick={() => markRead(n._id)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-pink-50"
                        >
                        ✔ Đánh dấu đã đọc
                        </button>
                    )}

                    {/* Xóa */}
                    <button
                        onClick={() => deleteNoti(n._id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                    >
                        🗑 Xóa thông báo
                    </button>
                    </div>
                )}
                </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
