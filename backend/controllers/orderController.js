const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

// =============================
// ⭐ XÁC ĐỊNH SỐ LƯỢNG TỐI ĐA
// =============================
const getMaxQtyForProduct = (product) => {
  if (product.price > 1000000) return 1;

  if (
    product.category &&
    product.category.name &&
    product.category.name.toLowerCase().includes("khai trương")
  ) {
    return 2;
  }

  return 3;
};

// =============================
// 🟢 CREATE ORDER
// =============================
const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice, notes } =
      req.body;

    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Không có sản phẩm trong đơn hàng" });
    }

    // ⭐ Kiểm tra từng sản phẩm
    for (const item of orderItems) {
      const product = await Product.findById(item.product).populate(
        "category",
        "name"
      );

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm không tồn tại (ID: ${item.product})`,
        });
      }

      const maxQty = getMaxQtyForProduct(product);

      if (item.quantity > maxQty) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${product.name}" chỉ cho phép tối đa ${maxQty}.`,
        });
      }

      if (item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Số lượng không hợp lệ cho sản phẩm "${product.name}"`,
        });
      }
    }

    // ⭐ Ràng buộc tổng
    const totalQuantity = orderItems.reduce((sum, i) => sum + i.quantity, 0);

    if (totalQuantity > 10) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng quá lớn (tổng ${totalQuantity}). Vui lòng liên hệ Zalo.`,
      });
    }

    // ⭐ Tạo đơn hàng
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      notes,
    });

    if (paymentMethod !== "COD") {
      order.qrCode = `https://img.vietqr.io/image/970436-0123456789-compact.png?amount=${totalPrice}&addInfo=${shippingAddress.phone}`;
    }

    order.paymentStatus = "Pending";
    order.status = paymentMethod === "COD" ? "processing" : "pending";

    const createdOrder = await order.save();

    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: createdOrder,
    });
  } catch (error) {
    console.error("❌ Error createOrder:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// =============================
// 🔵 GET MY ORDERS
// =============================
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    res.json({
      success: true,
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("❌ Error getMyOrders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================
// 🔵 ADMIN GET ALL ORDERS
// =============================
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("❌ Error getOrders:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================
// 🔵 GET ORDER BY ID
// =============================
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Không có quyền truy cập" });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error("❌ Error getOrderById:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================
// 🟡 ADMIN CONFIRM PAYMENT
// =============================
const confirmBankTransfer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    order.paymentStatus = "Paid";
    order.status = "processing";

    await order.save();

    res.json({
      success: true,
      message: "💰 Thanh toán chuyển khoản đã được duyệt",
      order,
    });
  } catch (error) {
    console.error("❌ Error confirmBankTransfer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================
// 🟡 UPDATE STATUS
// =============================
const updateOrderStatus = async (req, res) => {
  try {
    const valid = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!valid.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status;
    await order.save();

    res.json({
      success: true,
      message: `Trạng thái đã cập nhật: ${req.body.status}`,
      order,
    });
  } catch (error) {
    console.error("❌ Error updateOrderStatus:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================
// ⭐ EXPORT — QUAN TRỌNG!
// =============================
module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  getOrderById,
  confirmBankTransfer,
  updateOrderStatus,
};
