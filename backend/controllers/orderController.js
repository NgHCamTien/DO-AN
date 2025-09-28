const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Lấy đơn hàng của người dùng hiện tại
const getMyOrders = async (req, res) => {
  try {
    console.log('=== GET MY ORDERS DEBUG ===');
    console.log('User ID:', req.user._id);
    console.log('User ID type:', typeof req.user._id);
    console.log('User email:', req.user.email);
    
    const userId = req.user._id;
    const mongoose = require('mongoose');
    
    // Thử nhiều cách tìm kiếm
    console.log('Trying different search methods...');
    
    // Method 1: Direct ObjectId
    const orders1 = await Order.find({ user: userId });
    console.log('Method 1 (direct ObjectId):', orders1.length);
    
    // Method 2: Convert to ObjectId
    const orders2 = await Order.find({ user: new mongoose.Types.ObjectId(userId) });
    console.log('Method 2 (new ObjectId):', orders2.length);
    
    // Method 3: String comparison
    const orders3 = await Order.find({ user: userId.toString() });
    console.log('Method 3 (string):', orders3.length);
    
    // Method 4: $in operator
    const orders4 = await Order.find({ 
      user: { 
        $in: [userId, userId.toString(), new mongoose.Types.ObjectId(userId)] 
      } 
    });
    console.log('Method 4 ($in operator):', orders4.length);
    
    // Method 5: Check all orders and filter manually
    const allOrders = await Order.find({});
    console.log('Total orders:', allOrders.length);
    
    const matchedOrders = allOrders.filter(order => {
      const orderUserId = order.user.toString();
      const currentUserId = userId.toString();
      console.log(`Comparing: ${orderUserId} === ${currentUserId} = ${orderUserId === currentUserId}`);
      return orderUserId === currentUserId;
    });
    console.log('Manual filter result:', matchedOrders.length);
    
    // Use the method that works
    let finalOrders = orders4.length > 0 ? orders4 : matchedOrders;
    
    // Populate user info
    if (finalOrders.length > 0) {
      finalOrders = await Order.find({ 
        user: { 
          $in: [userId, userId.toString(), new mongoose.Types.ObjectId(userId)] 
        } 
      })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    }
    
    console.log(`✅ Final result: Found ${finalOrders.length} orders for user ${req.user.email}`);
    
    // Return data in consistent format
    res.json({
      success: true,
      message: `Tìm thấy ${finalOrders.length} đơn hàng`,
      data: finalOrders,
      total: finalOrders.length
    });
    
  } catch (error) {
    console.error('❌ Error in getMyOrders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy đơn hàng',
      error: error.message 
    });
  }
};

// Tạo đơn hàng mới - THÊM VALIDATION GIỚI HẠN 200 SẢN PHẨM
const createOrder = async (req, res) => {
  try {
    const { 
      orderItems, 
      shippingAddress, 
      paymentMethod, 
      totalPrice 
    } = req.body;
    
    console.log('=== CREATE ORDER DEBUG ===');
    console.log('User:', req.user.email);
    console.log('Order items count:', orderItems?.length);
    console.log('Total price:', totalPrice);
    console.log('Payment method:', paymentMethod);
    
    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'Không có sản phẩm trong đơn hàng' });
    }
    
    // VALIDATION: Kiểm tra số lượng mỗi sản phẩm không vượt quá 200
    for (const item of orderItems) {
      if (item.quantity > 200) {
        return res.status(400).json({ 
          success: false,
          message: `Sản phẩm "${item.name}" không thể mua quá 200 sản phẩm. Số lượng hiện tại: ${item.quantity}` 
        });
      }
      
      if (item.quantity <= 0) {
        return res.status(400).json({ 
          success: false,
          message: `Số lượng sản phẩm "${item.name}" không hợp lệ` 
        });
      }
    }
    
    // Kiểm tra tổng số lượng tất cả sản phẩm trong đơn hàng
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    if (totalQuantity > 500) {
      return res.status(400).json({ 
        success: false,
        message: `Tổng số lượng sản phẩm trong đơn hàng không được vượt quá 500. Hiện tại: ${totalQuantity}` 
      });
    }
    
    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice
    });
    
    const createdOrder = await order.save();
    console.log('✅ Order created successfully:', createdOrder._id);
    
    // Gửi email xác nhận đơn hàng (optional)
    try {
      const user = await User.findById(req.user._id);
      // await sendOrderConfirmation(user, createdOrder);
      console.log('📧 Email confirmation would be sent here');
    } catch (emailError) {
      console.error('Email service error:', emailError);
      // Không throw error vì đơn hàng đã tạo thành công
    }
    
    res.status(201).json({
      success: true,
      message: 'Đặt hàng thành công!',
      data: createdOrder
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi tạo đơn hàng',
      error: error.message 
    });
  }
};

