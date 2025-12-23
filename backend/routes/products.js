const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const { protect, admin } = require("../middleware/authMiddleware");

// ✅ CHỈ REQUIRE 1 LẦN
const productController = require("../controllers/productController");

// ================== MULTER CONFIG ==================
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// ================== SKU PREVIEW ==================
router.get(
  "/generate-sku",
  protect,
  admin,
  productController.generateSkuPreview
);

// ================== PUBLIC ROUTES ==================
router.get("/featured", productController.getFeaturedProducts);
router.get("/:id/related", productController.getRelatedProducts);
router.get("/:id", productController.getProductById);
router.get("/", productController.getProducts);

// ================== ADMIN ROUTES ==================
router.post(
  "/",
  protect,
  admin,
  upload.array("images", 5),
  productController.createProduct
);

router.put(
  "/:id",
  protect,
  admin,
  upload.array("images", 5),
  productController.updateProduct
);

router.delete(
  "/:id",
  protect,
  admin,
  productController.deleteProduct
);

router.patch(
  "/:id/stock",
  protect,
  admin,
  productController.adjustStock
);

module.exports = router;
