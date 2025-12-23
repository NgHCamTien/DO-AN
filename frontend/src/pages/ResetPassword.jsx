import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState('');
  
  const { token } = useParams();
  const navigate = useNavigate();

  // Kiểm tra độ mạnh mật khẩu
  const checkPasswordStrength = (pwd) => {
    if (pwd.length < 6) {
      return { strength: 'weak', message: 'Quá ngắn (tối thiểu 6 ký tự)', color: 'text-red-500' };
    }
    if (pwd.length < 8) {
      return { strength: 'medium', message: 'Trung bình', color: 'text-yellow-500' };
    }
    if (pwd.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)) {
      return { strength: 'strong', message: 'Mạnh', color: 'text-green-500' };
    }
    if (pwd.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
      return { strength: 'good', message: 'Khá tốt', color: 'text-blue-500' };
    }
    return { strength: 'medium', message: 'Trung bình', color: 'text-yellow-500' };
  };

  useEffect(() => {
    if (password) {
      const result = checkPasswordStrength(password);
      setPasswordStrength(result);
    } else {
      setPasswordStrength('');
    }
  }, [password]);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Token không hợp lệ');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    // Validation
    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      console.log('Đặt lại mật khẩu với token:', token);

      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      console.log('Kết quả:', data);

      if (data.success) {
        setMessage(data.message);
        
        // Chuyển hướng về trang login sau 3 giây
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        
        // Nếu token không hợp lệ
        if (data.message.includes('Token không hợp lệ') || data.message.includes('hết hạn')) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      console.error('Lỗi:', error);
      setError('Có lỗi xảy ra khi kết nối server. Vui lòng thử lại.');
    }

    setLoading(false);
  };

  // Nếu token không hợp lệ
  if (!tokenValid) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <Navbar />
        
        <main className="flex-1 p-4 max-w-md mx-auto my-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Link không hợp lệ
            </h1>
            <p className="text-gray-600 mb-6">
              Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. 
              Vui lòng yêu cầu đặt lại mật khẩu mới.
            </p>
            
            <div className="space-y-3">
              <Link 
                to="/forgot-password"
                className="block w-full bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                🔄 Yêu cầu đặt lại mật khẩu mới
              </Link>
              
              <Link 
                to="/login"
                className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Quay lại trang đăng nhập
              </Link>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      
      <main className="flex-1 p-4 max-w-md mx-auto my-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              🔑 Đặt lại mật khẩu
            </h1>
            <p className="text-gray-600 text-sm">
              Tạo mật khẩu mới cho tài khoản của bạn
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
                  <div className="text-sm mt-2 text-green-600">
                    Đang chuyển hướng về trang đăng nhập...
                  </div>
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

          {!message && (
            <form onSubmit={handleSubmit}>
              {/* Mật khẩu mới */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 mb-2 font-medium">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu mới"
                  disabled={loading}
                  required
                />
                
                {/* Hiển thị độ mạnh mật khẩu */}
                {passwordStrength && (
                  <div className={`text-xs mt-2 ${passwordStrength.color}`}>
                    Độ mạnh: {passwordStrength.message}
                  </div>
                )}
              </div>

              {/* Xác nhận mật khẩu */}
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 mb-2 font-medium">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập lại mật khẩu mới"
                  disabled={loading}
                  required
                />
                
                {/* Hiển thị trạng thái khớp mật khẩu */}
                {confirmPassword && (
                  <div className={`text-xs mt-2 ${
                    password === confirmPassword ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {password === confirmPassword ? '✓ Mật khẩu khớp' : '✗ Mật khẩu không khớp'}
                  </div>
                )}
              </div>

              {/* Yêu cầu mật khẩu */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-blue-800 mb-2">🛡️ Yêu cầu mật khẩu:</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Tối thiểu 6 ký tự</li>
                  <li>• Nên có chữ hoa, chữ thường, số</li>
                  <li>• Không sử dụng thông tin cá nhân dễ đoán</li>
                  <li>• Không sử dụng lại mật khẩu cũ</li>
                </ul>
              </div>
              
              <button 
                type="submit"
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                className="w-full bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Đang đặt lại mật khẩu...
                  </span>
                ) : (
                  '🔐 Đặt lại mật khẩu'
                )}
              </button>
            </form>
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

export default ResetPassword;