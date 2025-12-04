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
  adjustStock,
  suggestProducts,
} = require("../controllers/productController");

const multer = require("multer");
const path = require("path");
const { protect, admin } = require("../middleware/authMiddleware");

// ==========================
// 📸 Multer config
// ==========================
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// ==========================
// 🔍 Search Suggest (Autocomplete)
// GET /api/products/suggest?q=...
// ==========================
router.get("/suggest", suggestProducts);

// ==========================
// 🌟 Featured products
// ==========================
router.get("/featured", getFeaturedProducts);

// ==========================
// 🔗 Related products
// ==========================
router.get("/:id/related", getRelatedProducts);

// ==========================
// 🔍 Detail
// ==========================
router.get("/:id", getProductById);

// ==========================
// 📦 Get all (filter + search + pagination)
// ==========================
router.get("/", getProducts);

// ==========================
// 🛠 Admin CRUD
// ==========================
router.post("/", protect, admin, upload.array("images", 5), createProduct);

router.put("/:id", protect, admin, upload.array("images", 5), updateProduct);

router.delete("/:id", protect, admin, deleteProduct);

router.patch("/:id/stock", protect, admin, adjustStock);

module.exports = router;
