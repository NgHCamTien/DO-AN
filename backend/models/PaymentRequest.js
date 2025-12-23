const mongoose = require("mongoose");

/**
 * PaymentRequest = Yêu cầu thanh toán QR (chờ duyệt)
 * KHÔNG tạo Order ở bước này
 */
const paymentRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    image: {
      type: String, // ảnh chuyển khoản / QR
      required: true,
    },

    orderSnapshot: {
      orderItems: [
        {
          name: String,
          quantity: Number,
          price: Number,
          image: String,
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
        },
      ],

      shippingAddress: {
        name: String,
        phone: String,
        address: String,
      },

      totalPrice: {
        type: Number,
        required: true,
      },

      note: {
        type: String,
        default: "",
      },
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    adminNote: {
      type: String,
      default: "",
    },

    // chỉ set sau khi APPROVED
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentRequest", paymentRequestSchema);
