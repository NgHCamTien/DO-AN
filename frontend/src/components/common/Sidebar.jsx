import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categoryAPI } from '../api';

const Sidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { slug } = useParams(); // highlight category hiện tại

  // Hardcode fallback
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
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
      } else {
        setCategories(fallbackCategories);
      }
      setLoading(false);
    } catch (error) {
      console.error('Sidebar: Error fetching categories:', error);
      setError('Không thể tải danh mục');
      setCategories(fallbackCategories);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <aside className="sidebar bg-white p-4 max-w-xs ml-5 mt-4 shadow rounded border">
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-700 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải danh mục...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar bg-white p-4 max-w-xs ml-5 mt-4 shadow rounded border border-gray-200">
      <h3 className="font-bold text-lg mb-4 text-green-700 border-b pb-2">
        Danh mục sản phẩm
      </h3>

      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded mb-4 text-sm">
          <p>{error}</p>
          <button 
            onClick={fetchCategories}
            className="text-green-700 hover:text-green-900 underline text-xs mt-1"
          >
            Thử lại
          </button>
        </div>
      )}
      
      <ul className="list-none p-0">
        {categories.map((category) => (
          <li 
            key={category._id || category.id}
            className={`py-3 px-4 border-b border-gray-200 cursor-pointer transition-all duration-200 
              ${slug === category.slug 
                ? 'text-green-800 font-semibold bg-green-100' 
                : 'text-gray-700 hover:bg-green-50 hover:text-green-700'}`}
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
    </aside>
  );
};

export default Sidebar;
