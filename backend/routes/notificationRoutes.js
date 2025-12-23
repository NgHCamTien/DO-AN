const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { protect, admin } = require("../middleware/authMiddleware");

// 👇 THÊM DÒNG NÀY
const { deleteNotification } = require("../controllers/notificationController");

// 📌 Lấy tất cả thông báo (Admin)
router.get("/", protect, admin, async (req, res) => {
  try {
    const list = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 📌 Đánh dấu đã đọc 1 thông báo
router.put("/:id/read", protect, admin, async (req, res) => {
  try {
    const noti = await Notification.findById(req.params.id);
    if (!noti)
      return res.status(404).json({ success: false, message: "Không tìm thấy thông báo" });

    noti.read = true;
    await noti.save();

    res.json({ success: true, message: "Đã đánh dấu là đã đọc" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 📌 Đánh dấu tất cả thông báo là đã đọc
router.put("/mark-all", protect, admin, async (req, res) => {
  try {
    await Notification.updateMany({}, { read: true });
    res.json({ success: true, message: "Đã đánh dấu tất cả là đã đọc" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 📌 Xóa thông báo
router.delete("/:id", protect, admin, deleteNotification);

module.exports = router;
