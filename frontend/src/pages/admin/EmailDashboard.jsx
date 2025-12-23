import React from "react";
import { Link } from "react-router-dom";

const EmailDashboard = () => {
  const cards = [
    {
      title: "Gửi email ngay",
      desc: "Gửi email khuyến mãi / lễ / thông báo",
      link: "/admin/email/send",
      icon: "📨",
      color: "bg-gradient-to-br from-[#ffb5c8] to-[#f88fb0]",
    },
    {
      title: "Template email",
      desc: "Tạo & chọn template thiết kế sẵn",
      link: "/admin/email/templates",
      icon: "🎨",
      color: "bg-gradient-to-br from-[#ffd9aa] to-[#ffbc70]",
    },
    {
      title: "Lịch sử gửi email",
      desc: "Theo dõi email đã gửi & tỷ lệ mở",
      link: "/admin/email/history",
      icon: "📊",
      color: "bg-gradient-to-br from-[#c6e5ff] to-[#8ac6ff]",
    },
  ];

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-[#e06c7f] mb-6">📩 Email Marketing Dashboard</h2>
      <p className="text-gray-600 mb-8">Quản lý và triển khai các chiến dịch email marketing</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`${card.color} shadow-lg rounded-2xl p-6 text-white transition hover:scale-[1.02]`}
          >
            <div className="text-5xl">{card.icon}</div>
            <h3 className="text-xl font-semibold mt-3">{card.title}</h3>
            <p className="opacity-90">{card.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default EmailDashboard;
