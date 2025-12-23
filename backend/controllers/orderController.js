const Order = require("../models/Order");
const Product = require("../models/Product");

// ================== HELPER ==================
const normalizeShippingAddress = (shippingAddress = {}) => ({
  address: shippingAddress.address || "",
  city: shippingAddress.city || "TP.HCM",
  district: shippingAddress.district || "",
  ward: shippingAddress.ward || "",
  phone: shippingAddress.phone || "",
});

// ================== USER: CREATE ORDER ==================
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      notes,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có sản phẩm trong đơn hàng",
      });
    }

    const safeShippingAddress = normalizeShippingAddress(shippingAddress);

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress: safeShippingAddress,
      paymentMethod,
      totalPrice,
      notes,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Pending",
      status: "pending",
    });

    const createdOrder = await order.save();

    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: createdOrder,
    });
  } catch (error) {
    console.error("❌ createOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo đơn hàng",
    });
  }
};

// ================== USER: GET MY ORDERS ==================
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("orderItems.product", "name price image");

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("❌ getMyOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================== ADMIN: GET ALL ORDERS ==================
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("orderItems.product", "name price image");

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("❌ getOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================== GET ORDER BY ID ==================
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product", "name price image");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập",
      });
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("❌ getOrderById error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================== ADMIN: CONFIRM PAYMENT ==================
const confirmBankTransfer = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // ❗ Chỉ update 1 lần
    if (order.paymentStatus !== "Paid") {
      for (const item of order.orderItems) {
        const productId =
          typeof item.product === "object"
            ? item.product._id
            : item.product;

        await Product.findByIdAndUpdate(productId, {
          $inc: {
            sold: item.quantity,
            stock: -item.quantity,
          },
        });
      }
    }

    order.paymentStatus = "Paid";
    order.status = "processing";
    await order.save();

    return res.json({
      success: true,
      message: "Admin đã xác nhận thanh toán",
      data: order,
    });
  } catch (error) {
    console.error("❌ confirmBankTransfer error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================== ADMIN: UPDATE ORDER STATUS ==================
const updateOrderStatus = async (req, res) => {
  try {
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    const { status } = req.body;

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    order.status = status;
    await order.save();

    return res.json({
      success: true,
      message: `Cập nhật trạng thái: ${status}`,
      data: order,
    });
  } catch (error) {
    console.error("❌ updateOrderStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// ================== EXPORT ==================
module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  getOrderById,
  confirmBankTransfer,
  updateOrderStatus,
};
