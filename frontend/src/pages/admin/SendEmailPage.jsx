import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SendEmailPage = () => {
  const [subject, setSubject] = useState("");
  const [group, setGroup] = useState("all");
  const [templateName, setTemplateName] = useState("promo");
  const [htmlContent, setHtmlContent] = useState("");
  const [resultMsg, setResultMsg] = useState(null);

  // Templates mẫu
  const templates = {
    promo: `
      <h2>🎉 Ưu đãi đặc biệt!</h2>
      <p>Giảm 20% tất cả sản phẩm tuần này!</p>
    `,
    holiday: `
      <h2>🌸 Quà tặng ngày lễ!</h2>
      <p>Hoa tươi giảm giá cho các dịp lễ hội.</p>
    `,
    custom: ""
  };

  useEffect(() => {
    if (templateName !== "custom") {
      setHtmlContent(templates[templateName]);
    }
  }, [templateName]);

  // ===============================
  //      GỬI EMAIL MARKETING
  // ===============================
  const sendEmail = async () => {
    console.log(">>> CLICK WORKING");

    setResultMsg(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setResultMsg({
        type: "error",
        text: "❌ Bạn chưa đăng nhập (không có token).",
      });
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/email/send`,
        {
          subject,
          group,
          html: htmlContent,
          templateName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResultMsg({ type: "success", text: res.data.message });
    } catch (err) {
      console.log("Email send error:", err);
      setResultMsg({
        type: "error",
        text: "❌ Không thể gửi email. Kiểm tra backend console!",
      });
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#d14b6a" }}>
        📩 Gửi Email Marketing
      </h1>

      {/* GRID: TRÁI FORM - PHẢI PREVIEW */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "40px",
        marginTop: "30px",
      }}>
        {/* FORM TRÁI */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
          }}
        >
          <label>Tiêu đề Email</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={{ width: "100%", marginTop: "8px", marginBottom: "20px", padding: "12px" }}
          />

          <label>Gửi đến nhóm</label>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            style={{ width: "100%", padding: "12px", marginBottom: "20px" }}
          >
            <option value="all">📢 Tất cả khách hàng</option>
            <option value="user">👤 User</option>
            <option value="admin">🛠 Admin</option>
            <option value="newsletter">📬 Newsletter</option>
            <option value="vip">💎 VIP</option>
          </select>

          <label>Mẫu email</label>
          <select
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            style={{ width: "100%", padding: "12px", marginBottom: "20px" }}
          >
            <option value="promo">🎁 Khuyến mãi</option>
            <option value="holiday">🎉 Ngày lễ</option>
            <option value="custom">📝 Tùy chỉnh</option>
          </select>

          {templateName === "custom" && (
            <textarea
              rows="6"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              style={{ width: "100%", padding: "12px", marginBottom: "20px" }}
            />
          )}

          <button
            onClick={sendEmail}
            style={{
              width: "100%",
              background: "#d86b7a",
              padding: "15px",
              borderRadius: "8px",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            ✉ Gửi Email
          </button>

          {/* THÔNG BÁO */}
          {resultMsg && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                borderRadius: "8px",
                background: resultMsg.type === "success" ? "#e8fff0" : "#ffe8e8",
                color: resultMsg.type === "success" ? "#008f3c" : "#d10000",
              }}
            >
              {resultMsg.text}
            </div>
          )}
        </div>

        {/* PREVIEW PHẢI */}
        <div
          style={{
            background: "#faf7f7",
            padding: "25px",
            borderRadius: "12px",
            border: "1px solid #eee",
          }}
        >
          <h2>🔍 Preview</h2>

          <div
            style={{
              marginTop: "20px",
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
};

export default SendEmailPage;
