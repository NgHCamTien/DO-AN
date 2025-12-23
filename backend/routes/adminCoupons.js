const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Coupon = require('../models/Coupon');

// Lấy tất cả mã giảm giá
router.get('/', protect, admin, async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Thêm mới
router.post('/', protect, admin, async (req, res) => {
  try {
    const { code, discount, expiresAt } = req.body;
    const newCoupon = new Coupon({ code, discount, expiresAt });
    await newCoupon.save();
    res.json({ success: true, message: 'Đã thêm mã giảm giá', coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xóa
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Đã xóa mã giảm giá' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
