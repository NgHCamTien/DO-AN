import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import { ToastContainer, toast } from "react-toastify";
import "react-quill/dist/quill.snow.css";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ===============================
   QUILL CONFIG (ĐƠN GIẢN – DỄ DÙNG)
================================ */
const quillModules = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const quillFormats = [
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "link",
];

/* ===============================
   CHECK NỘI DUNG TRỐNG
================================ */
const isEmptyContent = (html) => {
  if (!html) return true;
  const text = html
    .replace(/<(.|\n)*?>/g, "")
    .replace(/&nbsp;/g, "")
    .trim();
  return text.length === 0;
};

/* ===============================
   NỘI DUNG GỢI Ý MẪU
================================ */
const SAMPLE_CONTENT = `
<p>Chào bạn 🌷</p>
<p>
DDT Flower Shop xin gửi đến bạn chương trình
<strong>ưu đãi đặc biệt cuối tuần</strong> dành cho các mẫu hoa tươi.
</p>
<ul>
  <li>🎁 Giảm đến <strong>20%</strong> nhiều sản phẩm</li>
  <li>🚚 Giao hoa nhanh trong ngày</li>
  <li>🌸 Hoa tươi – thiết kế tinh tế</li>
</ul>
<p>
Hãy ghé shop để chọn những bó hoa ý nghĩa dành tặng người thân nhé 💗
</p>
<p>
Trân trọng,<br/>
<strong>DDT Flower Shop</strong>
</p>
`;

const SendEmailPage = () => {
  const [subject, setSubject] = useState("");
  const [group, setGroup] = useState("all");
  const [htmlContent, setHtmlContent] = useState("");
  const [recipientEmails, setRecipientEmails] = useState([]);

  const [touched, setTouched] = useState({
    subject: false,
    content: false,
  });

  /* ===============================
        FETCH RECIPIENTS
  ================================ */
  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const res = await axios.get(
          `${API_URL}/api/email/recipients?group=${group}`,
          {
            headers: {
              Authorization: `Bearer ${userInfo?.token}`,
            },
          }
        );
        setRecipientEmails(res.data.emails || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchRecipients();
  }, [group]);

  /* ===============================
          SEND EMAIL
  ================================ */
  const sendEmail = async () => {
    setTouched({ subject: true, content: true });

    if (!subject.trim()) {
      toast.error("⚠️ Vui lòng nhập tiêu đề email");
      return;
    }

    if (isEmptyContent(htmlContent)) {
      toast.warning("🧠 Mình đã gợi ý nội dung mẫu cho bạn nhé!");
      setHtmlContent(SAMPLE_CONTENT);
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));

       await axios.post(
        `${API_URL}/api/email/send`,
        {
          subject,
          group,
          html: htmlContent, // ✅ FIX Ở ĐÂY
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo?.token}`,
          },
        }
      );


      toast.success("✅ Email đã được gửi thành công!");
      setSubject("");
      setHtmlContent("");
      setTouched({ subject: false, content: false });
    } catch (err) {
      toast.error("❌ Không thể gửi email, vui lòng thử lại");
    }
  };

  /* ===============================
            UI
  ================================ */
  return (
    <div style={{ padding: "40px" }}>
      <ToastContainer position="top-right" autoClose={2500} />

      <h1
        style={{
          fontSize: "26px",
          fontWeight: 700,
          color: "#d14b6a",
          marginBottom: "25px",
        }}
      >
        📩 Gửi Email Marketing
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
        }}
      >
        {/* ===== LEFT ===== */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
          }}
        >
          <label>Tiêu đề email</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, subject: true }))}
            placeholder="Ví dụ: Ưu đãi hoa tươi cuối tuần 🌸"
            style={{
              width: "100%",
              padding: "12px",
              margin: "8px 0 18px",
              borderRadius: "8px",
              border:
                touched.subject && !subject.trim()
                  ? "1px solid #ff6b6b"
                  : "1px solid #f1e4da",
            }}
          />

          <label>Gửi cho ai</label>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "18px",
              borderRadius: "8px",
              border: "1px solid #f1e4da",
            }}
          >
            <option value="all">📢 Tất cả khách hàng</option>
            <option value="user">👤 Khách đã đăng ký</option>
            <option value="newsletter">📬 Người nhận bản tin</option>
            <option value="vip">💎 Khách thân thiết</option>
            <option value="admin">🛠 Nội bộ shop</option>
          </select>

          <div
            style={{
              background: "#faf8f6",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "18px",
              fontSize: "14px",
            }}
          >
            📧 Email sẽ được gửi cho{" "}
            <strong>{recipientEmails.length}</strong> người
          </div>

          <label>Nội dung email</label>
          <div
            style={{
              border:
                touched.content && isEmptyContent(htmlContent)
                  ? "1px solid #ff6b6b"
                  : "1px solid #e5e5e5",
              borderRadius: "8px",
            }}
          >
            <ReactQuill
              theme="snow"
              value={htmlContent}
              onChange={setHtmlContent}
              onBlur={() => setTouched((t) => ({ ...t, content: true }))}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Nhập nội dung email như Word..."
              style={{ height: "220px" }}
            />
          </div>

          <button
            onClick={sendEmail}
            style={{
              marginTop: "60px",
              width: "100%",
              background: "#d86b7a",
              padding: "15px",
              borderRadius: "8px",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            ✉ Gửi email
          </button>
        </div>

        {/* ===== RIGHT – PREVIEW ===== */}
        <div
          style={{
            background: "#f5f5f5",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
          >
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #eee",
                fontWeight: 600,
              }}
            >
              {subject || "Tiêu đề email"}
            </div>

            <div style={{ padding: "16px", fontSize: "14px" }}>
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    htmlContent ||
                    "<p style='color:#999'>Nội dung email sẽ hiển thị ở đây</p>",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendEmailPage;
