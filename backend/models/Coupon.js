const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
  discountPercent: { type: Number, required: true, min: 1, max: 100 },
  maxDiscount: { type: Number, default: null }, // optional money cap
  expireAt: { type: Date, default: null },
  active: { type: Boolean, default: true },
  usageLimit: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
