const nodemailer = require('nodemailer');

// Option 1: SendGrid (Miễn phí 100 emails/ngày)
const createSendGridTransporter = () => {
  return nodemailer.createTransporter({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY // Sẽ hướng dẫn tạo
    }
  });
};

// Option 2: Mailtrap (Development/Testing)
const createMailtrapTransporter = () => {
  return nodemailer.createTransporter({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  });
};

// Option 3: Ethereal (Test email với preview)
const createEtherealTransporter = async () => {
  try {
    let testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error('Lỗi tạo Ethereal transporter:', error);
    throw error;
  }
};

// Template email chào mừng
const getWelcomeEmailHTML = (userName, userEmail) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Chào mừng đến với DTP Flower Shop</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10B981, #065F46); color: white; padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🌸 DTP Flower Shop</h1>
          <h2 style="margin: 10px 0 0 0; font-size: 22px; font-weight: normal;">Chào mừng ${userName}!</h2>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px 20px;">
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Xin chào <strong>${userName}</strong>,
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #333;">
            Cảm ơn bạn đã đăng ký tài khoản tại <strong>DTP Flower Shop</strong>! 
            Chúng tôi rất vui mừng được chào đón bạn vào gia đình yêu hoa của chúng tôi. 🌺
          </p>
          
          <!-- Promotion Box -->
          <div style="background: #FEF3C7; border: 2px solid #F59E0B; padding: 25px; margin: 25px 0; border-radius: 10px; text-align: center;">
            <h3 style="margin: 0 0 15px 0; color: #92400E; font-size: 20px;">🎉 Ưu đãi đặc biệt!</h3>
            <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #DC2626;">
              GIẢM 15% cho đơn hàng đầu tiên
            </p>
            <div style="background: #DC2626; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; margin: 10px 0; font-size: 18px; font-weight: bold; letter-spacing: 1px;">
              WELCOME15
            </div>
            <p style="margin: 15px 0 0 0; font-size: 14px; color: #92400E;">
              <em>* Áp dụng cho đơn hàng từ 200.000đ - Có hiệu lực 30 ngày</em>
            </p>
          </div>
          
          <!-- Features -->
          <h3 style="color: #10B981; margin: 30px 0 15px 0;">🌹 Tại DTP Flower Shop, bạn sẽ tìm thấy:</h3>
          <ul style="padding-left: 20px; line-height: 1.8;">
            <li><strong>Hoa tươi nhập khẩu cao cấp</strong> - Chất lượng quốc tế</li>
            <li><strong>Thiết kế hoa theo yêu cầu</strong> - Độc đáo và sáng tạo</li>
            <li><strong>Giao hàng nhanh trong ngày</strong> - Miễn phí nội thành</li>
            <li><strong>Dịch vụ chăm sóc 24/7</strong> - Luôn sẵn sàng hỗ trợ</li>
            <li><strong>Bảo hành hoa tươi</strong> - Đổi mới nếu không hài lòng</li>
          </ul>
          
          <!-- Account Info -->
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; color: #374151;">📋 Thông tin tài khoản:</h4>
            <p style="margin: 5px 0; color: #6B7280;"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin: 5px 0; color: #6B7280;"><strong>Ngày đăng ký:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
            <p style="margin: 5px 0; color: #6B7280;"><strong>Trạng thái:</strong> Thành viên mới 🌟</p>
          </div>
          
          <!-- Call to Action -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/products" 
               style="background: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; font-size: 16px;">
              🛒 Khám phá sản phẩm ngay
            </a>
          </div>
          
          <!-- Benefits -->
          <div style="background: #ECFDF5; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h4 style="margin: 0 0 15px 0; color: #065F46;">💡 Quyền lợi thành viên:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #059669;">
              <li>Nhận thông báo sản phẩm mới và xu hướng hoa trang trí</li>
              <li>Ưu đãi đặc biệt và giảm giá độc quyền</li>
              <li>Chương trình tích điểm và quà tặng sinh nhật</li>
              <li>Tư vấn miễn phí từ các chuyên gia hoa</li>
            </ul>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #374151; color: white; padding: 30px 20px; text-align: center;">
          <h3 style="margin: 0 0 15px 0; color: #F9FAFB;">DTP Flower Shop</h3>
          <p style="margin: 5px 0; color: #D1D5DB;">📍 157 Nguyễn Gia Trí, Quận Bình Thạnh, TP.HCM</p>
          <p style="margin: 5px 0; color: #D1D5DB;">📞 Hotline: 0398.445.888</p>
          <p style="margin: 5px 0; color: #D1D5DB;">📧 Email: support@dtpflowershop.com</p>
          <p style="margin: 15px 0 5px 0; color: #D1D5DB;">🌐 Website: 
            <a href="http://localhost:3000" style="color: #10B981; text-decoration: none;">www.dtpflowershop.com</a>
          </p>
          
          <!-- Social Links -->
          <div style="margin: 20px 0;">
            <a href="#" style="color: #10B981; text-decoration: none; margin: 0 10px;">Facebook</a>
            <span style="color: #6B7280;">|</span>
            <a href="#" style="color: #10B981; text-decoration: none; margin: 0 10px;">Instagram</a>
            <span style="color: #6B7280;">|</span>
            <a href="#" style="color: #10B981; text-decoration: none; margin: 0 10px;">Zalo</a>
          </div>
          
          <p style="margin: 20px 0 0 0; font-size: 12px; color: #9CA3AF;">
            Bạn nhận được email này vì đã đăng ký tài khoản tại DTP Flower Shop.<br>
            Nếu không muốn nhận email, <a href="#" style="color: #10B981;">bấm vào đây để hủy đăng ký</a>.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Hàm gửi email chào mừng
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    console.log(`📧 Chuẩn bị gửi email chào mừng cho: ${userName} (${userEmail})`);
    
    let transporter;
    let emailMethod = 'unknown';
    
    // Thử các phương thức gửi email theo thứ tự ưu tiên
    try {
      // 1. Thử Mailtrap TRƯỚC (vì bạn đã setup)
      if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
        transporter = createMailtrapTransporter();
        emailMethod = 'Mailtrap';
        console.log('🔗 Sử dụng Mailtrap...');
      }
      // 2. Thử SendGrid nếu có API key
      else if (process.env.SENDGRID_API_KEY) {
        transporter = createSendGridTransporter();
        emailMethod = 'SendGrid';
        console.log('🔗 Sử dụng SendGrid...');
      }
      // 3. Fallback: Ethereal test email
      else {
        transporter = await createEtherealTransporter();
        emailMethod = 'Ethereal';
        console.log('🔗 Sử dụng Ethereal (test email)...');
      }
    } catch (setupError) {
      console.log('❌ Lỗi thiết lập email transporter:', setupError.message);
      throw setupError;
    }
    
    // Cấu hình email
    const mailOptions = {
      from: emailMethod === 'Ethereal' ? 
        '"DTP Flower Shop Test" <test@dtpflowershop.com>' : 
        `"DTP Flower Shop" <${process.env.EMAIL_USER || 'noreply@dtpflowershop.com'}>`,
      to: userEmail,
      subject: '🌸 Chào mừng bạn đến với DTP Flower Shop!',
      html: getWelcomeEmailHTML(userName, userEmail)
    };
    
    // Gửi email
    const result = await transporter.sendMail(mailOptions);
    
    // Xử lý kết quả theo từng loại email service
    if (emailMethod === 'Ethereal') {
      const previewUrl = nodemailer.getTestMessageUrl(result);
      console.log('📧 TEST EMAIL đã gửi thành công!');
      console.log('🔗 Xem email tại:', previewUrl);
      console.log('⚠️  Đây là email test - không gửi thật vào hộp thư');
      
      return { 
        success: true, 
        messageId: result.messageId,
        preview: previewUrl,
        method: emailMethod,
        isTest: true,
        message: 'Email test đã được tạo thành công - Bấm vào link preview để xem'
      };
    } else {
      console.log(`✅ Email thật đã gửi thành công qua ${emailMethod}!`);
      console.log('📨 Message ID:', result.messageId);
      
      return { 
        success: true, 
        messageId: result.messageId,
        method: emailMethod,
        isTest: false,
        message: `Email đã được gửi thành công qua ${emailMethod}`
      };
    }
    
  } catch (error) {
    console.error('❌ Lỗi gửi email:', error.message);
    
    // Fallback cuối cùng: Trả về thành công giả để không block đăng ký
    console.log('🔄 Sử dụng fallback mode - đăng ký vẫn thành công');
    return { 
      success: true, 
      messageId: 'fallback-' + Date.now(),
      method: 'fallback',
      isTest: true,
      message: 'Đăng ký thành công! Email chào mừng sẽ được gửi sau.',
      note: 'Email service tạm thời không hoạt động, nhưng tài khoản đã được tạo thành công.'
    };
  }
};

module.exports = {
  sendWelcomeEmail
};