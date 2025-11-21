const Review = require("../models/Review");
const Product = require("../models/Product");
const Notification = require("../models/Notification");
// POST /api/reviews/:productId
exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId } = req.params;

    if (!rating) {
      return res.status(400).json({ success: false, message: "Thiếu số sao" });
    }

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

    // Một user 1 sản phẩm 1 review (nếu muốn cho sửa thì update)
    const existing = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
    } else {
      await Review.create({
        product: productId,
        user: req.user._id,
        rating,
        comment,
      });
    }
// 🔔 TẠO THÔNG BÁO CHO ADMIN
await Notification.create({
  type: "review",
  message: `Khách hàng ${req.user.name} vừa đánh giá sản phẩm: ${product.name}`,
  isRead: false, // ✔ đúng theo schema
});


    // Cập nhật rating trung bình + numReviews
    const stats = await Review.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      product.rating = Math.round(stats[0].avgRating * 10) / 10;
      product.numReviews = stats[0].count;
      await product.save();
    }

    return res.json({ success: true, message: "Đánh giá thành công" });
  } catch (err) {
    console.error("❌ createReview error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/reviews/:productId
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reviews,
    });
  } catch (err) {
    console.error("❌ getReviewsByProduct error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/reviews/:reviewId/reply  (admin)
exports.replyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    const review = await Review.findById(reviewId);

    if (!review)
      return res.status(404).json({ success: false, message: "Review không tồn tại" });

    review.adminReply = reply;
    review.replyDate = new Date();

    await review.save();

    res.json({
      success: true,
      message: "Admin đã trả lời đánh giá",
      review,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


