const Notification = require("../models/Notification");

// 📌 Lấy tất cả thông báo
exports.getNotifications = async (req, res) => {
  try {
    const list = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📌 Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const noti = await Notification.findById(req.params.id);
    if (!noti) return res.status(404).json({ message: "Không tìm thấy thông báo" });

    noti.isRead = true;
    await noti.save();

    res.json({ success: true, message: "Đã đánh dấu đã đọc", data: noti });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📌 Xóa thông báo
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Không tìm thấy thông báo" });
    }

    res.json({ success: true, message: "Đã xóa thông báo" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

