import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const SendEmailPage = () => {
  const [subject, setSubject] = useState("");
  const [group, setGroup] = useState("all");
  const [templateName, setTemplateName] = useState("promo");
  const [htmlContent, setHtmlContent] = useState("");
  const [resultMsg, setResultMsg] = useState(null);

  // --- Email người nhận ---
  const [recipientEmails, setRecipientEmails] = useState([]);
  const [showEmailPopup, setShowEmailPopup] = useState(false);

  // 📌 Mẫu email
  const templates = {
    promo: `
      <h2>🎉 Ưu đãi đặc biệt!</h2>
      <p>Giảm 20% cho tất cả sản phẩm trong tuần này!</p>
    `,
    holiday: `
      <h2>🌸 Quà tặng ngày lễ!</h2>
      <p>Ưu đãi dành riêng cho các dịp lễ hội.</p>
    `,
    custom: "",
  };

  // Khi đổi template
  useEffect(() => {
    if (templateName !== "custom") {
      setHtmlContent(templates[templateName]);
    }
  }, [templateName]);

  // --------------------------------------------------
  // 📌 LẤY DANH SÁCH EMAIL THEO NHÓM
  // --------------------------------------------------
  useEffect(() => {
    fetchRecipientEmails();
  }, [group]);

  const fetchRecipientEmails = async () => {
    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    const token = storedUser?.token;

    if (!token) return;

    try {
      const res = await axios.get(
        `${API_URL}/api/email/recipients?group=${group}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRecipientEmails(res.data.emails || []);
    } catch (err) {
      console.log("Lỗi lấy danh sách email: ", err);
    }
  };

  // --------------------------------------------------
  // 📩 GỬI EMAIL MARKETING
  // --------------------------------------------------
  const sendEmail = async () => {
    setResultMsg(null);

    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    const token = storedUser?.token;

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
        text: "❌ Không thể gửi email. Vui lòng kiểm tra backend!",
      });
    }
  };

  // --------------------------------------------------
  // 🖼️ GIAO DIỆN
  // --------------------------------------------------
  return (
    <div style={{ padding: "40px" }}>
      <h1
        style={{
          fontSize: "26px",
          fontWeight: "700",
          color: "#d14b6a",
          marginBottom: "20px",
        }}
      >
        📩 Gửi Email Marketing
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          marginTop: "30px",
        }}
      >
        {/* ======================================================
            FORM TRÁI
        ====================================================== */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
          }}
        >
          {/* Tiêu đề email */}
          <label>Tiêu đề Email</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Nhập tiêu đề email…"
            style={{
              width: "100%",
              marginTop: "8px",
              marginBottom: "20px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #f1e4da",
            }}
          />

          {/* Gửi đến nhóm */}
          <label>Gửi đến nhóm</label>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid #f1e4da",
              borderRadius: "8px",
            }}
          >
            <option value="all">📢 Tất cả khách hàng</option>
            <option value="user">👤 Người dùng</option>
            <option value="admin">🛠 Quản trị viên</option>
            <option value="newsletter">📬 Đăng ký nhận tin</option>
            <option value="vip">💎 Khách VIP</option>
          </select>

          {/* ===== HIỂN THỊ DANH SÁCH EMAIL ===== */}
          {recipientEmails.length > 0 && (
            <div
              style={{
                margin: "10px 0",
                padding: "12px",
                background: "#faf8f6",
                border: "1px solid #f1e4da",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#8b5e3c",
              }}
            >
              <b>📧 Số email sẽ gửi:</b> {recipientEmails.length}
              <br />

              {recipientEmails.slice(0, 3).map((mail, i) => (
                <div key={i}>• {mail}</div>
              ))}

              {recipientEmails.length > 3 && (
                <button
                  onClick={() => setShowEmailPopup(true)}
                  style={{
                    marginTop: "6px",
                    color: "#d86b7a",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Xem tất cả ({recipientEmails.length})
                </button>
              )}
            </div>
          )}

          {/* Mẫu email */}
          <label>Mẫu email</label>
          <select
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "20px",
              border: "1px solid #f1e4da",
              borderRadius: "8px",
            }}
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
              placeholder="Nhập nội dung HTML…"
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "20px",
                borderRadius: "8px",
                border: "1px solid #f1e4da",
              }}
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
              transition: "0.3s",
            }}
          >
            ✉ Gửi Email
          </button>

          {resultMsg && (
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                borderRadius: "8px",
                background:
                  resultMsg.type === "success" ? "#e8fff0" : "#ffe8e8",
                color: resultMsg.type === "success" ? "#008f3c" : "#d10000",
                border:
                  resultMsg.type === "success"
                    ? "1px solid #b2ffcf"
                    : "1px solid #ffb3b3",
              }}
            >
              {resultMsg.text}
            </div>
          )}
        </div>

        {/* ======================================================
            XEM TRƯỚC
        ====================================================== */}
        <div
          style={{
            background: "#faf7f7",
            padding: "25px",
            borderRadius: "12px",
            border: "1px solid #f1e4da",
          }}
        >
          <h2 style={{ color: "#8b5e3c" }}>🔍 Xem trước nội dung</h2>

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

      {/* ======================================================
          POPUP DANH SÁCH EMAIL
      ====================================================== */}
      {showEmailPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "420px",
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ color: "#d86b7a", marginBottom: "10px" }}>
              📬 Danh sách email ({recipientEmails.length})
            </h3>

            <div
              style={{
                maxHeight: "320px",
                overflowY: "auto",
                paddingRight: "10px",
                border: "1px solid #f1e4da",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              {recipientEmails.map((mail, idx) => (
                <div key={idx} style={{ marginBottom: "5px" }}>
                  • {mail}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowEmailPopup(false)}
              style={{
                marginTop: "15px",
                width: "100%",
                padding: "12px",
                background: "#e06c7f",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendEmailPage;
