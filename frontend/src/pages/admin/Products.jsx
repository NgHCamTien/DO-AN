import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null); // Track which product is being deleted
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products || []);
      } else {
        setError('Không thể tải danh sách sản phẩm');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  // SỬA FUNCTION handleDelete
  const handleDelete = async (productId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      console.log('=== FRONTEND DELETE DEBUG ===');
      console.log('Deleting product ID:', productId);
      
      setDeleteLoading(productId); // Set loading state for this specific product
      
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      console.log('User info from localStorage:', userInfo ? 'Found' : 'Not found');
      console.log('Token exists:', userInfo?.token ? 'Yes' : 'No');
      console.log('User role:', userInfo?.role);
      
      if (!userInfo || !userInfo.token) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        logout();
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Update products list by removing the deleted product
        setProducts(prevProducts => prevProducts.filter(product => product._id !== productId));
        alert('Xóa sản phẩm thành công!');
        console.log('✅ Product deleted successfully from frontend');
      } else {
        console.error('❌ Delete failed:', data.message);
        
        // Handle specific error cases
        if (response.status === 401) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          logout();
        } else if (response.status === 403) {
          alert('Bạn không có quyền xóa sản phẩm này.');
        } else if (response.status === 404) {
          alert('Không tìm thấy sản phẩm.');
          // Remove from list anyway since it doesn't exist
          setProducts(prevProducts => prevProducts.filter(product => product._id !== productId));
        } else {
          alert(`Không thể xóa sản phẩm: ${data.message || 'Lỗi không xác định'}`);
        }
      }
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      alert('Lỗi kết nối đến server. Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      setDeleteLoading(null); // Clear loading state
    }
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
                <Link to="/admin/products" className="block py-2 px-4 rounded bg-green-100 text-green-800 font-medium">
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
            <h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>
            <Link 
              to="/admin/products/new" 
              className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Thêm sản phẩm mới
            </Link>
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
          ) : products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-500">Chưa có sản phẩm nào</p>
              <Link 
                to="/admin/products/new"
                className="inline-block mt-4 bg-green-700 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Thêm sản phẩm đầu tiên
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.images && product.images[0] && (
                            <img 
                              src={`http://localhost:5000${product.images[0]}`} 
                              alt={product.name}
                              className="h-10 w-10 rounded-full mr-3 object-cover"
                              onError={(e) => {
                                e.target.src = '/api/placeholder/40/40';
                              }}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {product.name && product.name.length > 50 ? product.name.substring(0, 50) + '...' : product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.category?.name || 'Chưa phân loại'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {product.discountPrice ? (
                            <>
                              <span className="line-through text-gray-500 text-sm">
                                {product.price?.toLocaleString('vi-VN')}₫
                              </span>
                              <br />
                              <span className="text-red-600 font-medium">
                                {product.discountPrice?.toLocaleString('vi-VN')}₫
                              </span>
                            </>
                          ) : (
                            <span>{product.price?.toLocaleString('vi-VN')}₫</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          product.isFeatured 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.isFeatured ? 'Nổi bật' : 'Thường'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link 
                          to={`/admin/products/edit/${product._id}`}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deleteLoading === product._id}
                          className={`${
                            deleteLoading === product._id 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:text-red-900'
                          }`}
                        >
                          {deleteLoading === product._id ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;