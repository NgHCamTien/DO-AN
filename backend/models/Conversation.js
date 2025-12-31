const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 1 user = 1 hội thoại với shop
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastSender: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // =====================
    // 🔥 BOT CONTEXT (AUTO-REPLY)
    // =====================

    botStep: {
      type: Number,
      default: 0,
      /*
        0: chưa chào
        1: đã chào, hỏi nhu cầu
        2: đã hỏi nhu cầu
        3: bot kết thúc, nhường admin
      */
    },

    botActive: {
      type: Boolean,
      default: true, // admin trả lời -> set false
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
