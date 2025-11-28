const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect, admin } = require("../middleware/authMiddleware");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.get("/", protect, admin, getProducts);
router.get("/:id", protect, admin, getProductById);

router.post("/", protect, admin, upload.array("images", 5), createProduct);
router.put("/:id", protect, admin, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
