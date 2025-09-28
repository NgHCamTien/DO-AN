import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Since we don't have a users API endpoint yet, we'll show the current admin user
      // In a real application, you would fetch from /api/users
      const storedUser = JSON.parse(localStorage.getItem('userInfo'));
      if (storedUser) {
        setUsers([{
          _id: storedUser._id,
          name: storedUser.name,
          email: storedUser.email,
          role: storedUser.role,
          createdAt: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { text: 'Quản trị viên', class: 'bg-red-100 text-red-800' },
      user: { text: 'Người dùng', class: 'bg-blue-100 text-blue-800' }
    };
    
    const config = roleConfig[role] || roleConfig.user;
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.class}`}>
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Admin Header */}
      <header className="bg-green-800 text-white py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">DTP Flower Shop - Quản trị</h1>
        </div>
        <div className="flex items-center gap-4">
          <span>{currentUser?.name || 'Admin'}</span>
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
                <Link to="/admin/orders" className="block py-2 px-4 rounded hover:bg-gray-100">
                  Quản lý đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/admin/categories" className="block py-2 px-4 rounded hover:bg-gray-100">
                  Quản lý danh mục
                </Link>
              </li>
              <li>
                <Link to="/admin/users" className="block py-2 px-4 rounded bg-green-100 text-green-800 font-medium">
                  Quản lý người dùng
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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center my-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-500">Chưa có người dùng nào</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900">Tổng người dùng</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{users.length}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900">Quản trị viên</h3>
                  <p className="text-3xl font-bold text-red-600 mt-2">
                    {users.filter(user => user.role === 'admin').length}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900">Người dùng thường</h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {users.filter(user => user.role === 'user').length}
                  </p>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user._id !== currentUser?._id ? (
                            <>
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                Sửa
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Khóa
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-400">Tài khoản hiện tại</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Note */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Lưu ý:</strong> Hiện tại chỉ hiển thị tài khoản admin hiện tại. 
                      Để xem đầy đủ danh sách người dùng, cần tạo API endpoint để lấy dữ liệu từ collection users trong MongoDB.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;