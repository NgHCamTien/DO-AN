const User = require("../models/User");
const Order = require("../models/Order");
const Newsletter = require("../models/Newsletter");
const EmailLog = require("../models/EmailLog");
const { sendCustomEmail } = require("../services/emailService");

exports.sendMarketingEmail = async (req, res) => {
  try {
    const { subject, group = "all", template, html, templateName = "custom" } = req.body;

    if (!subject || (!template && !html)) {
      return res.status(400).json({
        success: false,
        message: "Thiếu subject hoặc nội dung email!",
      });
    }

    let emailList = [];

    // =====================================
    // 1️⃣ USERS (user, admin, vip, all)
    // =====================================
    if (group === "all" || group === "user" || group === "admin" || group === "vip") {
      let filter = {};

      if (group === "user") filter = { role: "user" };
      if (group === "admin") filter = { role: "admin" };

      const users = await User.find(filter).select("email name");
      emailList.push(...users.map((u) => ({ email: u.email, name: u.name })));
    }

    // =====================================
    // 2️⃣ NEWSLETTER (người đăng ký)
    // =====================================
    if (group === "all" || group === "newsletter") {
      const subs = await Newsletter.find({}).select("email");
      emailList.push(
        ...subs.map((s) => ({
          email: s.email,
          name: "Khách hàng"
        }))
      );
    }

    // =====================================
    // 3️⃣ VIP (tự động tổng chi ≥ 3.000.000)
    // =====================================
    if (group === "vip") {
      const orders = await Order.aggregate([
        {
          $group: {
            _id: "$user",
            totalSpent: { $sum: "$totalPrice" }
          }
        },
        { $match: { totalSpent: { $gte: 3000000 } } }
      ]);

      const vipIds = orders.map((o) => o._id.toString());
      const vipUsers = await User.find({ _id: { $in: vipIds } })
        .select("email name");

      emailList = vipUsers.map((u) => ({
        email: u.email,
        name: u.name
      }));
    }

    // =====================================
    // 4️⃣ LOẠI TRÙNG EMAIL
    // =====================================
    const unique = new Map();
    emailList.forEach((i) => i.email && unique.set(i.email, i));
    const finalRecipients = Array.from(unique.values());

    if (finalRecipients.length === 0) {
      return res.json({
        success: false,
        message: "Không có email người nhận!"
      });
    }

    // =====================================
    // 5️⃣ GỬI EMAIL
    // =====================================
    let success = 0;
    let failed = 0;

    for (const user of finalRecipients) {
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

    // =====================================
    // 6️⃣ LƯU LOG
    // =====================================
    await EmailLog.create({
      subject,
      templateName,
      html: template || html,
      toGroup: group,
      totalRecipients: finalRecipients.length,
      successCount: success,
      failedCount: failed,
      status: failed > 0 ? "partial" : "success",
      sentBy: req.user._id
    });

    return res.json({
      success: true,
      message: `📩 Email đã gửi xong: ✔ ${success} | ❌ ${failed}`
    });

  } catch (err) {
    console.error("❌ Email send error:", err);

    await EmailLog.create({
      subject: req.body.subject,
      html: req.body.html,
      toGroup: req.body.group,
      status: "failed",
      errorMessage: err.message,
      sentBy: req.user?._id
    });

    return res.status(500).json({
      success: false,
      message: "Lỗi server khi gửi email!"
    });
  }
};
