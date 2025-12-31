import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user: currentUser } = useContext(AuthContext);

  // Popup sửa user
  const [editUser, setEditUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("user");
  // Tim kiem, loc, phan trang co the them sau
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    fetchUsers(page, searchTerm);
    // eslint-disable-next-line
  }, [page]);

  // Lấy danh sách người dùng
 
  const fetchUsers = async (pageNumber = 1, search = "") => {
  try {
    setLoading(true);

    const storedUser = JSON.parse(sessionStorage.getItem("userInfo"));

    const token =
      storedUser?.accessToken ||
      storedUser?.token ||
      storedUser?.user?.accessToken;

    if (!token) {
      setError("❌ Không tìm thấy token. Hãy đăng nhập lại.");
      return;
    }

    let url = `http://localhost:5000/api/admin/users?page=${pageNumber}&limit=10`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    console.log("📌 API Response:", data);

    if (data?.success && Array.isArray(data.data)) {
      setUsers(data.data);
      setPage(data.page || 1);
      setTotalPages(data.pages || 1);
      setTotalUsers(data.total || data.data.length);
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

  // Mở popup sửa user
  const openEditModal = (u) => {
    setEditUser(u);
    setEditName(u.name);
    setEditRole(u.role);
  };

 
  // 📌 Cập nhật thông tin user
  const handleUpdate = async () => {
    const storedUser = JSON.parse(sessionStorage.getItem("userInfo"));
    const token = storedUser?.accessToken;

    if (!token) return alert("Bạn chưa đăng nhập!");

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/users/${editUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName,
            role: editRole,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert("Cập nhật thành công!");
        setEditUser(null);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi cập nhật thông tin người dùng");
    }
  };

  // Khoá / mở khoá tài khoản
  const toggleActive = async (id) => {
    const storedUser = JSON.parse(sessionStorage.getItem("userInfo"));
    const token = storedUser?.accessToken;

    if (!token) return alert("Bạn chưa đăng nhập!");

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/users/${id}/toggle`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Lỗi khi khoá/mở khoá tài khoản");
    }
  };


  // 📌 Format ngày
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });


  // 📌 Badge vai trò
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
  // Xử lý tìm kiếm
  const handleSearch = () => {
    setPage(1);
    fetchUsers(1, searchTerm);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  // Xoá người dùng 
  const handleDeleteUser = async (id) => {
  if (!window.confirm("Bạn có chắc muốn xoá người dùng này?")) return;

  const storedUser = JSON.parse(sessionStorage.getItem("userInfo"));
  const token = storedUser?.accessToken;

  if (!token) return alert("Bạn chưa đăng nhập!");

  try {
    const res = await fetch(
      `http://localhost:5000/api/admin/users/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    if (data.success) {
      alert(data.message || "Đã xoá người dùng");
      fetchUsers(page, searchTerm);
    } else {
      alert(data.message || "Xoá thất bại");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi khi xoá người dùng");
  }
};
  // Đặt lại mật khẩu người dùng
const handleResetPassword = async (id) => {
  if (!window.confirm("Đặt lại mật khẩu về mặc định (123456)?")) return;

  const storedUser = JSON.parse(sessionStorage.getItem("userInfo"));
  const token = storedUser?.accessToken;

  if (!token) return alert("Bạn chưa đăng nhập!");

  try {
    const res = await fetch(
      `http://localhost:5000/api/admin/users/${id}/reset-password`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    if (data.success) {
      alert(
        `Đặt lại mật khẩu thành công.\nMật khẩu mới: ${data.newPassword}`
      );
    } else {
      alert(data.message || "Reset mật khẩu thất bại");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Lỗi khi reset mật khẩu");
  }
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

        {/* Thanh tìm kiếm */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
          <div>
            <p className="text-sm text-[#8b5e3c]">
              Tổng: <span className="font-semibold">{totalUsers}</span> người dùng
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              className="border border-[#f1e4da] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#e06c7f]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 text-sm rounded-lg bg-[#e06c7f] text-white hover:bg-[#c85b70]"
            >
              Tìm
            </button>
          </div>
        </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#faf8f6] p-4 rounded-lg border border-[#f1e4da]">
              <h3 className="text-sm font-medium text-[#8b5e3c]">
                Tổng người dùng
              </h3>
              <p className="text-2xl font-bold text-[#2c2c2c] mt-1">
                {users.length}
              </p>
            </div>
            <div className="bg-[#faf8f6] p-4 rounded-lg border border-[#f1e4da]">
              <h3 className="text-sm font-medium text-[#8b5e3c]">
                Quản trị viên
              </h3>
              <p className="text-2xl font-bold text-[#c85b70] mt-1">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
            <div className="bg-[#faf8f6] p-4 p-4 rounded-lg border border-[#f1e4da]">
              <h3 className="text-sm font-medium text-[#8b5e3c]">
                Người dùng thường
              </h3>
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
                  <th className="px-6 py-3 text-left font-semibold">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-[#faf8f6] transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">{u.name}</td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">
                      {u._id === currentUser?._id ? (
                        <span className="text-gray-400">
                          Tài khoản hiện tại
                        </span>
                      ) : (
                        <>
                      <button
                        onClick={() => openEditModal(u)}
                        className="text-[#8b5e3c] hover:text-[#e06c7f] mr-3"
                      >
                        Sửa
                      </button>

                      <button
                        onClick={() => toggleActive(u._id)}
                        className="text-[#e06c7f] hover:text-[#c85b70] mr-3"
                      >
                        {u.active ? "Khoá" : "Mở khoá"}
                      </button>

                      <button
                        onClick={() => handleResetPassword(u._id)}
                        className="text-[#4b7bec] hover:text-[#3867d6] mr-3"
                      >
                        Đặt lại mật khẩu
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Xoá
                      </button>
                    </>

                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              
            </table>
    {/* Phân trang */}
    <div className="flex items-center justify-between px-6 py-4 border-t border-[#f1e4da]">
      <button
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className={`px-3 py-1 text-sm rounded-lg border ${
          page <= 1
            ? "text-gray-300 border-gray-200 cursor-not-allowed"
            : "text-[#8b5e3c] border-[#f1e4da] hover:bg-[#faf8f6]"
        }`}
      >
        « Trang trước
      </button>

      <span className="text-sm text-[#8b5e3c]">
        Trang <b>{page}</b> / <b>{totalPages}</b>
      </span>

      <button
        disabled={page >= totalPages}
        onClick={() => setPage(page + 1)}
        className={`px-3 py-1 text-sm rounded-lg border ${
          page >= totalPages
            ? "text-gray-300 border-gray-200 cursor-not-allowed"
            : "text-[#8b5e3c] border-[#f1e4da] hover:bg-[#faf8f6]"
        }`}
      >
        Trang sau »
      </button>
    </div>

          </div>
        </>
      )}

      {/* Popup sửa user */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Chỉnh sửa người dùng</h3>

            <label className="block mb-2">Tên</label>
            <input
              type="text"
              className="w-full border p-2 rounded mb-4"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <label className="block mb-2">Vai trò</label>
            <select
              className="w-full border p-2 rounded mb-4"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
            >
              <option value="user">Người dùng</option>
              <option value="admin">Quản trị viên</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setEditUser(null)}
              >
                Hủy
              </button>

              <button
                className="px-4 py-2 bg-[#e06c7f] text-white rounded"
                onClick={handleUpdate}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
