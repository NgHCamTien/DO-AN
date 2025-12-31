import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();
      if (response.ok) setProducts(data.products || []);
      else setError("Không thể tải danh sách sản phẩm");
    } catch {
      setError("Lỗi kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;
    try {
      setDeleteLoading(id);
      const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
      if (!userInfo?.token) {
        alert("Phiên đăng nhập đã hết hạn.");
        logout();
        return;
      }

      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        alert("Đã xóa sản phẩm thành công!");
      } else {
        alert(data.message || "Không thể xóa sản phẩm.");
      }
    } catch {
      alert("Lỗi kết nối đến server.");
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
   <div className="min-h-screen bg-white text-[#2c2c2c] font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <span className="text-[#e06c7f]">🛍️</span> QUẢN LÝ SẢN PHẨM
        </h2>
        <Link
          to="/admin/products/new"
          className="bg-[#e06c7f] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#c85b70] transition"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#ffe6e9] text-[#c85b70] px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#e06c7f]"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-[#faf8f6] rounded-lg p-8 text-center border border-[#f1e4da]">
          <p className="text-[#8b5e3c]">Chưa có sản phẩm nào 🌸</p>
          <Link
            to="/admin/products/new"
            className="inline-block mt-4 bg-[#e06c7f] text-white px-4 py-2 rounded-md text-sm hover:bg-[#c85b70] transition"
          >
            + Thêm sản phẩm đầu tiên
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-[#f1e4da] overflow-hidden">
          <table className="min-w-full text-sm text-[#2c2c2c]">
            <thead className="bg-[#faf8f6] border-b border-[#f1e4da]">
              <tr>
                {["Tên sản phẩm", "Danh mục", "Giá", "Trạng thái", "Thao tác"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left font-semibold text-sm"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-[#faf8f6] transition">
                  <td className="px-6 py-4 flex items-center gap-3">
                    {product.images?.[0] && (
                      <img
                        src={`http://localhost:5000${product.images[0]}`}
                        alt={product.name}
                        className="h-10 w-10 rounded-md object-cover border border-[#f1e4da]"
                      />
                    )}
                    <span className="font-medium">
                      {product.name?.length > 50
                        ? product.name.slice(0, 50) + "..."
                        : product.name}
                    </span>
                  </td>
                 <td className="px-6 py-4">
                    {product.category?.name || product.categoryName || "—"}
                  </td>


                  <td className="px-6 py-4">
                    {product.discountPrice ? (
                      <>
                        <span className="line-through text-gray-400 text-sm mr-1">
                          {product.price?.toLocaleString("vi-VN")}₫
                        </span>
                        <span className="text-[#e06c7f] font-medium">
                          {product.discountPrice?.toLocaleString("vi-VN")}₫
                        </span>
                      </>
                    ) : (
                      <span>{product.price?.toLocaleString("vi-VN")}₫</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        product.isFeatured
                          ? "bg-[#ffe8b0] text-[#8b5e3c]"
                          : "bg-[#f4f4f4] text-gray-600"
                      }`}
                    >
                      {product.isFeatured ? "Nổi bật" : "Thường"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      to={`/admin/products/edit/${product._id}`}
                      className="text-[#8b5e3c] hover:text-[#e06c7f] mr-3"
                    >
                      Sửa
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
                      disabled={deleteLoading === product._id}
                      className={`${
                        deleteLoading === product._id
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-[#e06c7f] hover:text-[#c85b70]"
                      }`}
                    >
                      {deleteLoading === product._id ? "Đang xóa..." : "Xóa"}
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

export default AdminProducts;
