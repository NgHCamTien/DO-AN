const nodemailer = require("nodemailer");

/* =================================================
   1. TỰ ĐỘNG CHỌN TRANSPORT
================================================= */
const getTransporter = async () => {
  // --- Ưu tiên: Gmail App Password ---
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log("📡 Đang dùng Gmail SMTP (587 TLS) để gửi email...");
  return {
    transporter: nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    }),
    method: "Gmail",
    isTest: false,
  };
}


  // --- Mailtrap (test) ---
  if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
    console.log("📡 Đang dùng Mailtrap (test)");
    return {
      transporter: nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS,
        },
      }),
      method: "Mailtrap",
      isTest: true,
    };
  }

  // --- SendGrid ---
  if (process.env.SENDGRID_API_KEY) {
    console.log("📡 Đang dùng SendGrid");
    return {
      transporter: nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY,
        },
      }),
      method: "SendGrid",
      isTest: false,
    };
  }

  // --- Ethereal (fallback test) ---
  console.log("📡 Dùng Ethereal (test mode)");
  const testAccount = await nodemailer.createTestAccount();

  return {
    transporter: nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    }),
    method: "Ethereal",
    isTest: true,
  };
};

/* =================================================
   2. TEMPLATE EMAIL CHÀO MỪNG
================================================= */
const getWelcomeEmailHTML = (userName) => `
  <div style="font-family: Arial; line-height:1.6; color:#333">
    <h2>🌸 Xin chào ${userName}!</h2>
    <p>Cảm ơn bạn đã đăng ký tại <b>DDT Flower Shop</b>.</p>
    <p>Chúc bạn một ngày thật tuyệt vời!</p>
    <hr />
    <p style="font-size:12px;color:#888">
      🌸 DDT Flower Shop – Hoa tươi trao gửi yêu thương
    </p>
  </div>
`;

/* =================================================
   3. GỬI EMAIL CHÀO MỪNG
================================================= */
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const { transporter, method } = await getTransporter();

    const info = await transporter.sendMail({
      from: `"DDT Flower Shop" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "🌸 Chào mừng bạn đến với DDT Flower Shop!",
      html: getWelcomeEmailHTML(userName),
    });

    console.log(`✅ Email chào mừng gửi thành công (${method})`);
    return { success: true, info };
  } catch (error) {
    console.error("❌ Lỗi gửi email chào mừng:", error);
    return { success: false, error: error.message };
  }
};

/* =================================================
   4. GỬI EMAIL MARKETING / TÙY CHỈNH (CHUẨN)
================================================= */
const sendCustomEmail = async (email, name, subject, htmlContent) => {
  try {
    if (!htmlContent || !htmlContent.trim()) {
      throw new Error("Email content is empty");
    }

    const { transporter } = await getTransporter();

   const finalHTML = `
  <div style="font-family: Arial; line-height:1.6; color:#333">
    ${htmlContent}
    <hr />
    <p style="font-size:12px;color:#888">
      🌸 DDT Flower Shop – Hoa tươi trao gửi yêu thương
    </p>
  </div>
`;


    const info = await transporter.sendMail({
      from: `"DDT Flower Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: finalHTML, // ⭐ BODY EMAIL Ở ĐÂY
    });

    console.log("✅ Email sent:", info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error("❌ Send custom email error:", error.message);
    return { success: false, error: error.message };
  }
};


module.exports = {
  sendWelcomeEmail,
  sendCustomEmail,
};
