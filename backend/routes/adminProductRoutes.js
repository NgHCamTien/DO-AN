const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// ====================== MULTER CONFIG ======================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // giới hạn 5MB mỗi ảnh
});

// ====================== ROUTES ======================

// Lấy tất cả sản phẩm (Admin)
router.get('/', protect, admin, getAllProducts);

// Xem chi tiết sản phẩm
router.get('/:id', protect, admin, getProductById);

// 🆕 Thêm mới sản phẩm (cho phép upload nhiều ảnh)
router.post('/', protect, admin, upload.array('images', 5), async (req, res, next) => {
  try {
    // Nếu có ảnh, lưu đường dẫn vào req.body.images
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => `/uploads/${file.filename}`);
    }
    await createProduct(req, res);
  } catch (err) {
    next(err);
  }
});

// 🆙 Cập nhật sản phẩm (có thể upload ảnh mới)
router.put('/:id', protect, admin, upload.array('images', 5), async (req, res, next) => {
  try {
    if (req.files && req.files.length > 0) {
      req.body.images = req.files.map(file => `/uploads/${file.filename}`);
    }
    await updateProduct(req, res);
  } catch (err) {
    next(err);
  }
});

// 🗑️ Xóa sản phẩm
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
