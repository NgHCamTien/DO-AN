// backend/routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Cấu hình nơi lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname))
});

// Giới hạn dung lượng 2MB và chỉ chấp nhận các loại ảnh
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error('Chỉ cho phép file ảnh định dạng JPG, PNG, WEBP (≤ 2MB)'));
  }
});

// ✅ Upload nhiều ảnh (tối đa 5)
router.post('/', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ success: false, message: 'Không có file nào được tải lên' });

    const urls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ success: true, urls });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Lỗi upload file' });
  }
});

module.exports = router;
