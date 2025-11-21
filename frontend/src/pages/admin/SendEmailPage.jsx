import React, { useState } from "react";

const emailTemplates = {
  promo: {
    name: "🎁 Khuyến mãi",
    html: `
      <h1 style="color:#e06c7f;">🌸 Ưu đãi đặc biệt!</h1>
      <p>Giảm <strong>20%</strong> đơn hàng hoa tươi hôm nay 💐</p>
    `,
  },
  holiday: {
    name: "🎄 Dịp lễ / năm mới",
    html: `
      <h1 style="color:#e06c7f;">🎄 Chúc mừng năm mới!</h1>
      <p>Hoa tươi giảm giá toàn bộ 15% tại DDT Flower Shop</p>
    `,
  },
  birthday: {
    name: "🎂 Sinh nhật",
    html: `
      <h1 style="color:#e06c7f;">🎂 Happy Birthday!</h1>
      <p>🎁 Tặng voucher 10% cho ngày đặc biệt của bạn 💌</p>
    `,
  },
  valentine: {
    name: "❤️ Valentine",
    html: `
      <h1 style="color:#e06c7f;">❤️ Happy Valentine!</h1>
      <p>💐 Gửi yêu thương cùng bó hoa rực rỡ</p>
    `,
  },
  women: {
    name: "💐 20/10 & 8/3",
    html: `
      <h1 style="color:#e06c7f;">💐 Tri ân phái đẹp!</h1>
      <p>⚡ Giảm giá 30% duy nhất hôm nay</p>
    `,
  },
};

const SendEmailPage = () => {
  const [subject, setSubject] = useState("");
  const [template, setTemplate] = useState("promo");
  const [customHtml, setCustomHtml] = useState("");
  const [targetGroup, setTargetGroup] = useState("subscribed"); // ⭐ NEW
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("adminToken");

  const handleSend = async () => {
    setSending(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          group: targetGroup,
          html:
            template === "custom"
              ? customHtml
              : emailTemplates[template].html,
        }),
      });

      const data = await res.json();
      setMessage(data.message || "Email đã được gửi!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Gửi email thất bại");
    }

    setSending(false);
  };

  const previewHtml =
    template === "custom"
      ? customHtml || "<p>Nhập nội dung HTML...</p>"
      : emailTemplates[template].html;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-[#e06c7f] mb-8">
        📩 Gửi Email Marketing
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg max-w-3xl">
        {/* Subject */}
        <label className="font-medium">Tiêu đề Email</label>
        <input
          className="w-full border p-3 rounded-lg mb-4"
          placeholder="Nhập tiêu đề email"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        {/* Target Group */}
        <label className="font-medium">Gửi tới nhóm khách hàng 👥</label>
        <select
          className="w-full border p-3 rounded-lg mb-4"
          value={targetGroup}
          onChange={(e) => setTargetGroup(e.target.value)}
        >
          <option value="all">📢 Tất cả khách hàng</option>
          <option value="subscribed">📰 Đăng ký nhận email</option>
          <option value="vip">👑 Khách hàng VIP</option>
        </select>

        {/* Template selector */}
        <label className="font-medium">Chọn mẫu email 📌</label>
        <select
          className="w-full border p-3 rounded-lg mb-4"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        >
          {Object.entries(emailTemplates).map(([key, t]) => (
            <option key={key} value={key}>
              {t.name}
            </option>
          ))}
          <option value="custom">✍️ Tự nhập nội dung</option>
        </select>

        {template === "custom" && (
          <textarea
            className="w-full border p-3 rounded-lg mb-4 h-40"
            placeholder="Nhập HTML tùy chỉnh..."
            value={customHtml}
            onChange={(e) => setCustomHtml(e.target.value)}
          />
        )}

        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full py-3 bg-[#e06c7f] hover:bg-[#d35d75] text-white font-semibold rounded-lg"
        >
          {sending ? "Đang gửi email..." : "📨 Gửi Email"}
        </button>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              message.startsWith("❌")
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {message}
          </div>
        )}
      </div>

      {/* PREVIEW */}
      <div className="mt-8 p-6 bg-[#faf8f6] border border-[#f0e8e3] rounded-xl">
        <h2 className="text-xl font-semibold mb-3">📌 Preview email</h2>

        <div
          className="border bg-white rounded-lg p-5 shadow-sm"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </div>
    </div>
  );
};

export default SendEmailPage;
