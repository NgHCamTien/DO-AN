const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      qrCode: { type: String },
      ref: "User",
    },

    orderItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      }
    ],

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      phone: { type: String, required: true },
    },

    // 🔥 Phương thức thanh toán
    paymentMethod: {
      type: String,
      enum: ["COD", "BANK_TRANSFER", "E_WALLET"],
      default: "COD",
    },

    // 🔥 Trạng thái thanh toán
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    // 🔥 Thông tin chuyển khoản ngân hàng
    bankTransferInfo: {
      image: String, // ảnh upload
      bankName: String,
      accountNumber: String,
    },

    // 🔥 Thông tin ví điện tử
    eWalletInfo: {
      provider: String, // MoMo / ZaloPay
      transactionId: String,
      image: String,
    },

    // 🔥 Trạng thái đơn hàng (admin xử lý)
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    totalPrice: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

