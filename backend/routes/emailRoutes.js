const express = require("express");
const router = express.Router();

const { sendMarketingEmail } = require("../controllers/emailController");
const { protect, admin } = require("../middleware/authMiddleware");
const EmailLog = require("../models/EmailLog");

// 📩 Gửi email marketing
router.post("/send", protect, admin, sendMarketingEmail);

// 📜 Lịch sử email
router.get("/history", protect, admin, async (req, res) => {
  try {
    const logs = await EmailLog.find().sort({ createdAt: -1 });
    res.json( logs );
  } catch (error) {
    console.error("Error loading email logs:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi tải lịch sử email!",
    });
  }
});

module.exports = router;
