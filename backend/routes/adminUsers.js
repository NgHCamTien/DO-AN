const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");

const {
  getUsers,
  updateUser,
  toggleActiveUser,
  deleteUser,
  resetPassword,
} = require("../controllers/adminUserController");

// Lấy danh sách (có search + pagination)
router.get("/", protect, admin, getUsers);

// Cập nhật thông tin
router.put("/:id", protect, admin, updateUser);

// Khoá / mở khoá tài khoản
router.patch("/:id/toggle", protect, admin, toggleActiveUser);

// Xoá người dùng
router.delete("/:id", protect, admin, deleteUser);

// Reset mật khẩu
router.post("/:id/reset-password", protect, admin, resetPassword);

module.exports = router;
