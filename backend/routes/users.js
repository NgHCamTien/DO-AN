const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

// GET all users
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("User list error:", error);
    res.status(500).json({ success: false, message: "Lỗi lấy danh sách người dùng" });
  }
});

module.exports = router;
