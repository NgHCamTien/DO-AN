const PaymentProof = require("../models/PaymentProof");

exports.getMyPaymentProofs = async (req, res) => {
  try {
    const proofs = await PaymentProof.find({
      user: req.user._id,
      
    })
      // ⭐ thêm populate ở ĐÂY
      .populate("order", "totalPrice paymentStatus createdAt")
      .sort({ createdAt: -1 }); // mới nhất trước

    res.json({
      success: true,
      data: proofs,
    });
  } catch (err) {
    console.error("getMyPaymentProofs error:", err);
    res.status(500).json({
      success: false,
      message: "Không lấy được dữ liệu xác minh",
    });
  }
};
