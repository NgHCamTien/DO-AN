const mongoose = require("mongoose");

// ================== REMOVE VIETNAMESE TONE ==================
const removeVietnameseTone = (str = "") => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

// ================== REVIEW SCHEMA ==================
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

// ================== PRODUCT SCHEMA ==================
const productSchema = new mongoose.Schema(
  {
    // ---------- Basic info ----------
    name: { type: String, required: true, trim: true },

    // SKU sinh ở CONTROLLER (không sinh ở model)
    sku: {
      type: String,
      unique: true,
      index: true,
    },

    description: { type: String, required: true },

    // ---------- Price ----------
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null, min: 0 },
    discountStartDate: { type: Date, default: null },
    discountEndDate: { type: Date, default: null },

    // ---------- Category ----------
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    categoryName: { type: String, trim: true },

    // ---------- Images ----------
    images: {
      type: [String],
      default: [],
    },

    // ---------- Flower info ----------
    flowerTypes: [{ type: String, trim: true }],

    season: {
      type: String,
      enum: ["Xuân", "Hạ", "Thu", "Đông", "Quanh năm"],
      default: "Quanh năm",
    },

    // ---------- Inventory ----------
    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },

    // ---------- Tags ----------
    tags: [{ type: String, trim: true }],

    occasion: {
      type: String,
      enum: ["birthday", "graduation", "opening", "anniversary", "love", "other"],
      default: "other",
    },

    // ---------- Flags ----------
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // ---------- Rating ----------
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],

    // ---------- Search ----------
    searchKeywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ================== PRE SAVE: BUILD SEARCH KEYWORDS ==================
productSchema.pre("save", function (next) {
  const flower = Array.isArray(this.flowerTypes)
    ? this.flowerTypes.join(" ")
    : "";
  const tags = Array.isArray(this.tags) ? this.tags.join(" ") : "";
  const occ = this.occasion || "";
  const categoryName = this.categoryName || "";

  const raw = `${this.name || ""} ${flower} ${tags} ${occ} ${categoryName}`;
  const normalized = removeVietnameseTone(raw.toLowerCase());

  this.searchKeywords = normalized.split(/\s+/).filter(Boolean);

  next();
});

module.exports = mongoose.model("Product", productSchema);
