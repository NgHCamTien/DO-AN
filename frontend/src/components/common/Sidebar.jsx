import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categoryAPI } from '../api';

const Sidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { slug } = useParams(); // Để highlight category hiện tại

  // Hardcode categories làm fallback
  const fallbackCategories = [
    { _id: '1', name: 'Khuyến mãi gốc', slug: 'khuyen-mai-goc' },
    { _id: '2', name: 'Hoa cảm ơn', slug: 'hoa-cam-on' },
    { _id: '3', name: 'Hoa sinh nhật', slug: 'hoa-sinh-nhat' },
    { _id: '4', name: 'Hoa sự kiện', slug: 'hoa-su-kien' },
    { _id: '5', name: 'Hoa tươi', slug: 'hoa-tuoi' },
    { _id: '6', name: 'Quà tặng', slug: 'qua-tang' },
    { _id: '7', name: 'Thể loại hoa', slug: 'the-loai-hoa' },
    { _id: '8', name: 'Hoa cài áo', slug: 'hoa-cai-ao' },
    { _id: '9', name: 'Hoa cô dâu', slug: 'hoa-co-dau' },
    { _id: '10', name: 'Hoa ngày phụ nữ', slug: 'hoa-ngay-phu-nu' }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Sidebar: Fetching categories...');
      const response = await categoryAPI.getCategories();
      console.log('Sidebar: Categories response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        console.warn('Sidebar: Invalid categories data, using fallback');
        setCategories(fallbackCategories);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Sidebar: Error fetching categories:', error);
      setError('Không thể tải danh mục');
      
      // Sử dụng fallback categories nếu API lỗi
      setCategories(fallbackCategories);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <aside className="sidebar bg-white p-3 max-w-xs ml-5 mt-4">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-700 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải danh mục...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar bg-white p-3 max-w-xs ml-5 mt-4">
      <h3 className="font-bold text-lg mb-4 text-red-500">Khuyến mãi góc</h3>
      
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded mb-4 text-sm">
          <p>{error}</p>
          <button 
            onClick={fetchCategories}
            className="text-blue-600 hover:text-blue-800 underline text-xs mt-1"
          >
            Thử lại
          </button>
        </div>
      )}
      
      <ul className="list-none p-0">
        {categories.map((category) => (
          <li 
            key={category._id || category.id}
            className={`py-4 px-4 border-b border-gray-200 bg-gray-100 cursor-pointer transition-all duration-300 hover:bg-gray-200 ${
              slug === category.slug ? 'text-red-600 font-bold bg-red-50' : 'text-green-700'
            }`}
          >
            <Link 
              to={`/category/${category.slug}`}
              className="block w-full no-underline"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
      
      {/* Debug info - sẽ ẩn trong production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
          <p>Debug: {categories.length} categories loaded</p>
          <p>Current slug: {slug || 'none'}</p>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;