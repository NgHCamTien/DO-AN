const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");

// Bỏ dấu tiếng Việt
const removeVietnameseTone = (str = "") => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

// 📌 GET /api/products — FILTER + PAGINATION + SEARCH
exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      category, // slug danh mục
      price,
      flower,
      occasion,
      page = 1,
    } = req.query;

    const pageSize = 12;
    const currentPage = Number(page) || 1;

    const andConditions = [];

    // Chỉ lấy sản phẩm đang active
    andConditions.push({ isActive: true });

    // 🔍 SEARCH theo nhiều trường
    if (search && search.trim() !== "") {
      const s = search.trim();
      const sNoTone = removeVietnameseTone(s.toLowerCase());

      andConditions.push({
        $or: [
          { name: { $regex: s, $options: "i" } },
          { shortDescription: { $regex: s, $options: "i" } },
          { description: { $regex: s, $options: "i" } },
          { flowerTypes: { $regex: s, $options: "i" } },
          { tags: { $regex: s, $options: "i" } },
          { occasion: { $regex: s, $options: "i" } },
          { categoryName: { $regex: s, $options: "i" } },
          { searchKeywords: { $regex: sNoTone, $options: "i" } },
        ],
      });
    }

    // 🏷 Lọc theo danh mục (slug)
    if (category && category !== "all" && category !== "") {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        andConditions.push({ category: cat._id });
      }
    }

    // 💰 Lọc giá
    if (price === "under-200") {
      andConditions.push({ price: { $lte: 200000 } });
    } else if (price === "200-400") {
      andConditions.push({ price: { $gte: 200000, $lte: 400000 } });
    } else if (price === "above-400") {
      andConditions.push({ price: { $gte: 400000 } });
    }

    // 🌸 Lọc theo loại hoa
    if (flower) {
      andConditions.push({ flowerTypes: { $in: [flower] } });
    }

    // 🎁 Lọc theo dịp tặng
    if (occasion) {
      andConditions.push({ occasion });
    }

    const filter =
      andConditions.length > 0 ? { $and: andConditions } : {};

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * pageSize)
      .limit(pageSize);

    return res.json({
      success: true,
      products,
      total,
      page: currentPage,
      pages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("❌ Error in getProducts:", err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err });
  }
};

