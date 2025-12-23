const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getMyPaymentProofs,
} = require("../controllers/userPaymentProofController");

const router = express.Router();

// USER xem toàn bộ ảnh đã gửi
router.get("/my", protect, getMyPaymentProofs);

module.exports = router;
