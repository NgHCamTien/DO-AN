const mongoose = require("mongoose");

// ⭐ Bỏ dấu tiếng Việt để phục vụ search
const removeVietnameseTone = (str = "") => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

// ⭐ Schema con cho review
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true }, // 1–5
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    name: { type: String, required: true, trim: true },
    sku: { type: String, unique: true },
    shortDescription: { type: String, trim: true },
    description: { type: String, required: true },

    // Giá
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null, min: 0 },
    discountStartDate: { type: Date, default: null },
    discountEndDate: { type: Date, default: null },

    // Danh mục
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Lưu tên danh mục để search cho nhanh
    categoryName: { type: String, trim: true },

    // Ảnh
    images: [{ type: String }], // ví dụ: '/uploads/abc.jpg'

    // Loại hoa
    flowerTypes: [{ type: String, trim: true }],

    // Mùa hoa
    season: {
      type: String,
      enum: ["Xuân", "Hạ", "Thu", "Đông", "Quanh năm"],
      default: "Quanh năm",
    },

    // Tồn kho & số lượng bán
    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },

    // Tags
    tags: [{ type: String, trim: true }],

    // Dịp tặng
    occasion: {
      type: String,
      enum: ["birthday", "graduation", "opening", "anniversary", "love", "other"],
      default: "other",
    },

    // Cờ hiển thị
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // Đánh giá
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],

    // Từ khóa phục vụ search (đã bỏ dấu)
    searchKeywords: [{ type: String }],
  },
  { timestamps: true }
);

// 🎯 Tự sinh SKU trước khi lưu
productSchema.pre("save", function (next) {
  if (!this.sku) {
    const random = Math.floor(1000 + Math.random() * 9000);
    this.sku = `FLOWER-${Date.now()}-${random}`;
  }

  // Build chuỗi từ khóa từ các trường quan trọng
  const flower = Array.isArray(this.flowerTypes)
    ? this.flowerTypes.join(" ")
    : "";
  const tags = Array.isArray(this.tags) ? this.tags.join(" ") : "";
  const occ = this.occasion || "";
  const categoryName = this.categoryName || "";

  const raw = `${this.name || ""} ${flower} ${tags} ${occ} ${categoryName}`;

  const normalized = removeVietnameseTone(raw.toLowerCase());
  this.searchKeywords = normalized
    .split(/\s+/)
    .filter(Boolean);

  next();
});

module.exports = mongoose.model("Product", productSchema);
