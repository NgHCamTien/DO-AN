const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/recipients", async (req, res) => {
  try {
    const group = req.query.group;

    let users = [];

    if (group === "all") {
      users = await User.find({});
    } else if (group === "user") {
      users = await User.find({ role: "user" });
    } else if (group === "admin") {
      users = await User.find({ role: "admin" });
    } else if (group === "newsletter") {
      users = await User.find({ newsletter: true });
    } else if (group === "vip") {
      users = await User.find({ isVIP: true });
    }

    const emails = users.map((u) => u.email);

    res.json({ success: true, emails });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

module.exports = router;
