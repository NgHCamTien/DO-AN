const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');

// Load biến môi trường
dotenv.config();

// Kết nối database
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const newsletterRoutes = require('./routes/newsletter');
const couponRoutes = require('./routes/coupons'); // THÊM DÒNG NÀY

const app = express();

// Middleware CORS - Cấu hình chi tiết
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware khác
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static folder cho uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/coupons', couponRoutes); // THÊM DÒNG NÀY

// Route mặc định
app.get('/', (req, res) => {
  res.json({ 
    message: 'DTP Flower Shop API is running...',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      newsletter: '/api/newsletter',
      coupons: '/api/coupons' // THÊM DÒNG NÀY
    },
    emailService: process.env.EMAIL_USER ? 'Configured' : 'Not configured'
  });
});

// Route kiểm tra health
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'Connected',
    emailService: process.env.EMAIL_USER ? 'Ready' : 'Not configured'
  });
});

// Route test email service
app.get('/api/test-email', (req, res) => {
  res.json({
    emailUser: process.env.EMAIL_USER ? 'Configured' : 'Not set',
    emailPass: process.env.EMAIL_PASS ? 'Configured' : 'Not set',
    frontendUrl: process.env.FRONTEND_URL || 'Not set'
  });
});

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route không tồn tại',
    path: req.originalUrl,
    method: req.method
  });
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error('Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Khởi động server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`🌐 Admin panel: http://localhost:3000/admin/login`);
  console.log(`📊 API health: http://localhost:${PORT}/api/health`);
  console.log(`🎫 Coupons API: http://localhost:${PORT}/api/coupons`);
});