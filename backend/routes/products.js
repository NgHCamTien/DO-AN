const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock
} = require('../controllers/productController');

const { protect, admin } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const Category = require('../models/Category');

/* ============================================================
   📸 MULTER UPLOAD CONFIG
============================================================ */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const checkFileType = (file, cb) => {
  const allowed = /jpg|jpeg|png|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (extname && mimetype) return cb(null, true);
  cb('❌ Chỉ chấp nhận ảnh JPG, JPEG, PNG, WEBP!');
};

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  }
});

/* ============================================================
   🔍 SEARCH SUGGESTIONS
============================================================ */
router.get('/search-suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2)
      return res.json({ suggestions: [] });

    const products = await Product.find({
      name: { $regex: q.trim(), $options: 'i' }
    })
      .select('name')
      .limit(8);

    const suggestions = products.map(p => p.name);

    res.json({ suggestions });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ============================================================
   🔎 ADVANCED SEARCH
============================================================ */
router.get('/search', async (req, res) => {
  try {
    const {
      keyword = '',
      category = '',
      page = 1,
      limit = 12,
      sort = 'createdAt',
      order = 'desc',
      minPrice,
      maxPrice
    } = req.query;

    let query = {};

    if (keyword.trim()) {
      query.$or = [
        { name: { $regex: keyword.trim(), $options: 'i' } },
        { description: { $regex: keyword.trim(), $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOptions = { [sort]: order === 'asc' ? 1 : -1 };

    const pageSize = Number(limit);
    const skip = (Number(page) - 1) * pageSize;

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      page: Number(page),
      pages: Math.ceil(total / pageSize),
      total
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ============================================================
   🌸 PRODUCT ROUTES (CHUẨN THỨ TỰ)
============================================================ */

// 1. ROUTE CHỮ
router.get('/featured', getFeaturedProducts);

// 2. ROUTE LIÊN QUAN
router.get('/:id/related', getRelatedProducts);

// 3. ROUTE DETAIL
router.get('/:id', getProductById);

// 4. ROUTE ALL — LUÔN CUỐI CÙNG
router.get('/', getProducts);

/* ============================================================
   🔐 ADMIN ROUTES
============================================================ */
router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.patch('/:id/stock', protect, admin, adjustStock);

/* ============================================================
   🔧 TEST ROUTE
============================================================ */
router.get('/test/auth', protect, admin, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
