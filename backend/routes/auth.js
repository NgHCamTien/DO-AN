const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

// Đăng ký tài khoản mới
router.post('/register', register);

// Đăng nhập
router.post('/login', login);

// Lấy và cập nhật thông tin người dùng (cần token)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Thêm route để kiểm tra token
router.get('/verify-token', protect, (req, res) => {
  res.json({
    message: 'Token hợp lệ',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Thêm route admin
router.get('/admin', protect, admin, (req, res) => {
  res.json({
    message: 'Bạn là admin',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;