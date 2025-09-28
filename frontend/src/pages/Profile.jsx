import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { AuthContext } from '../context/AuthContext';
import { orderAPI, authAPI } from '../api';

const Profile = () => {
  const { user, updateProfile, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Fetching orders for user:', user?.email);
      
      const response = await orderAPI.getMyOrders();
      
      console.log('📦 Orders API response:', response);
      console.log('📦 Response data:', response.data);
      
      // Xử lý response format từ axios
      let ordersData = [];
      
      if (response.data) {
        // Nếu response có cấu trúc { success: true, data: [...] }
        if (response.data.success && response.data.data) {
          ordersData = response.data.data;
        }
        // Nếu response là array trực tiếp
        else if (Array.isArray(response.data)) {
          ordersData = response.data;
        }
        // Nếu response có cấu trúc khác
        else if (response.data.orders) {
          ordersData = response.data.orders;
        }
      }
      
      console.log('📋 Processed orders data:', ordersData);
      setOrders(ordersData);
      
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      
      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        // Server trả về response với status code lỗi
        const status = error.response.status;
        const message = error.response.data?.message || error.message;
        
        if (status === 401) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          logout();
        } else if (status === 404) {
          // Không có đơn hàng nào - không phải lỗi
          setOrders([]);
          setError('');
        } else {
          setError(`Lỗi ${status}: ${message}`);
        }
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        // Lỗi khác
        setError(`Lỗi: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdateLoading(true);
      console.log('Updating profile with data:', profileData);
      
      const result = await updateProfile(profileData);
      console.log('Update result:', result);
      
      if (result.success) {
        setIsEditing(false);
        alert('Cập nhật thông tin thành công!');
      } else {
        alert(result.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Có lỗi xảy ra khi cập nhật thông tin!');
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Chờ xử lý';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'processing':
        return 'Đang xử lý';
      case 'shipped':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status || 'Không xác định';
    }
  };

  const showOrderDetails = (order) => {
    const orderItems = order.orderItems?.map(item => 
      `• ${item.name} - SL: ${item.quantity} - Giá: ${item.price?.toLocaleString('vi-VN')}₫`
    ).join('\n') || 'Không có sản phẩm';

    const details = `
CHI TIẾT ĐƠN HÀNG

Mã đơn: #${order._id?.slice(-8).toUpperCase()}
Ngày đặt: ${formatOrderDate(order.createdAt)}
Trạng thái: ${getStatusText(order.status)}

SẢN PHẨM:
${orderItems}

ĐỊA CHỈ GIAO HÀNG:
${order.shippingAddress?.address || 'Không có địa chỉ'}
${order.shippingAddress?.city || ''}
SĐT: ${order.shippingAddress?.phone || 'Không có SĐT'}

THANH TOÁN:
Phương thức: ${order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng' : order.paymentMethod}
Tổng tiền: ${order.totalPrice?.toLocaleString('vi-VN')}₫
    `.trim();

    alert(details);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">Bạn chưa đăng nhập</h2>
            <Link to="/login" className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-600">
              Đăng nhập ngay
            </Link>
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
      
      <main className="flex-1 p-4 max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Xin chào, {user.name}!</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản và đơn hàng của bạn</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'profile' 
                      ? 'bg-green-100 text-green-700 font-medium' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  📋 Thông tin cá nhân
                </button>
                
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'orders' 
                      ? 'bg-green-100 text-green-700 font-medium' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  📦 Đơn hàng của tôi
                  {orders.length > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {orders.length}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings' 
                      ? 'bg-green-100 text-green-700 font-medium' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  ⚙️ Cài đặt tài khoản
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              
              {/* Tab: Thông tin cá nhân */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Chỉnh sửa
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ
                        </label>
                        <textarea
                          name="address"
                          value={profileData.address}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={updateLoading}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                        >
                          {updateLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setProfileData({
                              name: user.name || '',
                              email: user.email || '',
                              phone: user.phone || '',
                              address: user.address || ''
                            });
                          }}
                          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Họ và tên
                          </label>
                          <p className="text-gray-800 font-medium">{user.name || 'Chưa cập nhật'}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Email
                          </label>
                          <p className="text-gray-800 font-medium">{user.email}</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">
                            Số điện thoại
                          </label>
                          <p className="text-gray-800 font-medium">{user.phone || 'Chưa cập nhật'}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Địa chỉ
                        </label>
                        <p className="text-gray-800 font-medium">{user.address || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Đơn hàng */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Đơn hàng của tôi</h2>
                    <button 
                      onClick={fetchOrders}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      🔄 Làm mới
                    </button>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">⚠️</span>
                        <span>{error}</span>
                      </div>
                    </div>
                  )}
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-700 mx-auto mb-2"></div>
                      <p>Đang tải đơn hàng...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl text-gray-300 mb-4">📦</div>
                      <h3 className="text-xl font-bold text-gray-600 mb-2">Chưa có đơn hàng nào</h3>
                      <p className="text-gray-500 mb-4">Bạn chưa thực hiện đơn hàng nào</p>
                      <Link to="/product" className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-600">
                        Mua sắm ngay
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg">Đơn hàng #{order._id?.slice(-8)}</h3>
                              <p className="text-gray-500">Ngày đặt: {formatOrderDate(order.createdAt)}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">
                              Sản phẩm: {order.orderItems?.length || 0} món
                            </p>
                            <p className="text-lg font-bold text-red-600">
                              Tổng tiền: {order.totalPrice?.toLocaleString('vi-VN')}₫
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => showOrderDetails(order)}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                            >
                              Xem chi tiết
                            </button>
                            
                            {order.status === 'delivered' && (
                              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm">
                                Mua lại
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Cài đặt */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt tài khoản</h2>
                  
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-bold text-lg mb-2">Đổi mật khẩu</h3>
                      <p className="text-gray-600 mb-4">Cập nhật mật khẩu để bảo mật tài khoản</p>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Đổi mật khẩu
                      </button>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-bold text-lg mb-2">Nhận thông báo email</h3>
                      <p className="text-gray-600 mb-4">Nhận email thông báo về đơn hàng và khuyến mãi</p>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Nhận email thông báo</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;