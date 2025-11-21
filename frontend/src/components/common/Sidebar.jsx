import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { categoryAPI } from '../api';

const Sidebar = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { slug } = useParams();

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
      <aside className="bg-[#faf8f6] p-5 max-w-xs ml-5 mt-4 rounded-2xl border border-[#f0e8e3] shadow-sm">
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#e06c7f] mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Đang tải danh mục...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="bg-[#faf8f6] p-5 max-w-xs ml-5 mt-4 rounded-2xl border border-[#f0e8e3] shadow-sm">
  <h3 className="font-semibold text-lg mb-4 text-[#e06c7f] border-b border-[#e4d9d5] pb-2">
    Danh mục sản phẩm
  </h3>

  {/* 🔥 NÚT GỬI EMAIL ĐẶT Ở ĐÂY */}
  <Link
    to="/admin/email"
    className="block text-center bg-[#e06c7f] text-white py-3 rounded-lg mb-4 hover:bg-[#d35d75] transition"
  >
    📩 Gửi Email Khuyến Mãi
  </Link>

  <ul className="list-none p-0">
    {categories.map((category) => (
      <li
        key={category._id || category.id}
        className={`py-3 px-4 border-b border-[#f0e8e3] cursor-pointer transition-all duration-200 rounded-lg
          ${
            slug === category.slug
              ? 'text-[#e06c7f] font-semibold bg-[#fde8eb]'
              : 'text-gray-700 hover:bg-[#fceef0] hover:text-[#e06c7f]'
          }`}
      >
        <Link to={`/category/${category.slug}`} className="block w-full no-underline">
          {category.name}
        </Link>
      </li>
    ))}
  </ul>
</aside>

  );
};

export default Sidebar;