// 🔍 GET PRODUCT BY ID
exports.getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }

    const product = await Product.findById(req.params.id).populate(
      "category",
      "name slug"
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    res.json({ success: true, product });
  } catch (err) {
    console.error("getProductById error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🌟 FEATURED PRODUCTS
exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;

    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    })
      .populate("category", "name slug")
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (err) {
    console.error("getFeaturedProducts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔗 RELATED PRODUCTS
exports.getRelatedProducts = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID sản phẩm không hợp lệ" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true,
    })
      .limit(4)
      .populate("category", "name slug");

    res.json({ success: true, products: relatedProducts });
  } catch (err) {
    console.error("getRelatedProducts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ➕ CREATE PRODUCT
exports.createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      shortDescription,
      description,
      price,
      discountPrice,
      discountStartDate,
      discountEndDate,
      categoryId,
      isFeatured,
      season,
      stock,
      tags,
      occasion,
      flowerTypes,
      images,
    } = req.body;

    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ tên, mô tả, giá và danh mục",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res
        .status(400)
        .json({ success: false, message: "Danh mục không hợp lệ" });
    }

    // Ảnh
    let imgs = [];

    // Nếu dùng upload trực tiếp qua multer
    if (req.files && req.files.length > 0) {
      imgs = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (Array.isArray(images)) {
      imgs = images;
    } else if (typeof images === "string" && images.trim() !== "") {
      // Có thể là 1 url đơn hoặc là JSON
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) imgs = parsed;
        else imgs = [images];
      } catch {
        imgs = [images];
      }
    }

    // Flower types
    let flowerArray = [];
    if (Array.isArray(flowerTypes)) {
      flowerArray = flowerTypes;
    } else if (typeof flowerTypes === "string" && flowerTypes.trim() !== "") {
      flowerArray = flowerTypes
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);
    }

    // Tags
    let tagArray = [];
    if (Array.isArray(tags)) {
      tagArray = tags;
    } else if (typeof tags === "string" && tags.trim() !== "") {
      tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const categoryName = category.name || "";

    const product = new Product({
      sku,
      name,
      shortDescription,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      discountStartDate: discountStartDate || null,
      discountEndDate: discountEndDate || null,
      images: imgs,
      category: categoryId,
      categoryName,
      isFeatured: !!isFeatured,
      flowerTypes: flowerArray,
      season: season || "Quanh năm",
      stock: Number(stock) || 0,
      tags: tagArray,
      occasion: occasion || "other",
      // searchKeywords sẽ được tự build trong pre('save') của model
    });

    const created = await product.save();

    res.status(201).json({ success: true, product: created });
  } catch (err) {
    console.error("createProduct error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✏️ UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    const {
      sku,
      name,
      shortDescription,
      description,
      price,
      discountPrice,
      discountStartDate,
      discountEndDate,
      categoryId,
      isFeatured,
      season,
      stock,
      tags,
      occasion,
      flowerTypes,
      images,
    } = req.body;

    // Cập nhật danh mục (nếu có)
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res
          .status(400)
          .json({ success: false, message: "Danh mục không hợp lệ" });
      }
      product.category = categoryId;
      product.categoryName = category.name || "";
    }

    if (typeof sku !== "undefined") product.sku = sku;
    if (typeof name !== "undefined") product.name = name;
    if (typeof shortDescription !== "undefined")
      product.shortDescription = shortDescription;
    if (typeof description !== "undefined") product.description = description;
    if (typeof price !== "undefined") product.price = Number(price);
    if (typeof discountPrice !== "undefined") {
      product.discountPrice =
        discountPrice === "" ? null : Number(discountPrice);
    }
    if (typeof discountStartDate !== "undefined")
      product.discountStartDate =
        discountStartDate || null;
    if (typeof discountEndDate !== "undefined")
      product.discountEndDate = discountEndDate || null;
    if (typeof season !== "undefined") product.season = season;
    if (typeof stock !== "undefined") product.stock = Number(stock);
    if (typeof isFeatured !== "undefined")
      product.isFeatured = !!isFeatured;
    if (typeof occasion !== "undefined")
      product.occasion = occasion || "other";

    // Flower types
    if (typeof flowerTypes !== "undefined") {
      if (Array.isArray(flowerTypes)) {
        product.flowerTypes = flowerTypes;
      } else if (
        typeof flowerTypes === "string" &&
        flowerTypes.trim() !== ""
      ) {
        product.flowerTypes = flowerTypes
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean);
      }
    }

    // Tags
    if (typeof tags !== "undefined") {
      if (Array.isArray(tags)) {
        product.tags = tags;
      } else if (typeof tags === "string" && tags.trim() !== "") {
        product.tags = tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    // Ảnh
    if (req.files && req.files.length > 0) {
      product.images = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (typeof images !== "undefined") {
      if (Array.isArray(images)) {
        product.images = images;
      } else if (typeof images === "string" && images.trim() !== "") {
        try {
          const parsed = JSON.parse(images);
          if (Array.isArray(parsed)) product.images = parsed;
          else product.images = [images];
        } catch {
          product.images = [images];
        }
      }
    }

    const updated = await product.save();

    res.json({ success: true, product: updated });
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🗑 DELETE
exports.deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    await product.deleteOne();

    res.json({ success: true, message: "Đã xóa sản phẩm" });
  } catch (err) {
    console.error("deleteProduct error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📦 ADJUST STOCK
exports.adjustStock = async (req, res) => {
  try {
    const { delta } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    product.stock = Math.max(0, product.stock + Number(delta || 0));

    await product.save();

    res.json({ success: true, product });
  } catch (err) {
    console.error("adjustStock error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
