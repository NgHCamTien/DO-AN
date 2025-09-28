import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State cho hiện/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Attempting login with:', { email, password: '***' });
      
      const result = await login(email, password);
      console.log('Login result:', result);
      
      if (result && result.success) {
        console.log('Login successful, navigating to home');
        navigate('/');
      } else {
        const errorMessage = result?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.';
        console.error('Login failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    }
    
    setLoading(false);
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // CHỈ KIỂM TRA 3 TRƯỜNG: name, email, password
    if (!name || !email || !password) {
      setError('Vui lòng nhập đầy đủ họ tên, email và mật khẩu');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Attempting register with:', { name, email, subscribeNewsletter });
      
      // Chỉ truyền name, email, password + newsletter subscription
      const result = await register(name, email, password, '', '', subscribeNewsletter);
      console.log('Register result:', result);
      
      if (result && result.success) {
        console.log('Register successful, navigating to home');
        navigate('/');
      } else {
        const errorMessage = result?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        console.error('Register failed:', errorMessage);
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Register error:', error);
      setError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
    }
    
    setLoading(false);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Navbar />
      
      <main className="flex-1 p-4 max-w-md mx-auto my-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="tabs flex mb-6 border-b">
            <button 
              className={`flex-1 py-3 font-medium transition-colors ${
                activeTab === 'login' ? 'text-green-700 border-b-2 border-green-700' : 'text-gray-500 hover:text-green-600'
              }`}
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
            >
              Đăng nhập
            </button>
            <button 
              className={`flex-1 py-3 font-medium transition-colors ${
                activeTab === 'register' ? 'text-green-700 border-b-2 border-green-700' : 'text-gray-500 hover:text-green-600'
              }`}
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
            >
              Đăng ký
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 border border-red-200">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}
          
          {activeTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập email của bạn"
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 mb-2 font-medium">Mật khẩu</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nhập mật khẩu"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Đang đăng nhập...
                  </span>
                ) : (
                  'Đăng nhập'
                )}
              </button>
              
              <div className="text-center mt-4">
                <Link 
                  to="/forgot-password" 
                  className="text-green-700 text-sm hover:underline transition-colors"
                >
                  🔐 Quên mật khẩu?
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              {/* CHỈ 3 TRƯỜNG CƠ BẢN */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập họ tên của bạn"
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="reg-email" className="block text-gray-700 mb-2 font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="reg-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nhập email của bạn"
                  disabled={loading}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="reg-password" className="block text-gray-700 mb-2 font-medium">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    id="reg-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Tạo mật khẩu"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    disabled={loading}
                  >
                    {showRegPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Newsletter Subscription */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="newsletter"
                    checked={subscribeNewsletter}
                    onChange={(e) => setSubscribeNewsletter(e.target.checked)}
                    className="mt-1 mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <div>
                    <label htmlFor="newsletter" className="text-green-800 font-medium cursor-pointer">
                      📧 Đăng ký nhận tin khuyến mãi
                    </label>
                    <p className="text-green-700 text-sm mt-1">
                      Nhận các ưu đãi độc quyền, thông tin sản phẩm mới và chương trình khuyến mãi hấp dẫn qua email.
                    </p>
                    <p className="text-green-600 text-xs mt-2">
                      ✨ Tặng ngay mã giảm giá 15% cho đơn hàng đầu tiên
                    </p>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Đang đăng ký...
                  </span>
                ) : (
                  'Đăng ký tài khoản'
                )}
              </button>
              
              <p className="text-xs text-gray-600 mt-3 text-center">
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <Link to="/terms" className="text-green-700 hover:underline">Điều khoản dịch vụ</Link>
                {' '}và{' '}
                <Link to="/privacy" className="text-green-700 hover:underline">Chính sách bảo mật</Link>
                {' '}của chúng tôi.
              </p>
            </form>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;