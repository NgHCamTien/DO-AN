// // src/pages/admin/Login.jsx
// import React, { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../../context/AuthContext';

// const AdminLogin = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
  
//   const { login } = useContext(AuthContext);
//   const navigate = useNavigate();
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
    
//     try {
//       console.log('Attempting admin login with:', email, password);
      
//       // Sử dụng hàm login từ AuthContext (đã có sẵn API call)
//       const result = await login(email, password);
//       console.log('Login result:', result);
      
//       if (result && result.success) {
//         // Kiểm tra role admin
//         if (result.user.role === 'admin') {
//           console.log('✅ Admin login successful');
//           // Chuyển hướng đến dashboard
//           navigate('/admin/dashboard');
//         } else {
//           setError('Bạn không có quyền truy cập trang quản trị');
//         }
//       } else {
//         setError(result?.message || 'Đăng nhập thất bại');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
//     }
    
//     setLoading(false);
//   };
  
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <div className="text-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-800">DTP Flower Shop</h1>
//           <p className="text-gray-600">Đăng nhập quản trị</p>
//         </div>
        
//         {error && (
//           <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
//             {error}
//           </div>
//         )}
        
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
//               placeholder="cphoang07@gmail.com"
//               required
//             />
//           </div>
          
//           <div className="mb-6">
//             <label htmlFor="password" className="block text-gray-700 mb-2">Mật khẩu</label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
//               placeholder="123456"
//               required
//             />
//           </div>
          
//           <button 
//             type="submit"
//             className="w-full bg-green-700 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
//             disabled={loading}
//           >
//             {loading ? 'Đang xử lý...' : 'Đăng nhập'}
//           </button>
//         </form>
        
//         <div className="mt-4 text-center">
//           <a href="/" className="text-green-700 hover:underline">Quay lại trang chủ</a>
//         </div>
        
//         {/* Debug info */}
//         <div className="mt-4 text-xs text-gray-500 text-center">
//           <p>Admin test: cphoang07@gmail.com / 123456</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminLogin;