const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.limit) || 10;
    const search = req.query.search || "";

    const keyword = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await User.countDocuments(keyword);

    const users = await User.find(keyword)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    return res.json({
      success: true,
      data: users,
      page,
      pages: Math.ceil(total / pageSize),
      total,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách người dùng",
    });
  }
};


//  CẬP NHẬT THÔNG TIN NGƯỜI DÙNG
exports.updateUser = async (req, res) => {
  try {
    const { name, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });

    if (name) user.name = name;
    if (role) user.role = role;

    await user.save();

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

//  KHOÁ / MỞ KHOÁ TÀI KHOẢN
exports.toggleActiveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ success: false, message: "Không tìm thấy người dùng" });

    user.active = !user.active; // 🔥 đảo trạng thái
    await user.save();

    return res.json({
      success: true,
      message: user.active ? "Đã mở khoá tài khoản" : "Đã khoá tài khoản",
      data: user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

//  XOÁ NGƯỜI DÙNG
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    await user.deleteOne();
    return res.json({
      success: true,
      message: "Đã xoá người dùng",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi xoá người dùng" });
  }
};

//  RESET MẬT KHẨU NGƯỜI DÙNG
exports.resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    const newPassword = "123456"; // hoặc random nếu bạn muốn
    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
      newPassword, // gửi về cho admin biết
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi server khi reset mật khẩu" });
  }
};

