const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = require('../config/config');

// Tạo transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Gửi email xác nhận đơn hàng
const sendOrderConfirmation = async (user, order) => {
  try {
    const message = {
      from: EMAIL_USER,
      to: user.email,
      subject: 'Xác nhận đơn hàng - DDT Flower Shop',
      html: `
        <h1>Cảm ơn bạn đã đặt hàng, ${user.name}!</h1>
        <p>Đơn hàng của bạn đã được xác nhận và đang được xử lý.</p>
        <h2>Chi tiết đơn hàng:</h2>
        <ul>
          ${order.orderItems.map(
            item => `<li>${item.quantity} x ${item.name} - ${item.price.toLocaleString('vi-VN')}đ</li>`
          ).join('')}
        </ul>
        <p><strong>Tổng cộng:</strong> ${order.totalPrice.toLocaleString('vi-VN')}đ</p>
        <p><strong>Địa chỉ giao hàng:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}</p>
        <p><strong>Phương thức thanh toán:</strong> ${order.paymentMethod}</p>
        <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao.</p>
        <p>Trân trọng,<br>DDT Flower Shop</p>
      `
    };
    
    await transporter.sendMail(message);
    console.log('Email xác nhận đã được gửi');
    return true;
  } catch (error) {
    console.error('Không thể gửi email: ', error);
    return false;
  }
};

module.exports = {
  sendOrderConfirmation
};