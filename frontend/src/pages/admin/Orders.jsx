import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      
      if (!token) {
        setError('Không tìm thấy token xác thực');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/orders?page=${currentPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setTotalPages(data.pages || 1);
      } else if (response.status === 401) {
        setError('Phiên đăng nhập đã hết hạn');
      } else if (response.status === 404) {
        // No orders found - this is normal
        setOrders([]);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Lỗi kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('Cập nhật trạng thái thành công!');
        fetchOrders(); // Refresh the list
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Không thể cập nhật trạng thái đơn hàng');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Lỗi khi cập nhật trạng thái');
    }
  };

  // Chuyển đổi trạng thái đơn hàng sang tiếng Việt
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

  // Lấy màu cho trạng thái đơn hàng
  const getStatusColor = (status) => {
    const colorMap = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusOptions = (currentStatus) => {
    const statusFlow = {
      'pending': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': []
    };
    
    return statusFlow[currentStatus] || [];
  };

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = !searchTerm || 
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Get order statistics
  const getOrderStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0)
    };
  };

  const stats = getOrderStats();

  const showOrderDetails = (order) => {
    const orderItems = order.orderItems?.map(item => 
      `• ${item.name} - Số lượng: ${item.quantity} - Giá: ${item.price?.toLocaleString('vi-VN')}₫`
    ).join('\n') || 'Không có sản phẩm';

    const details = `
CHI TIẾT ĐỦN HÀNG

Mã đơn: ${order._id}
Khách hàng: ${order.user?.name || 'Không có tên'}
Email: ${order.user?.email || 'Không có email'}
Ngày đặt: ${formatDate(order.createdAt)}
Trạng thái: ${getStatusText(order.status)}

SẢN PHẨM:
${orderItems}

ĐỊA CHỈ GIAO HÀNG:
${order.shippingAddress?.address || 'Không có địa chỉ'}
${order.shippingAddress?.city || ''}
SĐT: ${order.shippingAddress?.phone || 'Không có SĐT'}

THANH TOÁN:
Phương thức: ${order.paymentMethod || 'Chưa xác định'}
Tổng tiền: ${order.totalPrice?.toLocaleString('vi-VN')}₫
    `.trim();

    alert(details);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Admin Header */}
      <header className="bg-green-800 text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">DTP Flower Shop - Quản trị</h1>
        </div>
        <div className="flex items-center gap-4">
          <span>{user?.name || 'Admin'}</span>
          <button 
            onClick={logout}
            className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
          >
            Đăng xuất
          </button>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <Link to="/admin/dashboard" className="block py-2 px-4 rounded hover:bg-gray-100">
                  Tổng quan
                </Link>
              </li>
              <li>
                <Link to="/admin/products" className="block py-2 px-4 rounded hover:bg-gray-100">
                  Quản lý sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/admin/orders" className="block py-2 px-4 rounded bg-green-100 text-green-800 font-medium">
                  Quản lý đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/admin/categories" className="block py-2 px-4 rounded hover:bg-gray-100">
                  Quản lý danh mục
                </Link>
              </li>
              <li>
                <Link to="/" className="block py-2 px-4 rounded hover:bg-gray-100 text-blue-700" target="_blank">
                  Xem trang web
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h2>
          
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Tổng đơn hàng</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Chờ xử lý</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Đang xử lý</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Đang giao</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Đã giao</h3>
              <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500">Doanh thu</h3>
              <p className="text-lg font-bold text-green-600">
                {stats.totalRevenue.toLocaleString('vi-VN')}₫
              </p>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên khách hàng, email hoặc mã đơn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipped">Đang giao</option>
                  <option value="delivered">Đã giao</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>
              <div>
                <button
                  onClick={fetchOrders}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Làm mới
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center my-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg mb-2">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Không tìm thấy đơn hàng phù hợp' 
                  : 'Chưa có đơn hàng nào'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <p className="text-gray-400 text-sm">
                  Đơn hàng sẽ xuất hiện ở đây khi khách hàng đặt mua sản phẩm
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Orders Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mã đơn
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Khách hàng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày đặt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sản phẩm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tổng tiền
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map(order => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              #{order._id.slice(-8).toUpperCase()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {order.user?.name || 'Khách hàng'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user?.email || 'Không có email'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {order.orderItems?.length > 0 ? (
                                <div>
                                  <div className="font-medium">
                                    {order.orderItems[0].name}
                                  </div>
                                  {order.orderItems.length > 1 && (
                                    <div className="text-gray-500">
                                      +{order.orderItems.length - 1} sản phẩm khác
                                    </div>
                                  )}
                                </div>
                              ) : (
                                'Không có sản phẩm'
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.totalPrice?.toLocaleString('vi-VN')}₫
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => showOrderDetails(order)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Chi tiết
                              </button>
                              {getStatusOptions(order.status).length > 0 && (
                                <select
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                  className="text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500 min-w-24"
                                >
                                  <option value={order.status}>
                                    {getStatusText(order.status)}
                                  </option>
                                  {getStatusOptions(order.status).map(status => (
                                    <option key={status} value={status}>
                                      {getStatusText(status)}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    <span className="text-sm text-gray-600">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;