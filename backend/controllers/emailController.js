const User = require("../models/User");
const EmailLog = require("../models/EmailLog");
const { sendCustomEmail } = require("../services/emailService");

exports.sendMarketingEmail = async (req, res) => {
  try {
    const { subject, template, html, group = "all", templateName = "custom" } = req.body;

    if (!subject || (!template && !html)) {
      return res.status(400).json({
        success: false,
        message: "Thiếu subject hoặc nội dung email!",
      });
    }

    // 🎯 Lọc người nhận theo nhóm
    let filter = {};

    if (group === "newsletter") filter = { subscribedToNewsletter: true };
    if (group === "admin") filter = { role: "admin" };
    if (group === "user") filter = { role: "user" };

    const users = await User.find(filter).select("email name");

    if (!users.length) {
      return res.json({
        success: false,
        message: "Không có người nhận email!",
      });
    }

    // -----------------------------
    // 📩 Gửi email
    // -----------------------------
    let success = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await sendCustomEmail(
          user.email,
          user.name,
          subject,
          template || html
        );
        success++;
      } catch (err) {
        failed++;
      }
    }

    // -----------------------------
    // 📝 Lưu log
    // -----------------------------
    await EmailLog.create({
      subject,
      templateName,
      html: template || html,
      toGroup: group,
      sentBy: req.user._id,
      totalRecipients: users.length,
      success,
      failed,
      status: failed > 0 ? "partial" : "success",
    });

    return res.json({
      success: true,
      message: `Email đã gửi xong: ✔ ${success} thành công | ❌ ${failed} lỗi`,
    });

  } catch (err) {
    console.error("❌ Email send error:", err);

    // Log hệ thống lỗi tổng
    await EmailLog.create({
      subject: req.body.subject,
      html: req.body.html,
      toGroup: req.body.group,
      status: "failed",
      errorMessage: err.message,
      sentBy: req.user?._id,
    });

    return res.status(500).json({
      success: false,
      message: "Lỗi server khi gửi email",
    });
  }
};
