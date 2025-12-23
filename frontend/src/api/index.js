import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication token to requests
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    
    if (userInfo) {
      try {
        const parsedInfo = JSON.parse(userInfo);
        if (parsedInfo.token) {
          config.headers.Authorization = `Bearer ${parsedInfo.token}`;
        }
      } catch (error) {
        console.error('Error parsing user info in interceptor:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Đăng nhập
  login: (email, password) => api.post('/auth/login', { email, password }),
  
  // Đăng ký
  register: (userData) => api.post('/auth/register', userData),
  
  // Lấy thông tin người dùng
  getUserProfile: () => api.get('/auth/profile'),
  
  // Cập nhật thông tin người dùng
  updateUserProfile: (userData) => api.put('/auth/profile', userData)
};

// Products API
// Products API
export const productAPI = {
  // Lấy sản phẩm có filter
  getProducts: (params) => {
    return api.get("/products", { params });
  },


  
  // Tìm kiếm sản phẩm với nhiều tham số

  // Lấy gợi ý tìm kiếm
  getSearchSuggestions: (query) => {
    return api.get(`/products/search-suggestions?q=${encodeURIComponent(query)}`);
  },
  
  // Lấy chi tiết sản phẩm
  getProductById: (id) => api.get(`/products/${id}`),
  
  // Lấy sản phẩm nổi bật
  getFeaturedProducts: (limit = 6) => api.get(`/products/featured?limit=${limit}`),
  
  // Lấy sản phẩm liên quan
  getRelatedProducts: (id) => api.get(`/products/${id}/related`),
  
  // Thêm sản phẩm mới (admin)
  createProduct: (productData) => {
    const formData = new FormData();
    
    // Thêm các trường thông tin vào formData
    Object.keys(productData).forEach(key => {
      if (key === 'images') {
        productData.images.forEach(image => {
          formData.append('images', image);
        });
      } else {
        formData.append(key, productData[key]);
      }
    });
    
    return api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Cập nhật sản phẩm (admin)
  updateProduct: (id, productData) => {
    const formData = new FormData();
    
    // Thêm các trường thông tin vào formData
    Object.keys(productData).forEach(key => {
      if (key === 'images' && productData.images instanceof FileList) {
        Array.from(productData.images).forEach(image => {
          formData.append('images', image);
        });
      } else {
        formData.append(key, productData[key]);
      }
    });
    
    return api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  
  // Xóa sản phẩm (admin)
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

// Category API
export const categoryAPI = {
  // Lấy tất cả danh mục
  getCategories: () => api.get('/categories'),
  
  // Lấy chi tiết danh mục
  getCategoryBySlug: (slug) => api.get(`/categories/${slug}`),
  
  // Lấy sản phẩm theo danh mục
  getProductsByCategory: (slug, page = 1) => api.get(`/categories/${slug}/products?page=${page}`)
};

// Orders API
export const orderAPI = {
  // Tạo đơn hàng mới
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // Lấy lịch sử đơn hàng
  getMyOrders: () => api.get('/orders/myorders'),
  
  // Lấy chi tiết đơn hàng
  getOrderById: (id) => api.get(`/orders/${id}`),
  
  // Thanh toán đơn hàng
  payOrder: (id, paymentResult) => api.put(`/orders/${id}/pay`, paymentResult),
  
  // Cập nhật trạng thái đơn hàng (admin)
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status })
};

// Coupons API
export const couponAPI = {
  // Validate mã giảm giá
  validateCoupon: (code, orderAmount, userId = null) => 
    api.post('/coupons/validate', { code, orderAmount, userId }),
  
  // Lấy mã giảm giá khả dụng
  getAvailableCoupons: (orderAmount = null) => {
    const params = orderAmount ? `?orderAmount=${orderAmount}` : '';
    return api.get(`/coupons/available${params}`);
  },
  
  // Áp dụng mã giảm giá (ghi nhận sử dụng)
  applyCoupon: (code, userId = null, orderId = null) => 
    api.post('/coupons/apply', { code, userId, orderId }),
  
  // Lấy thống kê mã giảm giá (admin)
  getCouponStats: () => api.get('/coupons/stats'),
  
  // Tạo mã giảm giá mới (admin)
  createCoupon: (couponData) => api.post('/coupons', couponData),
  
  // Cập nhật mã giảm giá (admin)
  updateCoupon: (code, updates) => api.put(`/coupons/${code}`, updates),
  
  // Xóa mã giảm giá (admin)
  deleteCoupon: (code) => api.delete(`/coupons/${code}`)
};
// Email Marketing API
export const emailAPI = {
  // Gửi email marketing
  sendMarketingEmail: (data) => api.post('/email/send', data),

  // Lịch sử email
  getEmailHistory: () => api.get('/email/history'),
};

// export default {
//   auth: authAPI,
//   products: productAPI,
//   categories: categoryAPI,
//   orders: orderAPI,
//   coupons: couponAPI,
//   email: emailAPI,
// };