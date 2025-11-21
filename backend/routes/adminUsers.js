const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { getUsers } = require("../controllers/adminUserController");

// 🔥 GET all users
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get users failed:", error);
    res.status(500).json({ success: false, message: "Lỗi server khi lấy danh sách người dùng" });
  }
});

module.exports = router;
