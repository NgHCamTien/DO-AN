const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock
} = require("../controllers/productController");
const multer = require("multer");
const path = require("path");
const { protect, admin } = require("../middleware/authMiddleware");

// Multer config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// ⭐ Search suggestions
router.get("/search-suggestions", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ suggestions: [] });
});

// ⭐ Featured
router.get("/featured", getFeaturedProducts);

// ⭐ Related
router.get("/:id/related", getRelatedProducts);

// ⭐ Detail
router.get("/:id", getProductById);

// ⭐ ALL PRODUCTS (FE FILTER)
router.get("/", getProducts);

// Admin routes
router.post("/", protect, admin, upload.array("images", 5), createProduct);
router.put("/:id", protect, admin, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.patch("/:id/stock", protect, admin, adjustStock);

module.exports = router;
