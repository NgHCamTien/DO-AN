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

// 🔥 CHAT MODELS + BOT
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");
const { getBotReply } = require("./services/botService");

// ================== CONFIG ==================
dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ================== UPLOAD FOLDER ==================
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ================== MIDDLEWARE ==================
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static(uploadDir));

// ================== ROUTES (GIỮ NGUYÊN SERVER CŨ) ==================
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
app.use("/api/chat", require("./routes/chatRoutes"));

// ================== TEST API ==================
app.get("/", (req, res) => {
  res.json({ message: "🌸 DDT Flower Shop API is running..." });
});

// ================== HTTP SERVER ==================
const server = http.createServer(app);

// ================== SOCKET.IO ==================
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 SOCKET CONNECT:", socket.id);

  // ===== REGISTER =====
  socket.on("register_client", ({ role, userId }) => {
    if (role === "admin") {
      socket.join("admins");
      console.log("👩‍💼 ADMIN JOIN ROOM: admins");
    }

    if (role === "user" && userId) {
      socket.join(`user:${userId}`);
      console.log("👤 USER JOIN ROOM:", userId);
    }
  });

  // ===== USER → ADMIN =====
  socket.on("user_send_message", async ({ userId, text }) => {
    if (!userId || !text) return;

    // 1️⃣ Conversation
    const conversation = await Conversation.findOneAndUpdate(
      { user: userId },
      { lastMessage: text, lastSender: "user" },
      { upsert: true, new: true }
    );

    // 2️⃣ Save user message
    const userMessage = await Message.create({
      conversation: conversation._id,
      sender: "user",
      text,
    });

    // 3️⃣ Send to admin
    io.to("admins").emit("message_to_admin", {
      conversationId: conversation._id,
      sender: "user",
      text,
      time: userMessage.createdAt,
      user: { _id: userId, name: "Khách" },
    });

    // 4️⃣ BOT AUTO REPLY
    const botReply = getBotReply(conversation, text);
    if (!botReply) return;

    setTimeout(async () => {
      const botMessage = await Message.create({
        conversation: conversation._id,
        sender: "admin",
        text: botReply,
      });

      conversation.lastMessage = botReply;
      conversation.lastSender = "admin";
      await conversation.save();

      // 👉 USER
      io.to(`user:${userId}`).emit("message_to_user", {
        sender: "admin",
        text: botReply,
        time: botMessage.createdAt,
      });

      // 👉 ADMIN (REALTIME)
      io.to("admins").emit("message_to_admin", {
        conversationId: conversation._id,
        sender: "admin",
        text: botReply,
        time: botMessage.createdAt,
        isBot: true,
        user: { _id: userId, name: "Bot" },
      });

      console.log("🤖 BOT REPLIED");
    }, 800);
  });

  // ===== ADMIN → USER =====
  socket.on("admin_send_message", async ({ conversationId, text }) => {
    if (!conversationId || !text) return;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    const message = await Message.create({
      conversation: conversationId,
      sender: "admin",
      text,
    });

    conversation.lastMessage = text;
    conversation.lastSender = "admin";
    await conversation.save();

    io.to(`user:${conversation.user}`).emit("message_to_user", {
      sender: "admin",
      text,
      time: message.createdAt,
    });

    io.to("admins").emit("message_to_admin", {
      conversationId,
      sender: "admin",
      text,
      time: message.createdAt,
      user: { _id: conversation.user, name: "Khách" },
    });
  });
});

// ================== START ==================
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket running on port ${PORT}`);
  console.log(`🌐 Upload API ready at: http://localhost:${PORT}/uploads`);
});

// ================== CRON ==================
cron.schedule("0 9 14 2 *", () => {
  axios.post("http://localhost:5000/api/email/send", { event: "valentine" });
});
