const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

/* ============================================================
   📦 GET ALL PRODUCTS (PUBLIC + ADMIN)
============================================================ */
const getProducts = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    let categoryFilter = {};
    if (req.query.category) {
      const categoryObj = await Category.findOne({ slug: req.query.category });
      if (categoryObj) categoryFilter = { category: categoryObj._id };
    }

    const filter = { ...keyword, ...categoryFilter };
    const count = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
      page,
      pages: Math.ceil(count / pageSize),
      count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   🔍 GET PRODUCT BY ID (DETAIL PAGE)
============================================================ */
const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
    }

    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');

    if (!product)
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    res.json({ success: true, product }); // CHUẨN HÓA: data → product
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   🌟 GET FEATURED PRODUCTS
============================================================ */
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;

    const products = await Product.find({ isFeatured: true })
      .populate('category', 'name slug')
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   🔗 GET RELATED PRODUCTS
============================================================ */
const getRelatedProducts = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
      .populate('category', 'name slug')
      .limit(4);

    res.json({ success: true, products: relatedProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   ➕ CREATE PRODUCT
============================================================ */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      categoryId,
      isFeatured,
      season,
      stock,
      tags,
      image,
      images,
      flowerTypes
    } = req.body;

    const category = await Category.findById(categoryId);
    if (!category)
      return res.status(400).json({ success: false, message: 'Danh mục không hợp lệ' });

    // xử lý images
    let imgs = [];
    if (Array.isArray(images)) {
      imgs = images.map(url =>
        url.startsWith('/uploads/') || url.startsWith('http')
          ? url
          : `/uploads/${url}`
      );
    } else if (image) {
      imgs = [image.startsWith('/uploads/') ? image : `/uploads/${image}`];
    }

    const product = new Product({
      name,
      description,
      price,
      discountPrice: discountPrice || null,
      images: imgs,
      category: categoryId,
      isFeatured: !!isFeatured,
      flowerTypes: Array.isArray(flowerTypes)
        ? flowerTypes
        : String(flowerTypes || '').split(',').map(f => f.trim()),
      season: season || 'Quanh năm',
      stock: Number(stock) || 0,
      tags: tags
        ? (Array.isArray(tags) ? tags : String(tags).split(',').map(t => t.trim()))
        : []
    });

    const createdProduct = await product.save();
    res.status(201).json({ success: true, product: createdProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   ✏️ UPDATE PRODUCT
============================================================ */
const updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'ID sản phẩm không hợp lệ' });
    }

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    const {
      name,
      description,
      price,
      discountPrice,
      categoryId,
      isFeatured,
      season,
      stock,
      tags,
      image,
      images,
      flowerTypes
    } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (season !== undefined) product.season = season;
    if (stock !== undefined) product.stock = Number(stock);

    if (flowerTypes !== undefined) {
      product.flowerTypes = Array.isArray(flowerTypes)
        ? flowerTypes
        : String(flowerTypes).split(',').map(f => f.trim());
    }

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category)
        return res.status(400).json({ success: false, message: 'Danh mục không hợp lệ' });

      product.category = categoryId;
    }

    if (tags !== undefined)
      product.tags = Array.isArray(tags)
        ? tags
        : String(tags).split(',').map(t => t.trim());

    // Xử lý ảnh
    if (Array.isArray(images) && images.length > 0) {
      product.images = images.map(url =>
        url.startsWith('/uploads/') || url.startsWith('http')
          ? url
          : `/uploads/${url}`
      );
    } else if (image) {
      product.images = [image.startsWith('/uploads/') ? image : `/uploads/${image}`];
    }

    const updatedProduct = await product.save();

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   ❌ DELETE PRODUCT
============================================================ */
const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: 'ID không hợp lệ' });

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa sản phẩm',
      deletedProduct: { id: product._id, name: product.name }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   📦 ADJUST STOCK
============================================================ */
const adjustStock = async (req, res) => {
  try {
    const { delta } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });

    product.stock = Math.max(0, product.stock + Number(delta || 0));
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   📤 EXPORT MODULES
============================================================ */
module.exports = {
  getAllProducts: getProducts,
  getProducts,
  getProductById,
  getFeaturedProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock
};
