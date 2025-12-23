const PaymentRequest = require("../models/PaymentRequest");
const Order = require("../models/Order");

// ADMIN: xem tất cả yêu cầu thanh toán
const getAllPaymentRequests = async (req, res) => {
  const list = await PaymentRequest.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: list });
};

// ADMIN: duyệt
const approvePaymentRequest = async (req, res) => {
  const pr = await PaymentRequest.findById(req.params.id);
  if (!pr) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });

  if (pr.status !== "PENDING") {
    return res.status(400).json({ message: "Đã xử lý" });
  }

  pr.status = "APPROVED";

  const order = await Order.create({
    user: pr.user,
    orderItems: pr.orderSnapshot.orderItems,
    shippingAddress: pr.orderSnapshot.shippingAddress,
    totalPrice: pr.orderSnapshot.totalPrice,
    paymentMethod: "BANK_TRANSFER",
    paymentStatus: "Paid",
    status: "processing",
    paymentRequest: pr._id,
  });

  pr.order = order._id;
  await pr.save();

  res.json({ success: true, order });
};

// ADMIN: từ chối
const rejectPaymentRequest = async (req, res) => {
  const pr = await PaymentRequest.findById(req.params.id);
  if (!pr) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });

  pr.status = "REJECTED";
  pr.adminNote = req.body.adminNote || "Không hợp lệ";
  await pr.save();

  res.json({ success: true });
};

module.exports = {
  getAllPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
};
