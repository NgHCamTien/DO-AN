const express = require("express");
const router = express.Router();

const {
  createReview,
  getReviewsByProduct,
  replyReview,
} = require("../controllers/reviewController");

const { protect, admin } = require("../middleware/authMiddleware");

// ⭐ GET: Lấy danh sách review của 1 sản phẩm
router.get("/:productId", getReviewsByProduct);

// ⭐ POST: User gửi review
router.post("/:productId", protect, createReview);

// ⭐ PUT: Admin trả lời review
router.put("/:reviewId/reply", protect, admin, replyReview);

module.exports = router;
