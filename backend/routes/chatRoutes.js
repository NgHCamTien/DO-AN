const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const { protect, admin } = require("../middleware/authMiddleware");

// 🔹 Lấy danh sách hội thoại (admin)
router.get("/conversations", protect, admin, async (req, res) => {
  const conversations = await Conversation.find()
    .sort({ updatedAt: -1 });

  res.json(conversations);
});

// 🔹 Lấy message theo conversation
router.get("/messages/:conversationId", protect, admin, async (req, res) => {
  const messages = await Message.find({
    conversation: req.params.conversationId,
  }).sort({ createdAt: 1 });

  res.json(messages);
});
// USER: lấy hội thoại + tin nhắn
router.get("/user", protect, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      user: req.user._id,
    });

    if (!conversation) {
      return res.json({
        conversation: null,
        messages: [],
      });
    }

    const messages = await Message.find({
      conversation: conversation._id,
    }).sort({ createdAt: 1 });

    res.json({
      conversation,
      messages,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
