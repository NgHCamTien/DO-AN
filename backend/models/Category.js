const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true, // 🔥 Không cho trùng slug
      index: true   // 🔥 Tạo index để tìm kiếm nhanh hơn
    },
    description: {
      type: String,
      default: ''
    },
    image: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true // 🔥 Tự động thêm createdAt & updatedAt
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
