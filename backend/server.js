const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const connectDB = require('./config/db');
const cron = require("node-cron");
const axios = require("axios");


require("./services/emailService");

dotenv.config();
connectDB();

const app = express();

// Create uploads folder
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads folder');
}

// Static
app.use('/uploads', express.static(uploadDir));

// Middleware
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ================= ROUTES =================

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const newsletterRoutes = require('./routes/newsletter');
const couponRoutes = require('./routes/coupons');
const emailRoutes = require('./routes/emailRoutes');

const adminProductRoutes = require('./routes/adminProductRoutes');
const adminUserRoutes = require('./routes/adminUsers');
const adminDashboardRoutes = require('./routes/adminDashboard');
const adminCouponRoutes = require('./routes/adminCoupons');

const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require("./routes/users");
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require("./routes/notificationRoutes");

// ✔ ORDER ĐÚNG
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);    // ⭐ review ngay sau auth
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/users', userRoutes);
app.use("/api/email", require("./routes/emailRecipients"));

// ADMIN routes
app.use('/api/upload', uploadRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/coupons', adminCouponRoutes);
app.use("/api/notifications", notificationRoutes);

// Test
app.get('/', (req, res) => {
  res.json({ message: '🌸 DDT Flower Shop API is running...' });
});

// 404 Handler
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/uploads/')) return next();
  res.status(404).json({ success: false, message: 'Route không tồn tại' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Upload API ready at: http://localhost:${PORT}/uploads`);
});

// ================= CRON JOBS =================
cron.schedule("0 9 14 2 *", () => {
  axios.post("http://localhost:5000/api/email/send", { event: "valentine" });
});
cron.schedule("0 9 8 3 *", () => {
  axios.post("http://localhost:5000/api/email/send", { event: "women" });
});
cron.schedule("0 9 1 1 *", () => {
  axios.post("http://localhost:5000/api/email/send", { event: "tet" });
});
cron.schedule("0 9 24 12 *", () => {
  axios.post("http://localhost:5000/api/email/send", { event: "noel" });
});
