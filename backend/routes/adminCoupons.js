// const express = require('express');
// const router = express.Router();
// const { protect, admin } = require('../middleware/auth');

// // Giả lập database mã giảm giá - bạn có thể tạo model Coupon sau
// const coupons = {
//   'WELCOME15': {
//     code: 'WELCOME15',
//     discount: 15, // 15%
//     type: 'percentage',
//     minOrder: 200000, // Tối thiểu 200k
//     maxDiscount: 100000, // Tối đa giảm 100k
//     description: 'Giảm 15% cho đơn hàng đầu tiên',
//     isActive: true,
//     expiryDate: '2025-12-31',
//     usageLimit: 1000,
//     usedCount: 0,
//     createdAt: new Date('2025-01-01'),
//     validForNewUsers: true // Chỉ cho user mới
//   },
//   'SUMMER20': {
//     code: 'SUMMER20',
//     discount: 20,
//     type: 'percentage',
//     minOrder: 500000,
//     maxDiscount: 200000,
//     description: 'Giảm 20% đơn hàng mùa hè',
//     isActive: true,
//     expiryDate: '2025-08-31',
//     usageLimit: 500,
//     usedCount: 23,
//     createdAt: new Date('2025-06-01'),
//     validForNewUsers: false
//   },
//   'SAVE50K': {
//     code: 'SAVE50K',
//     discount: 50000,
//     type: 'fixed',
//     minOrder: 300000,
//     maxDiscount: 50000,
//     description: 'Giảm 50k cho đơn từ 300k',
//     isActive: true,
//     expiryDate: '2025-12-31',
//     usageLimit: 200,
//     usedCount: 15,
//     createdAt: new Date('2025-05-01'),
//     validForNewUsers: false
//   },
//   'FLOWER10': {
//     code: 'FLOWER10',
//     discount: 10,
//     type: 'percentage',
//     minOrder: 150000,
//     maxDiscount: 75000,
//     description: 'Giảm 10% cho tất cả loại hoa',
//     isActive: true,
//     expiryDate: '2025-12-31',
//     usageLimit: 300,
//     usedCount: 45,
//     createdAt: new Date('2025-04-01'),
//     validForNewUsers: false
//   }
// };

// // @desc    Validate và áp dụng mã giảm giá
// // @route   POST /api/coupons/validate
// // @access  Public
// router.post('/validate', async (req, res) => {
//   try {
//     const { code, orderAmount, userId } = req.body;
    
//     console.log('Validating coupon:', { code, orderAmount, userId });
    
//     if (!code || !orderAmount) {
//       return res.status(400).json({
//         success: false,
//         message: 'Thiếu thông tin mã giảm giá hoặc số tiền đơn hàng'
//       });
//     }
    
//     const coupon = coupons[code.toUpperCase()];
    
//     if (!coupon) {
//       return res.status(404).json({
//         success: false,
//         message: 'Mã giảm giá không tồn tại'
//       });
//     }
    
//     // Kiểm tra mã có còn hiệu lực
//     if (!coupon.isActive) {
//       return res.status(400).json({
//         success: false,
//         message: 'Mã giảm giá đã bị vô hiệu hóa'
//       });
//     }
    
//     // Kiểm tra ngày hết hạn
//     if (new Date() > new Date(coupon.expiryDate)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Mã giảm giá đã hết hạn'
//       });
//     }
    
//     // Kiểm tra số lần sử dụng
//     if (coupon.usedCount >= coupon.usageLimit) {
//       return res.status(400).json({
//         success: false,
//         message: 'Mã giảm giá đã hết lượt sử dụng'
//       });
//     }
    
//     // Kiểm tra đơn hàng tối thiểu
//     if (orderAmount < coupon.minOrder) {
//       return res.status(400).json({
//         success: false,
//         message: `Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString('vi-VN')}₫ để áp dụng mã này`
//       });
//     }
    
//     // TODO: Kiểm tra user đã sử dụng mã này chưa (cần database)
//     // if (coupon.validForNewUsers && userId) {
//     //   const hasUsedCoupon = await checkUserUsedCoupon(userId, code);
//     //   if (hasUsedCoupon) {
//     //     return res.status(400).json({
//     //       success: false,
//     //       message: 'Bạn đã sử dụng mã giảm giá này rồi'
//     //     });
//     //   }
//     // }
    
//     // Tính số tiền giảm
//     let discountAmount = 0;
//     if (coupon.type === 'percentage') {
//       discountAmount = Math.floor((orderAmount * coupon.discount) / 100);
//       // Giới hạn số tiền giảm tối đa
//       if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
//         discountAmount = coupon.maxDiscount;
//       }
//     } else if (coupon.type === 'fixed') {
//       discountAmount = coupon.discount;
//     }
    