// Lấy chi tiết đơn hàng
const getOrderById = async (req, res) => {
  try {
    console.log('=== GET ORDER BY ID DEBUG ===');
    console.log('Order ID:', req.params.id);
    console.log('User:', req.user.email);
    
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name');
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn hàng' 
      });
    }
    
    // Kiểm tra quyền xem đơn hàng
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Không có quyền truy cập đơn hàng này' 
      });
    }
    
    console.log('✅ Order found:', order._id);
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('❌ Error getting order by ID:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy chi tiết đơn hàng',
      error: error.message 
    });
  }
};

// Cập nhật trạng thái đơn hàng đã thanh toán
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn hàng' 
      });
    }
    
    // Kiểm tra quyền (chỉ chủ đơn hàng hoặc admin)
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Không có quyền cập nhật đơn hàng này' 
      });
    }
    
    order.paymentResult = {
      id: req.body.id || 'manual_payment',
      status: req.body.status || 'completed',
      update_time: req.body.update_time || new Date().toISOString(),
      email_address: req.body.payer?.email_address || req.user.email
    };
    
    order.status = 'processing';
    
    const updatedOrder = await order.save();
    
    console.log('✅ Order payment updated:', updatedOrder._id);
    
    res.json({
      success: true,
      message: 'Cập nhật thanh toán thành công',
      data: updatedOrder
    });
  } catch (error) {
    console.error('❌ Error updating order payment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi cập nhật thanh toán',
      error: error.message 
    });
  }
};

// Cập nhật trạng thái đơn hàng (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    console.log('=== UPDATE ORDER STATUS DEBUG ===');
    console.log('Order ID:', req.params.id);
    console.log('New status:', status);
    console.log('Admin:', req.user.email);
    
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Trạng thái đơn hàng không hợp lệ' 
      });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy đơn hàng' 
      });
    }
    
    const oldStatus = order.status;
    order.status = status;
    
    const updatedOrder = await order.save();
    
    console.log(`✅ Order status updated: ${oldStatus} → ${status} for order ${updatedOrder._id}`);
    
    res.json({
      success: true,
      message: `Cập nhật trạng thái đơn hàng thành công: ${getStatusText(status)}`,
      data: updatedOrder
    });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái đơn hàng',
      error: error.message 
    });
  }
};

// Lấy tất cả đơn hàng (Admin)
const getOrders = async (req, res) => {
  try {
    console.log('=== GET ALL ORDERS (ADMIN) DEBUG ===');
    console.log('Admin user:', req.user.email);
    
    const pageSize = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * pageSize;
    
    // Filter theo status nếu có
    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    
    const count = await Order.countDocuments(filter);
    
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(skip);
    
    console.log(`📋 Retrieved ${orders.length} orders (page ${page}/${Math.ceil(count / pageSize)})`);
    console.log(`📊 Total orders in DB: ${count}`);
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          pages: Math.ceil(count / pageSize),
          total: count,
          limit: pageSize
        }
      }
    });
  } catch (error) {
    console.error('❌ Error getting orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy danh sách đơn hàng',
      error: error.message 
    });
  }
};

// Helper function
const getStatusText = (status) => {
  const statusMap = {
    'pending': 'Chờ xử lý',
    'processing': 'Đang xử lý',
    'shipped': 'Đang giao',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderStatus,
  getOrders
};