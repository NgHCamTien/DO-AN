const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    // ================== SẢN PHẨM TRONG ĐƠN ==================
    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],

    // ================== ĐỊA CHỈ GIAO HÀNG ==================
    shippingAddress: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        default: "TP.HCM", // ✅ ĐAI AN TOÀN DEMO
        trim: true,
      },

      district: {
        type: String,
        default: "",
        trim: true,
      },

      ward: {
        type: String,
        default: "",
        trim: true,
      },

      postalCode: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // ================== THANH TOÁN ==================
    paymentMethod: {
      type: String,
      enum: ["COD", "BANK_TRANSFER", "E_WALLET"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    // Thông tin chuyển khoản
    bankTransferInfo: {
      image: String,
      bankName: String,
      accountNumber: String,
    },

    // Thông tin ví điện tử
    eWalletInfo: {
      provider: String, // MoMo / ZaloPay
      transactionId: String,
      image: String,
    },

    // ================== TRẠNG THÁI ĐƠN ==================
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    // ================== TỔNG TIỀN ==================
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