//     // Không giảm quá tổng tiền đơn hàng
//     discountAmount = Math.min(discountAmount, orderAmount);
    
//     console.log('Coupon validation successful:', { code, discountAmount });
    
//     res.json({
//       success: true,
//       message: 'Mã giảm giá hợp lệ',
//       coupon: {
//         code: coupon.code,
//         description: coupon.description,
//         discount: coupon.discount,
//         type: coupon.type,
//         discountAmount,
//         maxDiscount: coupon.maxDiscount,
//         minOrder: coupon.minOrder
//       }
//     });
    
//   } catch (error) {
//     console.error('Error validating coupon:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi kiểm tra mã giảm giá',
//       error: error.message
//     });
//   }
// });

// // @desc    Lấy danh sách mã giảm giá khả dụng
// // @route   GET /api/coupons/available
// // @access  Public
// router.get('/available', async (req, res) => {
//   try {
//     const { orderAmount } = req.query;
//     const currentDate = new Date();
    
//     const availableCoupons = Object.values(coupons)
//       .filter(coupon => {
//         // Kiểm tra điều kiện cơ bản
//         const isActive = coupon.isActive;
//         const notExpired = currentDate <= new Date(coupon.expiryDate);
//         const hasUsageLeft = coupon.usedCount < coupon.usageLimit;
        
//         // Kiểm tra đơn hàng tối thiểu (nếu có)
//         const meetsMinOrder = !orderAmount || parseInt(orderAmount) >= coupon.minOrder;
        
//         return isActive && notExpired && hasUsageLeft && meetsMinOrder;
//       })
//       .map(coupon => ({
//         code: coupon.code,
//         description: coupon.description,
//         discount: coupon.discount,
//         type: coupon.type,
//         minOrder: coupon.minOrder,
//         maxDiscount: coupon.maxDiscount,
//         expiryDate: coupon.expiryDate,
//         usageLeft: coupon.usageLimit - coupon.usedCount
//       }))
//       .sort((a, b) => {
//         // Sắp xếp theo giá trị giảm giá (cao nhất trước)
//         if (a.type === 'percentage' && b.type === 'percentage') {
//           return b.discount - a.discount;
//         } else if (a.type === 'fixed' && b.type === 'fixed') {
//           return b.discount - a.discount;
//         } else {
//           return a.type === 'percentage' ? -1 : 1;
//         }
//       });
    
//     res.json({
//       success: true,
//       data: {
//         coupons: availableCoupons,
//         total: availableCoupons.length
//       }
//     });
    
//   } catch (error) {
//     console.error('Error getting available coupons:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi lấy danh sách mã giảm giá'
//     });
//   }
// });

// // @desc    Áp dụng mã giảm giá (ghi nhận sử dụng)
// // @route   POST /api/coupons/apply
// // @access  Public/Protected
// router.post('/apply', async (req, res) => {
//   try {
//     const { code, userId, orderId } = req.body;
    
//     console.log('Applying coupon:', { code, userId, orderId });
    
//     const coupon = coupons[code.toUpperCase()];
    
//     if (!coupon) {
//       return res.status(404).json({
//         success: false,
//         message: 'Mã giảm giá không tồn tại'
//       });
//     }
    
//     // Tăng số lần sử dụng
//     coupon.usedCount += 1;
    
//     // TODO: Lưu vào database
//     // await saveCouponUsage({ code, userId, orderId, usedAt: new Date() });
    
//     console.log(`Coupon ${code} used successfully. Usage count: ${coupon.usedCount}/${coupon.usageLimit}`);
    
//     res.json({
//       success: true,
//       message: 'Mã giảm giá đã được áp dụng thành công',
//       data: {
//         code: coupon.code,
//         usedCount: coupon.usedCount,
//         usageLimit: coupon.usageLimit
//       }
//     });
    
//   } catch (error) {
//     console.error('Error applying coupon:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi áp dụng mã giảm giá'
//     });
//   }
// });

