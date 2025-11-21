// backend/routes/coupons.js
const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon
} = require('../controllers/couponController');

// 📦 Danh sách tất cả coupon
router.get('/', getCoupons);

// ➕ Tạo mới coupon
router.post('/', createCoupon);

// 🔍 Lấy coupon theo ID
router.get('/:id', getCouponById);

// ✏️ Cập nhật coupon
router.put('/:id', updateCoupon);

// 🗑️ Xóa coupon
router.delete('/:id', deleteCoupon);

module.exports = router;
