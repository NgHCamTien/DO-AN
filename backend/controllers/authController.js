const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../services/emailService");

// =============================
// 🔐 TOKEN GENERATORS
// =============================
const generateAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });

// =============================
// INTERNAL UTIL
// =============================
const createTokens = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  user.lastLoginDate = new Date();
  await user.save();

  return { accessToken, refreshToken };
};

const autoCreatePassword = () => Math.random().toString(36).slice(-10);

// =============================
// 🟢 GOOGLE LOGIN
// =============================
exports.googleLogin = async (req, res) => {
  try {
    const { email, name, googleId, picture } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Thiếu email" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        picture,
        password: autoCreatePassword(),
        emailVerified: true,
        role: email === "camtien@gmail.com" ? "admin" : "user",
      });

      sendWelcomeEmail(email, name).catch(() =>
        console.log("⚠ Không gửi được email chào mừng (Google)")
      );
    }

    const { accessToken, refreshToken } = await createTokens(user);

    res.json({
      success: true,
      message: "Đăng nhập Google thành công",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("❌ Google login error:", err);
    res.status(500).json({ success: false, message: "Lỗi đăng nhập Google" });
  }
};

// =============================
// 🟦 FACEBOOK LOGIN
// =============================
exports.facebookLogin = async (req, res) => {
  try {
    const { email, name, facebookId, picture } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Thiếu email" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        facebookId,
        picture,
        password: autoCreatePassword(),
        emailVerified: true,
        role: email === "camtien@gmail.com" ? "admin" : "user",
      });

      sendWelcomeEmail(email, name).catch(() =>
        console.log("⚠ Không gửi được email chào mừng (Facebook)")
      );
    }

    const { accessToken, refreshToken } = await createTokens(user);

    res.json({
      success: true,
      message: "Đăng nhập Facebook thành công",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("❌ Facebook login error:", err);
    res.status(500).json({ success: false, message: "Lỗi đăng nhập Facebook" });
  }
};

// =============================
// 🟢 REGISTER
// =============================
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, address, subscribeNewsletter = true } =
      req.body;

    if (!name || !email || !password)
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu",
      });

    if (await User.findOne({ email }))
      return res
        .status(400)
        .json({ success: false, message: "Email đã tồn tại" });

    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      subscribedToNewsletter: subscribeNewsletter,
    });

    const { accessToken, refreshToken } = await createTokens(user);

    if (subscribeNewsletter)
      sendWelcomeEmail(user.email, user.name).catch(() =>
        console.log("⚠ Không gửi được email chào mừng (Register)")
      );

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công!",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi đăng ký" });
  }
};

// =============================
// 🟢 LOGIN
// =============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Email không tồn tại" });

    if (user.googleId)
      return res.status(400).json({
        success: false,
        message: "Tài khoản này đăng ký bằng Google! Vui lòng đăng nhập bằng Google.",
      });

    if (!(await user.matchPassword(password)))
      return res
        .status(400)
        .json({ success: false, message: "Sai mật khẩu" });

    const { accessToken, refreshToken } = await createTokens(user);

    res.json({
      success: true,
      message: "Đăng nhập thành công!",
      user,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi đăng nhập" });
  }
};

// =============================
// 🔄 REFRESH TOKEN
// =============================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res
        .status(401)
        .json({ success: false, message: "Không có refresh token" });

    const user = await User.findOne({ refreshToken });
    if (!user)
      return res
        .status(403)
        .json({ success: false, message: "Refresh token không hợp lệ" });

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      (err, decoded) => {
        if (err)
          return res
            .status(403)
            .json({ success: false, message: "Refresh token hết hạn" });

        res.json({
          success: true,
          accessToken: generateAccessToken(user),
        });
      }
    );
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// =============================
// 👤 PROFILE
// =============================
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });

    res.json({ success: true, user });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// =============================
// ✏ UPDATE PROFILE
// =============================
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });

    user.name = req.body.name ?? user.name;
    user.phone = req.body.phone ?? user.phone;
    user.address = req.body.address ?? user.address;

    if (req.body.password) user.password = req.body.password;

    await user.save();

    res.json({ success: true, user });
  } catch {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
