import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    fetchUsers();
  }, []);

const fetchUsers = async () => {
  try {
    setLoading(true);

    const storedUser = JSON.parse(localStorage.getItem("userInfo"));

    const token =
      storedUser?.accessToken ||
      storedUser?.token ||
      storedUser?.user?.refreshToken ||
      storedUser?.refreshToken;

    console.log("📌 TOKEN USED:", token);

    if (!token) {
      setError("❌ Không tìm thấy token. Hãy đăng nhập lại.");
      return;
    }

    const res = await fetch("http://localhost:5000/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    console.log("📌 API Response:", data);

    if (data?.success && Array.isArray(data.data)) {
      setUsers(data.data);
    } else {
      setError("❌ Dữ liệu trả về sai định dạng từ server");
    }
  } catch (err) {
    console.error(err);
    setError("❌ Lỗi kết nối đến server");
  } finally {
    setLoading(false);
  }
};



  const formatDate = (date) =>
    new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getRoleBadge = (role) => {
    const roles = {
      admin: "bg-[#ffe6e9] text-[#c85b70]",
      user: "bg-[#f1e4da] text-[#8b5e3c]",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full ${
          roles[role] || roles.user
        }`}
      >
        {role === "admin" ? "Quản trị viên" : "Người dùng"}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#2c2c2c] font-sans">
      <h2 className="text-2xl font-semibold flex items-center gap-2 mb-8">
        <span className="text-[#e06c7f]">👤</span> Quản lý người dùng
      </h2>

      {error && (
        <div className="bg-[#ffe6e9] text-[#c85b70] px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#e06c7f]"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-[#faf8f6] border border-[#f1e4da] rounded-lg p-10 text-center text-[#8b5e3c]">
          Không có người dùng nào 🌸
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#faf8f6] p-4 rounded-lg border border-[#f1e4da]">
              <h3 className="text-sm font-medium text-[#8b5e3c]">Tổng người dùng</h3>
              <p className="text-2xl font-bold text-[#2c2c2c] mt-1">
                {users.length}
              </p>
            </div>
            <div className="bg-[#faf8f6] p-4 rounded-lg border border-[#f1e4da]">
              <h3 className="text-sm font-medium text-[#8b5e3c]">Quản trị viên</h3>
              <p className="text-2xl font-bold text-[#c85b70] mt-1">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
            <div className="bg-[#faf8f6] p-4 rounded-lg border border-[#f1e4da]">
              <h3 className="text-sm font-medium text-[#8b5e3c]">Người dùng thường</h3>
              <p className="text-2xl font-bold text-[#8b5e3c] mt-1">
                {users.filter((u) => u.role === "user").length}
              </p>
            </div>
          </div>

          {/* Users table */}
          <div className="bg-white border border-[#f1e4da] rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full text-sm text-[#2c2c2c]">
              <thead className="bg-[#faf8f6] border-b border-[#f1e4da]">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Tên</th>
                  <th className="px-6 py-3 text-left font-semibold">Email</th>
                  <th className="px-6 py-3 text-left font-semibold">Vai trò</th>
                  <th className="px-6 py-3 text-left font-semibold">Ngày tạo</th>
                  <th className="px-6 py-3 text-left font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#faf8f6] transition-colors">
                    <td className="px-6 py-4 font-medium">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">
                      {u._id === currentUser?._id ? (
                        <span className="text-gray-400">Tài khoản hiện tại</span>
                      ) : (
                        <>
                          <button className="text-[#8b5e3c] hover:text-[#e06c7f] mr-3">
                            Sửa
                          </button>
                          <button className="text-[#e06c7f] hover:text-[#c85b70]">
                            Khóa
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsers;
