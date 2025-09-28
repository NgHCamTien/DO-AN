import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    if (!email) {
      setError('Vui lòng nhập email');
      setLoading(false);
      return;
    }

    try {
      console.log('Gửi yêu cầu forgot password cho:', email);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      console.log('Kết quả:', data);

      if (data.success) {
        setMessage(data.message);
        setEmailSent(true);
        
        // Nếu là test email, hiển thị thông tin thêm
        if (data.emailInfo?.isTest && data.emailInfo?.previewUrl) {
          setMessage(data.message + ' (Đây là email test - bấm vào link dưới để xem)');
          console.log('🔗 Preview URL:', data.emailInfo.previewUrl);
          
          // Tạo button để mở preview (chỉ cho development)
          setTimeout(() => {
            const openPreview = window.confirm(
              'Đây là môi trường test. Bấm OK để mở email preview, Cancel để bỏ qua.'
            );
            if (openPreview && data.emailInfo.previewUrl) {
              window.open(data.emailInfo.previewUrl, '_blank');
            }
          }, 1000);
        }
      } else {
        setError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi:', error);
      setError('Có lỗi xảy ra khi kết nối server. Vui lòng thử lại.');
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      
      <main className="flex-1 p-4 max-w-md mx-auto my-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🔐 Quên mật khẩu
            </h1>
            <p className="text-gray-600 text-sm">
              Nhập email của bạn để nhận link đặt lại mật khẩu
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4 border border-green-200">
              <div className="flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">✅</span>
                <div>
                  <div className="font-medium">Thành công!</div>
                  <div className="text-sm mt-1">{message}</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 border border-red-200">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                <div>{error}</div>
              </div>
            </div>
          )}

          {!emailSent ? (
            /* Form nhập email */
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập email của bạn"
                  disabled={loading}
                  required
                />
                <p className="text-gray-500 text-xs mt-2">
                  Chúng tôi sẽ gửi link đặt lại mật khẩu đến email này
                </p>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Đang gửi email...
                  </span>
                ) : (
                  '📧 Gửi email đặt lại mật khẩu'
                )}
              </button>
            </form>
          ) : (
            /* Thông báo đã gửi email */
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Email đã được gửi!
              </h2>
              <p className="text-gray-600 mb-6">
                Kiểm tra hộp thư của bạn và bấm vào link trong email để đặt lại mật khẩu.
              </p>
              
              {/* Tips */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                <h4 className="font-medium text-blue-800 mb-2">💡 Mẹo:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Kiểm tra cả thư mục spam/junk</li>
                  <li>• Link có hiệu lực trong 15 phút</li>
                  <li>• Nếu không nhận được, thử gửi lại</li>
                </ul>
              </div>

              <button 
                onClick={() => {
                  setEmailSent(false);
                  setMessage('');
                  setEmail('');
                }}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                🔄 Gửi lại email
              </button>
            </div>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <Link 
              to="/login" 
              className="text-green-700 text-sm hover:underline flex items-center justify-center"
            >
              ← Quay lại trang đăng nhập
            </Link>
          </div>

          {/* Help */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Cần hỗ trợ? Liên hệ{' '}
              <a href="mailto:support@dtpflowershop.com" className="text-green-700 hover:underline">
                support@dtpflowershop.com
              </a>
              {' '}hoặc gọi{' '}
              <a href="tel:0398445888" className="text-green-700 hover:underline">
                0398.445.888
              </a>
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ForgotPassword;