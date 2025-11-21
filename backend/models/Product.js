const mongoose = require('mongoose');

// ⭐ Schema con cho đánh giá
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    rating: { type: Number, required: true }, // 1–5
    comment: { type: String, required: true },
    numReviews: { type: Number, default: 0 },

  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null, min: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    // 📸 Cho phép nhiều ảnh – mỗi ảnh là 1 string (ví dụ '/uploads/abc.jpg')
    images: [{ type: String }],

    // 🌸 Nhiều loại hoa
    flowerTypes: [{ type: String, trim: true }],

    // 🪻 Mùa nở
    season: {
      type: String,
      enum: ['Xuân', 'Hạ', 'Thu', 'Đông', 'Quanh năm'],
      default: 'Quanh năm',
    },

    // 📦 Số lượng tồn kho
    stock: { type: Number, default: 0, min: 0 },

    // 🔢 Số lượng đã bán
    sold: { type: Number, default: 0, min: 0 },

    // 🏷️ Tags
    tags: [{ type: String, trim: true }],

    // 🌟 Cờ nổi bật / kích hoạt
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    // ⭐ Đánh giá trung bình
    rating: { type: Number, default: 0 },

    // 🧮 Tổng số lượt đánh giá
    numReviews: { type: Number, default: 0 },

    // 💬 Danh sách review
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

// 🎯 Tự động sinh SKU trước khi lưu
productSchema.pre('save', function (next) {
  if (!this.sku) {
    const random = Math.floor(1000 + Math.random() * 9000);
    this.sku = `FLOWER-${Date.now()}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
