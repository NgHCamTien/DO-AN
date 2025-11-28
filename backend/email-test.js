const nodemailer = require("nodemailer");

async function main() {
  try {
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "baa84b0f4debbf",
        pass: "7ee84a54ddae2c",
      },
    });

    const info = await transporter.sendMail({
      from: '"DTP Flower Shop" <test@dtpflowershop.com>',
      to: "test@example.com",
      subject: "📩 Test mail từ Mailtrap",
      html: "<h1>Xin chào Tiên!</h1><p>Test thành công 🎉</p>",
    });

    console.log("✅ Email đã gửi!", info.messageId);
  } catch (err) {
    console.error("❌ Lỗi gửi email:", err);
  }
}

main();