// // @desc    Lấy thống kê mã giảm giá (Admin)
// // @route   GET /api/coupons/stats
// // @access  Private/Admin
// router.get('/stats', protect, admin, async (req, res) => {
//   try {
//     const stats = {
//       totalCoupons: Object.keys(coupons).length,
//       activeCoupons: Object.values(coupons).filter(c => c.isActive).length,
//       expiredCoupons: Object.values(coupons).filter(c => new Date() > new Date(c.expiryDate)).length,
//       totalUsage: Object.values(coupons).reduce((sum, c) => sum + c.usedCount, 0),
//       coupons: Object.values(coupons).map(coupon => ({
//         code: coupon.code,
//         description: coupon.description,
//         type: coupon.type,
//         discount: coupon.discount,
//         usedCount: coupon.usedCount,
//         usageLimit: coupon.usageLimit,
//         usageRate: ((coupon.usedCount / coupon.usageLimit) * 100).toFixed(1),
//         isActive: coupon.isActive,
//         expiryDate: coupon.expiryDate,
//         daysLeft: Math.ceil((new Date(coupon.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
//       }))
//     };
    
//     res.json({
//       success: true,
//       data: stats
//     });
    
//   } catch (error) {
//     console.error('Error getting coupon stats:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi lấy thống kê mã giảm giá'
//     });
//   }
// });

// // @desc    Tạo mã giảm giá mới (Admin)
// // @route   POST /api/coupons
// // @access  Private/Admin
// router.post('/', protect, admin, async (req, res) => {
//   try {
//     const {
//       code,
//       discount,
//       type,
//       minOrder,
//       maxDiscount,
//       description,
//       expiryDate,
//       usageLimit
//     } = req.body;
    
//     // Validation
//     if (!code || !discount || !type || !description) {
//       return res.status(400).json({
//         success: false,
//         message: 'Thiếu thông tin bắt buộc'
//       });
//     }
    
//     const upperCode = code.toUpperCase();
    
//     if (coupons[upperCode]) {
//       return res.status(400).json({
//         success: false,
//         message: 'Mã giảm giá đã tồn tại'
//       });
//     }
    
//     // Tạo mã giảm giá mới
//     const newCoupon = {
//       code: upperCode,
//       discount: parseInt(discount),
//       type,
//       minOrder: parseInt(minOrder) || 0,
//       maxDiscount: type === 'percentage' ? parseInt(maxDiscount) : parseInt(discount),
//       description,
//       isActive: true,
//       expiryDate: expiryDate || '2025-12-31',
//       usageLimit: parseInt(usageLimit) || 100,
//       usedCount: 0,
//       createdAt: new Date(),
//       validForNewUsers: false
//     };
    
//     // Lưu vào "database"
//     coupons[upperCode] = newCoupon;
    
//     console.log(`Created new coupon: ${upperCode}`);
    
//     res.status(201).json({
//       success: true,
//       message: 'Tạo mã giảm giá thành công',
//       data: newCoupon
//     });
    
//   } catch (error) {
//     console.error('Error creating coupon:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi tạo mã giảm giá'
//     });
//   }
// });

// // @desc    Cập nhật mã giảm giá (Admin)
// // @route   PUT /api/coupons/:code
// // @access  Private/Admin
// router.put('/:code', protect, admin, async (req, res) => {
//   try {
//     const { code } = req.params;
//     const updates = req.body;
    
//     const upperCode = code.toUpperCase();
//     const coupon = coupons[upperCode];
    
//     if (!coupon) {
//       return res.status(404).json({
//         success: false,
//         message: 'Mã giảm giá không tồn tại'
//       });
//     }
    
//     // Cập nhật các trường được phép
//     const allowedUpdates = ['description', 'isActive', 'expiryDate', 'usageLimit', 'minOrder', 'maxDiscount'];
//     allowedUpdates.forEach(field => {
//       if (updates[field] !== undefined) {
//         coupon[field] = updates[field];
//       }
//     });
    
//     coupon.updatedAt = new Date();
    
//     console.log(`Updated coupon: ${upperCode}`);
    
//     res.json({
//       success: true,
//       message: 'Cập nhật mã giảm giá thành công',
//       data: coupon
//     });
    
//   } catch (error) {
//     console.error('Error updating coupon:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi cập nhật mã giảm giá'
//     });
//   }
// });

// // @desc    Xóa mã giảm giá (Admin)
// // @route   DELETE /api/coupons/:code
// // @access  Private/Admin
// router.delete('/:code', protect, admin, async (req, res) => {
//   try {
//     const { code } = req.params;
//     const upperCode = code.toUpperCase();
    
//     if (!coupons[upperCode]) {
//       return res.status(404).json({
//         success: false,
//         message: 'Mã giảm giá không tồn tại'
//       });
//     }
    
//     delete coupons[upperCode];
    
//     console.log(`Deleted coupon: ${upperCode}`);
    
//     res.json({
//       success: true,
//       message: 'Xóa mã giảm giá thành công'
//     });
    
//   } catch (error) {
//     console.error('Error deleting coupon:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server khi xóa mã giảm giá'
//     });
//   }
// });

// module.exports = router;
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
