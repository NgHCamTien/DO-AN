const PaymentRequest = require("../models/PaymentRequest");

/**
 * USER tạo yêu cầu thanh toán
 */
const createPaymentRequest = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu ảnh xác minh" });
    }

    const orderItems = JSON.parse(req.body.orderItems || "[]");
    const shippingAddress = JSON.parse(req.body.shippingAddress || "{}");
    const totalPrice = Number(req.body.totalPrice);
    const note = req.body.note || "";

    if (!orderItems.length) {
      return res
        .status(400)
        .json({ success: false, message: "Giỏ hàng trống" });
    }

    if (!shippingAddress.phone || !shippingAddress.address) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu thông tin giao hàng" });
    }

    if (!totalPrice || totalPrice <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Tổng tiền không hợp lệ" });
    }

    const pr = await PaymentRequest.create({
      user: req.user._id,
      image: req.file.path,
      orderSnapshot: {
        orderItems,
        shippingAddress,
        totalPrice,
        note,
      },
    });

    res.status(201).json({
      success: true,
      message: "Đã gửi yêu cầu thanh toán, vui lòng chờ duyệt",
      data: pr,
    });
  } catch (err) {
    console.error("❌ createPaymentRequest:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * USER theo dõi thanh toán
 */
const getMyPaymentRequests = async (req, res) => {
  const list = await PaymentRequest.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.json({ success: true, data: list });
};

module.exports = {
  createPaymentRequest,
  getMyPaymentRequests,
};
