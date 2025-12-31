import React from "react";
import { Link } from "react-router-dom";

const EmailDashboard = () => {
  const cards = [
    {
      title: "Gửi Email",
      desc: "Gửi email khuyến mãi, thông báo cho khách hàng",
      link: "/admin/email/send",
      icon: "📨",
      color: "bg-gradient-to-br from-[#ffb5c8] to-[#f88fb0]",
    },
    {
      title: "Mẫu Email",
      desc: "Tạo và sử dụng các mẫu email có sẵn",
      link: "/admin/email/templates",
      icon: "🎨",
      color: "bg-gradient-to-br from-[#ffd9aa] to-[#ffbc70]",
    },
    {
      title: "Lịch sử Email",
      desc: "Theo dõi email đã gửi và tỷ lệ mở",
      link: "/admin/email/history",
      icon: "📊",
      color: "bg-gradient-to-br from-[#c6e5ff] to-[#8ac6ff]",
    },
  ];

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-[#e06c7f] mb-6">
        📧 Quản lý Email Marketing
      </h2>

      <p className="text-gray-600 mb-8">
        Quản lý, tạo mẫu và triển khai các chiến dịch email
      </p>

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
