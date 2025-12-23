const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");

const {
  getAllPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
} = require("../controllers/adminPaymentRequestController");

// ADMIN
router.get("/", protect, admin, getAllPaymentRequests);
router.put("/:id/approve", protect, admin, approvePaymentRequest);
router.put("/:id/reject", protect, admin, rejectPaymentRequest);

module.exports = router;
