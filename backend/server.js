const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const http = require("http");
const cron = require("node-cron");
const axios = require("axios");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
require("./services/emailService");

// ================== CONFIG ==================
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ================== UPLOAD FOLDER ==================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created uploads folder");
}

// ================== MIDDLEWARE ==================
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static(uploadDir));

// ================== ROUTES ==================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/users", require("./routes/users"));
app.use("/api/newsletter", require("./routes/newsletter"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/email", require("./routes/emailRoutes"));
app.use("/api/email", require("./routes/emailRecipients"));

app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/admin/products", require("./routes/adminProductRoutes"));
app.use("/api/admin/users", require("./routes/adminUsers"));
app.use("/api/admin/dashboard", require("./routes/adminDashboard"));
app.use("/api/admin/coupons", require("./routes/adminCoupons"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/payment-requests", require("./routes/paymentRequestRoutes"));
app.use(
  "/api/admin/payment-requests",
  require("./routes/adminPaymentRoutes")
);

// ================== TEST API ==================
app.get("/", (req, res) => {
  res.json({ message: "🌸 DDT Flower Shop API is running..." });
});

// ================== 404 HANDLER ==================
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/uploads/")) return next();
  res.status(404).json({ success: false, message: "Route không tồn tại" });
});

// ================== ERROR HANDLER ==================
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err);
  res.status(res.statusCode === 200 ? 500 : res.statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// ================== HTTP SERVER + SOCKET ==================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
  },
});

// ===== SOCKET LOGIC (CHAT REAL-TIME & ONLINE STATUS) =====
const onlineClients = new Map(); // socketId -> { role, userId }

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  // 1. Đăng ký Client (Lưu trạng thái Online)
  socket.on("register_client", ({ role, userId }) => {
    onlineClients.set(socket.id, { role, userId });
    console.log("📌 Register:", socket.id, role, userId);
    io.emit("online_list", Array.from(onlineClients.values()));
  });

  // 2. Xử lý tin nhắn từ KHÁCH HÀNG gửi lên
  socket.on("send_message_from_client", (data) => {
    console.log(`📩 Khách ${socket.id} nhắn: ${data.text}`);

    // Gắn thêm userId (socket.id) để Admin biết tin nhắn của ai
    const messageForAdmin = {
      ...data,
      userId: socket.id, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Gửi sự kiện này cho Admin
    io.emit("message_to_admin", messageForAdmin);
  });

  // 3. Xử lý tin nhắn ADMIN trả lời lại
  socket.on("send_message_from_admin", (data) => {
    const { userId, text } = data;
    console.log(`🛡️ Admin trả lời tới ${userId}: ${text}`);

    // Gửi riêng (Private Message) về đúng socketId của khách hàng đó
    io.to(userId).emit("receive_message_at_client", {
      sender: "admin",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  });

  // 4. Ngắt kết nối
  socket.on("disconnect", () => {
    console.log("🔴 Disconnected:", socket.id);
    onlineClients.delete(socket.id);
    io.emit("online_list", Array.from(onlineClients.values()));
  });
});

// ================== START SERVER (⚠️ CHỈ 1 LISTEN) ==================
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running on port ${PORT}`);
  console.log(`🌐 Upload API ready at: http://localhost:${PORT}/uploads`);
});

// ================== CRON JOBS ==================
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