const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getOrders
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

// Tạo đơn hàng mới
router.post('/', protect, createOrder);

// Lấy đơn hàng của người dùng hiện tại
router.get('/myorders', protect, getMyOrders);

// Lấy tất cả đơn hàng (Admin)
router.get('/', protect, admin, getOrders);

// Lấy chi tiết đơn hàng
router.get('/:id', protect, getOrderById);

// Cập nhật trạng thái đơn hàng đã thanh toán
router.put('/:id/pay', protect, updateOrderToPaid);

// Cập nhật trạng thái đơn hàng (Admin)
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;