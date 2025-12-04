const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  confirmBankTransfer,
  updateOrderStatus,
  getOrders,
} = require("../controllers/orderController");

const { protect, admin } = require("../middleware/authMiddleware");

// Multer upload middleware (đã tách riêng)
const upload = require("../middleware/uploadMiddleware");


// 📌 CREATE ORDER

router.post("/", protect, createOrder);


// 📌 USER GET ORDERS

router.get("/myorders", protect, getMyOrders);


// 📌 ADMIN GET ALL ORDERS

router.get("/", protect, admin, getOrders);


// 📌 GET ORDER DETAILS

router.get("/:id", protect, getOrderById);


// 📌 UPLOAD PAYMENT PROOF (BANK / E-WALLET)

router.post(
  "/upload-payment/:id",
  protect,
  upload.single("paymentProof"),
  async (req, res) => {
    const Order = require("../models/Order");

    try {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: "Order not found" });

      if (!req.file) return res.status(400).json({ success: false, message: "No payment image uploaded" });

      // BANK
      if (order.paymentMethod === "BANK_TRANSFER") {
        order.bankTransferInfo = {
          image: `/uploads/${req.file.filename}`,
          bankName: "Vietcombank",
          accountNumber: "0123456789"
        };
      }

      // E-WALLET
      if (order.paymentMethod === "E_WALLET") {
        order.eWalletInfo = {
          provider: "MoMo",
          image: `/uploads/${req.file.filename}`
        };
      }

      order.paymentStatus = "Pending";
      await order.save();

      return res.json({
        success: true,
        message: "Payment proof saved",
        order
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);


// 📌 ADMIN CONFIRM BANK PAYMENT

router.put("/:id/confirm-payment", protect, admin, confirmBankTransfer);


// 📌 ADMIN UPDATE STATUS

router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;
