import React, { useState, useEffect } from "react";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "" });
 

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/categories");
      const data = await res.json();
      if (res.ok) setCategories(data);
      else setError("Không thể tải danh mục");
    } catch {
      setError("Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "name" && {
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim(),
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = JSON.parse(sessionStorage.getItem("userInfo"))?.token;
    if (!token) return alert("Phiên đăng nhập hết hạn.");

    const url = editing
      ? `http://localhost:5000/api/categories/${editing._id}`
      : "http://localhost:5000/api/categories";
    const method = editing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(editing ? "Cập nhật danh mục thành công!" : "Thêm danh mục thành công!");
        fetchCategories();
        resetForm();
      } else {
        const data = await res.json();
        alert(data.message || "Không thể lưu danh mục");
      }
    } catch {
      alert("Lỗi kết nối đến server");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa danh mục này?")) return;
    try {
      const token = JSON.parse(sessionStorage.getItem("userInfo"))?.token;
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Đã xóa danh mục");
        fetchCategories();
      } else {
        alert("Không thể xóa danh mục");
      }
    } catch {
      alert("Lỗi kết nối server");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "" });
    setEditing(null);
    setShowForm(false);
  };

  return (
 <div className="min-h-screen bg-white text-[#2c2c2c] font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 -ml-2">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <span className="text-[#e06c7f]">🗂️</span> QUẢN LÝ DANH MỤC
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#e06c7f] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#c85b70] transition"
        >
          {showForm ? "Đóng" : "+ Thêm danh mục"}
        </button>
      </div>

      {error && (
        <div className="bg-[#ffe6e9] text-[#c85b70] px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form thêm/sửa */}
      {showForm && (
        <div className="bg-[#faf8f6] border border-[#f1e4da] rounded-lg p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[#8b5e3c] mb-4">
            {editing ? "✏️ Sửa danh mục" : "➕ Thêm danh mục mới"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#e4c6ba] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e06c7f]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#e4c6ba] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e06c7f]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mô tả</label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-[#e4c6ba] rounded-md focus:outline-none focus:ring-1 focus:ring-[#e06c7f]"
              ></textarea>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#e06c7f] text-white px-4 py-2 rounded-md hover:bg-[#c85b70] transition"
              >
                {editing ? "Cập nhật" : "Thêm mới"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-[#e4c6ba] text-[#8b5e3c] rounded-md hover:bg-[#f1e4da] transition"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách danh mục */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#e06c7f]"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-[#faf8f6] text-[#8b5e3c] border border-[#f1e4da] rounded-lg p-8 text-center">
          Chưa có danh mục nào 🌸
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-[#f1e4da] overflow-hidden">
          <table className="min-w-full text-sm text-[#2c2c2c]">
            <thead className="bg-[#faf8f6] border-b border-[#f1e4da]">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Tên danh mục</th>
                <th className="px-6 py-3 text-left font-semibold">Slug</th>
                <th className="px-6 py-3 text-left font-semibold">Mô tả</th>
                <th className="px-6 py-3 text-left font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className="hover:bg-[#faf8f6] transition">
                  <td className="px-6 py-4 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.slug}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {c.description || "Không có mô tả"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => {
                        setEditing(c);
                        setFormData({
                          name: c.name,
                          slug: c.slug,
                          description: c.description || "",
                        });
                        setShowForm(true);
                      }}
                      className="text-[#8b5e3c] hover:text-[#e06c7f] mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-[#e06c7f] hover:text-[#c85b70]"
                    >
                      Xóa
                    </button>
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

export default AdminCategories;
