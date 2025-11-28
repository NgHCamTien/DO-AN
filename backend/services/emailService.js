const nodemailer = require("nodemailer");

// =========================
// 1. CHỌN TRANSPORT TỰ ĐỘNG
// =========================

const getTransporter = async () => {

  // Ưu tiên 1: GMAIL SMTP (Gửi email thật)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log("🔗 Email: dùng Gmail SMTP");
    return {
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }),
      method: "Gmail",
      isTest: false,
    };
  }

  // Ưu tiên 2: Mailtrap (dev / test)
  if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
    console.log("🔗 Email: dùng Mailtrap (test)");
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

  // Ưu tiên 3: SendGrid (gửi email thật)
  if (process.env.SENDGRID_API_KEY) {
    console.log("🔗 Email: dùng SendGrid");
    return {
      transporter: nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 587,
        secure: false,
        auth: {
          user: "apikey",
          pass: process.env.SENDGRID_API_KEY,
        },
      }),
      method: "SendGrid",
      isTest: false,
    };
  }

  // Ưu tiên 4: Ethereal (test)
  console.log("🔗 Email: dùng Ethereal (test)");
  const testAccount = await nodemailer.createTestAccount();

  return {
    transporter: nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    }),
    method: "Ethereal",
    isTest: true,
  };
};

// =========================
// 2. TEMPLATE EMAIL CHÀO MỪNG
// =========================

const getWelcomeEmailHTML = (userName, userEmail) => {
  return `
    <h1>Xin chào ${userName}!</h1>
    <p>Chào mừng bạn đến với DTP Flower Shop</p>
  `;
};

// =========================
// 3. HÀM GỬI EMAIL CHÀO MỪNG
// =========================

const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    console.log(`📧 Gửi email chào mừng tới ${userEmail}`);

    const { transporter, method } = await getTransporter();

    const info = await transporter.sendMail({
      from: `"DTP Flower Shop" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "🌸 Chào mừng bạn đến với DTP Flower Shop!",
      html: getWelcomeEmailHTML(userName, userEmail),
    });

    console.log(`✅ Gửi email thành công qua ${method}`, info.messageId);

    return { success: true };
  } catch (error) {
    console.error("❌ Lỗi gửi email:", error.message);
    return { success: false, error: error.message };
  }
};

const sendCustomEmail = async (email, name, subject, htmlTemplate) => {
  try {
    const { transporter } = await getTransporter();

    const info = await transporter.sendMail({
      from: `"DTP Flower Shop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: htmlTemplate,
    });

    return { success: true, info };
  } catch (error) {
    console.error("❌ Lỗi gửi email custom:", error.message);
    return { success: false };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendCustomEmail,
};
