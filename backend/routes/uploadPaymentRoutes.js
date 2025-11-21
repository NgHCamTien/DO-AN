const express = require('express');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ========== MULTER SETUP ==========
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/payments/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`
    );
  }
});

const upload = multer({ storage });

// ========== ROUTE UPLOAD ==========
router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file upload' });
  }

  const imageUrl = `/uploads/payments/${req.file.filename}`;

  res.json({
    success: true,
    message: 'Upload thành công',
    imageUrl
  });
});

module.exports = router;
