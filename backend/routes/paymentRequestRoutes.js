const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const {
  createPaymentRequest,
  getMyPaymentRequests,
} = require("../controllers/paymentRequestController");

// multer
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// USER
router.post("/", protect, upload.single("image"), createPaymentRequest);
router.get("/my", protect, getMyPaymentRequests);

module.exports = router;
