require('dotenv').config();
const { sendWelcomeEmail } = require('./services/emailService');

console.log('🧪 Bắt đầu test email service...');
console.log('📧 EMAIL_USER:', process.env.EMAIL_USER || 'Chưa thiết lập');
console.log('🔑 MAILTRAP_USER:', process.env.MAILTRAP_USER ? 'Đã thiết lập ✅' : 'Chưa thiết lập ❌');
console.log('🔑 MAILTRAP_PASS:', process.env.MAILTRAP_PASS ? 'Đã thiết lập ✅' : 'Chưa thiết lập ❌');

// Test gửi email
const testEmail = async () => {
  try {
    console.log('\n🚀 Đang test gửi email...');
    
    const result = await sendWelcomeEmail('cphoang07@gmail.com', 'Chủ shop DTP');
    
    console.log('\n📊 KẾT QUẢ TEST:');
    console.log('✅ Success:', result.success);
    console.log('📨 Message ID:', result.messageId);
    console.log('🔧 Method:', result.method);
    console.log('📝 Message:', result.message);
    
    if (result.isTest && result.preview) {
      console.log('🔗 Preview URL:', result.preview);
    }
    
    if (result.note) {
      console.log('📌 Note:', result.note);
    }
    
    console.log('\n🎉 Test hoàn thành!');
    
    if (result.method === 'Mailtrap') {
      console.log('\n📬 Kiểm tra email tại: https://mailtrap.io/inboxes');
    }
    
  } catch (error) {
    console.error('\n❌ Lỗi test email:', error.message);
  }
};

testEmail();