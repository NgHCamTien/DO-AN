// const mongoose = require("mongoose");

// const reviewSchema = new mongoose.Schema({
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Product",
//     required: true
//   },
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   rating: { type: Number, required: true, min: 1, max: 5 },
//   comment: { type: String, required: true },

//   // Admin reply
//   adminReply: {
//     message: { type: String },
//     repliedAt: { type: Date }
//   }
// }, { timestamps: true });

// module.exports = mongoose.model("Review", reviewSchema);
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
    
    // ⭐ Admin trả lời đánh giá
    adminReply: { type: String, default: "" },
    replyDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
