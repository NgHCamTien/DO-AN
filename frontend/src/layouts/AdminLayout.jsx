import React from "react";
import NetworkStatus from "../pages/NetworkStatus";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
const AdminLayout = () => {
  const location = useLocation();
const navigate = useNavigate();
const { user, setUser } = useContext(AuthContext);

  const menuGroups = [
    {
      title: "Quản lý cửa hàng",
      items: [
        { name: "Tổng quan", path: "/admin/dashboard", icon: "📊" },
        { name: "Sản phẩm", path: "/admin/products", icon: "🛍️" },
        { name: "Đơn hàng", path: "/admin/orders", icon: "📦" },
        { name: "Danh mục", path: "/admin/categories", icon: "🗂️" },
        { name: "Người dùng", path: "/admin/users", icon: "👤" },
        { name: "Đánh giá sản phẩm", path: "/admin/reviews", icon: "⭐" },
        { name: "Thông báo", path: "/admin/notifications", icon: "🔔" },
        { name: "Duyệt ảnh thanh toán", path : "/admin/payment-requests", icon: "🖼️" },
        { name: "Chat Hỗ Trợ", path: "/admin/adminchat", icon: "💬" },
      ],
    },

    {
      title: "Marketing",
      items: [
        { name: "Gửi Email", path: "/admin/email", icon: "📩" },
        { name: "Mã giảm giá", path: "/admin/coupons", icon: "🎁", disabled: true }, // 💤 chưa cài
        {
          name: "Lịch sử email",
          path: "/admin/email/history",
          icon: "🗂️"
        },

      ],
    },

    {
      title: "Hệ thống",
      items: [
        { name: "Cấu hình website", path: "/admin/settings", icon: "⚙️", disabled: true },
        { name: "Phân quyền", path: "/admin/roles", icon: "🔐", disabled: true },
      ],
    },
  ];
const handleLogout = () => {
  localStorage.removeItem("userInfo");
  setUser(null);
  navigate("/login");
};

  return (
    <div className="flex min-h-screen font-sans bg-[#fff] text-[14px] leading-relaxed text-[#3e2f2f]">

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 bottom-0 w-60 bg-[#fbf9f7] border-r border-[#ecdcd3] flex flex-col shadow-sm z-50">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 p-4 border-b border-[#ecdcd3] hover:bg-[#e06c7f22] transition"
        >
          <div className="w-10 h-10 rounded-full bg-[#e06c7f] flex items-center justify-center text-white font-bold shadow-md">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-[#3e2f2f]">Admin</p>
            <p className="text-xs text-[#8b5e3c] font-medium">DDT Flower</p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="p-3 flex flex-col overflow-y-auto flex-1">

          {menuGroups.map((group) => (
            <div key={group.title} className="mb-4">
              <p className="text-xs uppercase text-[#3e2f2f] font-semibold mb-2 px-2 tracking-wide">
                {group.title}
              </p>

              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <div key={item.path}>
                    {item.disabled ? (
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 rounded-md text-sm text-gray-400 cursor-not-allowed opacity-60"
                      >
                        <span>{item.icon}</span> {item.name}
                      </button>
                    ) : (
                      <Link
                        to={item.path}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all duration-200 
                          ${
                            isActive
                              ? "bg-[#e06c7f33] text-[#3e2f2f] font-semibold border-l-4 border-[#e06c7f]"
                              : "text-[#1e293b] hover:bg-[#e06c7f22] hover:text-[#3e2f2f]"
                          }`}
                      >
                        <span>{item.icon}</span>
                        {item.name}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

        </nav>

        {/* View Store Button */}
        <div className="p-3">
          <a
            href="/"
            className="block text-center bg-[#e06c7f] text-white py-2 rounded-md text-sm font-semibold hover:bg-[#a56c44] transition"
          >
            🌸 Xem trang web
          </a>
          <button
          onClick={handleLogout}
          className="w-full mt-2 text-center bg-[#e06c7f] text-white py-2 rounded-md text-sm font-semibold hover:bg-[#cc5f72] transition"
        >
          🔒 Đăng xuất
        </button>

        </div>
      </aside>

      {/* MAIN CONTENT */}
   <main className="flex-1 ml-60 p-6 overflow-y-auto bg-[#fff]">

  {/* 🔹 NETWORK STATUS – LẬP TRÌNH MẠNG */}
  <div className="mb-4">
    <NetworkStatus
      role="admin"
      userId={user?._id || "admin"}
    />
  </div>

  <div className="p-6 rounded-xl shadow-md min-h-[70vh] bg-white border border-[#ecdcd3]">
    <Outlet />
  </div>
</main>

    </div>
  );
};

export default AdminLayout;
