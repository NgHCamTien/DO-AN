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
  deleteProduct
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');

// Import models cho search functionality
const Product = require('../models/Product');
const Category = require('../models/Category');

// Cấu hình multer để upload hình ảnh
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Chỉ chấp nhận hình ảnh!');
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

// ===== DEBUG MIDDLEWARE =====
router.use((req, res, next) => {
  console.log(`=== PRODUCTS ROUTE DEBUG ===`);
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.path}`);
  console.log(`Full URL: ${req.originalUrl}`);
  console.log(`Headers:`, req.headers.authorization ? 'Auth header present' : 'No auth header');
  next();
});

// ===== ROUTES TÌM KIẾM MỚI =====

// @desc    Lấy gợi ý tìm kiếm
// @route   GET /api/products/search-suggestions
// @access  Public
router.get('/search-suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const searchTerm = q.trim();
    
    // Tìm kiếm trong tên sản phẩm
    const products = await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .select('name')
    .limit(8)
    .lean();
    
    // Tạo danh sách gợi ý unique từ tên sản phẩm
    let suggestions = [...new Set(products.map(p => p.name))];
    
    // Thêm một số từ khóa phổ biến nếu không có đủ suggestions
    const popularKeywords = [
      'hoa hồng', 'hoa hướng dương', 'hoa cúc', 'hoa lan', 
      'hoa sinh nhật', 'hoa cưới', 'hoa valentine', 'hoa 20/10',
      'hoa chúc mừng', 'hoa khai trương', 'hoa chia buồn', 'hoa tình yêu'
    ];
    
    // Lọc các từ khóa phổ biến phù hợp
    const matchingKeywords = popularKeywords.filter(keyword => 
      keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Kết hợp suggestions và popular keywords, giới hạn 10 kết quả
    suggestions = [...suggestions, ...matchingKeywords]
      .slice(0, 10)
      .filter((item, index, arr) => arr.indexOf(item) === index); // Remove duplicates
    
    res.json({ suggestions });
    
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi lấy gợi ý tìm kiếm',
      error: error.message 
    });
  }
});

// @desc    Tìm kiếm sản phẩm nâng cao
// @route   GET /api/products/search
// @access  Public
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

    console.log('Search params:', { keyword, category, page, limit });

    // Tạo query object
    let query = {};

    // Tìm kiếm theo từ khóa (tên sản phẩm và mô tả)
    if (keyword && keyword.trim()) {
      query.$or = [
        { name: { $regex: keyword.trim(), $options: 'i' } },
        { description: { $regex: keyword.trim(), $options: 'i' } }
      ];
    }

    // Lọc theo danh mục
    if (category && category !== 'all') {
      try {
        // Tìm category by slug
        const categoryDoc = await Category.findOne({ slug: category });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          console.log(`Category with slug "${category}" not found`);
        }
      } catch (catError) {
        console.error('Error finding category:', catError);
      }
    }

    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      query.$and = query.$and || [];
      
      if (minPrice) {
        query.$and.push({
          $or: [
            { discountPrice: { $gte: parseInt(minPrice) } },
            { $and: [{ discountPrice: { $exists: false } }, { price: { $gte: parseInt(minPrice) } }] }
          ]
        });
      }
      
      if (maxPrice) {
        query.$and.push({
          $or: [
            { discountPrice: { $lte: parseInt(maxPrice) } },
            { $and: [{ discountPrice: { $exists: false } }, { price: { $lte: parseInt(maxPrice) } }] }
          ]
        });
      }
    }

    console.log('Final search query:', JSON.stringify(query, null, 2));

    // Sắp xếp
    let sortOptions = {};
    switch (sort) {
      case 'price':
        sortOptions = { price: order === 'asc' ? 1 : -1 };
        break;
      case 'name':
        sortOptions = { name: order === 'asc' ? 1 : -1 };
        break;
      case 'createdAt':
      default:
        sortOptions = { createdAt: order === 'asc' ? 1 : -1 };
        break;
    }

    // Phân trang
    const pageSize = parseInt(limit);
    const currentPage = parseInt(page);
    const skip = (currentPage - 1) * pageSize;

    // Thực hiện query
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .limit(pageSize)
      .skip(skip)
      .lean();

    // Đếm tổng số sản phẩm
    const total = await Product.countDocuments(query);
    const pages = Math.ceil(total / pageSize);

    console.log(`Found ${total} products, page ${currentPage}/${pages}`);

    res.json({
      products,
      page: currentPage,
      pages,
      total,
      hasNextPage: currentPage < pages,
      hasPrevPage: currentPage > 1
    });

  } catch (error) {
    console.error('Error in product search:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi tìm kiếm sản phẩm',
      error: error.message 
    });
  }
});

// ===== ROUTES GỐC (GIỮ NGUYÊN) =====

// Lấy danh sách sản phẩm (cập nhật để hỗ trợ search)
router.get('/', async (req, res) => {
  try {
    const { keyword, category } = req.query;
    
    // Nếu có keyword hoặc category, chuyển sang search route
    if (keyword || (category && category !== 'all')) {
      // Redirect đến search route với params
      const searchParams = new URLSearchParams(req.query);
      return res.redirect(301, `/api/products/search?${searchParams.toString()}`);
    }
    
    // Nếu không có search params, dùng controller gốc
    return getProducts(req, res);
  } catch (error) {
    console.error('Error in products route:', error);
    res.status(500).json({ 
      message: 'Lỗi server',
      error: error.message 
    });
  }
});

// Lấy sản phẩm nổi bật
router.get('/featured', getFeaturedProducts);

// Lấy sản phẩm liên quan
router.get('/:id/related', getRelatedProducts);

// Lấy chi tiết sản phẩm
router.get('/:id', getProductById);

// ===== ADMIN ROUTES =====

// Tạo sản phẩm mới
router.post('/', protect, admin, upload.array('images', 5), createProduct);

// Cập nhật sản phẩm
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);

// XÓA SẢN PHẨM - ROUTE QUAN TRỌNG
router.delete('/:id', protect, admin, (req, res, next) => {
  console.log('=== DELETE ROUTE HIT ===');
  console.log('Product ID:', req.params.id);
  console.log('User:', req.user?.email);
  console.log('User Role:', req.user?.role);
  next();
}, deleteProduct);

// ===== DEBUG ROUTES =====

// Route test để kiểm tra middleware
router.get('/test/auth', protect, admin, (req, res) => {
  res.json({
    message: 'Authentication working',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    },
    timestamp: new Date().toISOString()
  });
});

// Route test DELETE (để debug)
router.get('/test/delete/:id', protect, admin, (req, res) => {
  res.json({
    message: 'DELETE route accessible',
    productId: req.params.id,
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;