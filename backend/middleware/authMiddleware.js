const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token = null;

  // Lấy access token từ header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Bạn chưa đăng nhập. Không có token.",
    });
  }

  try {
    // Thử xác minh access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy user từ DB
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user)
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy user từ token.",
      });

    return next();
  } catch (err) {
    console.log("⛔ Access Token hết hạn hoặc lỗi:", err.message);

    // Nếu token hết hạn, thử dùng refresh token
    if (err.name === "TokenExpiredError") {
      const refreshToken = req.headers["x-refresh-token"];

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Access token hết hạn, thiếu refresh token.",
        });
      }

      try {
        // Verify refresh token
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findOne({
          _id: decodedRefresh.id,
          refreshToken,
        });

        if (!user) {
          return res.status(403).json({
            success: false,
            message: "Refresh token không hợp lệ.",
          });
        }

        // Tạo access token mới
        const newAccessToken = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        // Gửi access token mới về client để client lưu
        res.setHeader("x-access-token", newAccessToken);

        req.user = user;
        return next();
      } catch (error) {
        console.log("⚠️ Lỗi refresh token:", error.message);
        return res.status(403).json({
          success: false,
          message: "Refresh token hết hạn hoặc không hợp lệ.",
        });
      }
    }

    return res.status(403).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }
};

// 🔐 Middleware kiểm tra admin
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();

  return res.status(403).json({
    success: false,
    message: "Bạn không có quyền truy cập (Admin only).",
  });
};
