const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// ============================================================
// 📌 GET /api/products — FILTER + PAGINATION
// ============================================================
exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      price,
      flower,
      occasion,
      page = 1
    } = req.query;

    const pageSize = 12;
    const filter = {};

    // 🔍 SEARCH BY NAME
    if (search && search.trim() !== "") {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    // 🏷 FILTER BY CATEGORY SLUG
    if (category && category !== "all" && category !== "") {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }

    // 💰 PRICE FILTER
    if (price === "under-200") filter.price = { $lte: 200000 };
    if (price === "200-400") filter.price = { $gte: 200000, $lte: 400000 };
    if (price === "above-400") filter.price = { $gte: 400000 };

    // 🌸 FLOWER TYPE FILTER
    if (flower) {
      filter.flowerTypes = { $in: [flower] };
    }

    // 🎁 OCCASION FILTER
    if (occasion) {
      filter.occasion = occasion;
    }

    // 📦 COUNT TOTAL
    const total = await Product.countDocuments(filter);

    // 📦 GET PRODUCTS
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    return res.json({
      success: true,
      products,
      total,
      page,
      pages: Math.ceil(total / pageSize),
    });

  } catch (err) {
    console.error("❌ Error in getProducts:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err });
  }
};


// ============================================================
// 🔍 GET PRODUCT BY ID
// ============================================================
exports.getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "ID sản phẩm không hợp lệ" });

    const product = await Product.findById(req.params.id)
      .populate("category", "name slug");

    if (!product)
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ============================================================
// 🌟 FEATURED PRODUCTS
// ============================================================
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;

    const products = await Product.find({ isFeatured: true })
      .populate("category", "name slug")
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ============================================================
// 🔗 RELATED PRODUCTS
// ============================================================
exports.getRelatedProducts = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "ID sản phẩm không hợp lệ" });

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true,
    })
      .limit(4)
      .populate("category", "name slug");

    res.json({ success: true, products: relatedProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ============================================================
// ➕ CREATE PRODUCT
// ============================================================
exports.createProduct = async (req, res) => {
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
      return res.status(400).json({ success: false, message: "Danh mục không hợp lệ" });

    let imgs = [];
    if (Array.isArray(images)) {
      imgs = images.map(url =>
        url.startsWith("/uploads/") ? url : `/uploads/${url}`
      );
    } else if (image) {
      imgs = [image.startsWith("/uploads/") ? image : `/uploads/${image}`];
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
        : String(flowerTypes || "").split(",").map(f => f.trim()),
      season: season || "Quanh năm",
      stock: Number(stock) || 0,
      tags: tags
        ? (Array.isArray(tags) ? tags : String(tags).split(",").map(t => t.trim()))
        : [],
    });

    const created = await product.save();
    res.status(201).json({ success: true, product: created });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ============================================================
// ✏️ UPDATE PRODUCT
// ============================================================
exports.updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    const body = req.body;

    Object.assign(product, body);

    await product.save();
    res.json({ success: true, product });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ============================================================
// 🗑 DELETE
// ============================================================
exports.deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ success: false, message: "ID không hợp lệ" });

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    await product.deleteOne();

    res.json({ success: true, message: "Đã xóa sản phẩm" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ============================================================
// 📦 ADJUST STOCK
// ============================================================
exports.adjustStock = async (req, res) => {
  try {
    const { delta } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    product.stock = Math.max(0, product.stock + Number(delta || 0));

    await product.save();

    res.json({ success: true, product });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
