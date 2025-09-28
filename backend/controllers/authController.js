const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../services/emailService');

// Tạo token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, subscribeNewsletter = true } = req.body;

    // Validation đầu vào
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' 
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Họ tên phải có ít nhất 2 ký tự' 
      });
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        message: 'Email không hợp lệ' 
      });
    }

    // Chỉ kiểm tra mật khẩu không được rỗng
    if (password.length < 1) {
      return res.status(400).json({ 
        success: false,
        message: 'Mật khẩu không được để trống' 
      });
    }

    // Kiểm tra email đã tồn tại
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập' 
      });
    }

    // Tạo user mới - CHỈ CẦN: name, email, password
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      subscribedToNewsletter: subscribeNewsletter,
      preferences: {
        receivePromotions: subscribeNewsletter,
        receiveOrderUpdates: true,
        receiveNewsletter: subscribeNewsletter
      }
    });

    if (user) {
      // Tạo token
      const token = generateToken(user._id);

      // Gửi email chào mừng (async, không chặn response)
      if (subscribeNewsletter) {
        sendWelcomeEmail(user.email, user.name)
          .then((result) => {
            console.log('✅ Đã gửi email chào mừng thành công:', result);
          })
          .catch((error) => {
            console.error('❌ Lỗi khi gửi email chào mừng:', error);
          });
      }

      // Trả về response thành công
      res.status(201).json({
        success: true,
        message: subscribeNewsletter ? 
          'Đăng ký thành công! Chúng tôi đã gửi email chào mừng đến bạn.' :
          'Đăng ký thành công! Chào mừng bạn đến với DTP Flower Shop.',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          subscribedToNewsletter: user.subscribedToNewsletter,
          token
        }
      });
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Không thể tạo tài khoản. Vui lòng thử lại' 
      });
    }
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    
    // Xử lý các lỗi cụ thể
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => {
        switch (err.path) {
          case 'email':
            return 'Email không hợp lệ';
          case 'name':
            return 'Họ tên không hợp lệ';
          case 'password':
            return 'Mật khẩu không hợp lệ';
          default:
            return 'Thông tin không hợp lệ';
        }
      });
      return res.status(400).json({ 
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: 'Email này đã được đăng ký' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi đăng ký tài khoản. Vui lòng thử lại sau' 
    });
  }
};

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation đầu vào
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Vui lòng nhập đầy đủ email và mật khẩu' 
      });
    }

    if (!email.trim() || !password.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Email và mật khẩu không được để trống' 
      });
    }

    // Kiểm tra email hợp lệ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ 
        success: false,
        message: 'Email không hợp lệ' 
      });
    }

    // Tìm user và so sánh mật khẩu
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Email không tồn tại trong hệ thống' 
      });
    }

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Mật khẩu không đúng' 
      });
    }

    // Đăng nhập thành công
    user.lastLoginDate = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Đăng nhập thành công! Chào mừng bạn trở lại.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        subscribedToNewsletter: user.subscribedToNewsletter,
        lastLoginDate: user.lastLoginDate,
        token: generateToken(user._id)
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi đăng nhập. Vui lòng thử lại sau' 
    });
  }
};

// @desc    Lấy thông tin người dùng
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (user) {
      res.json({
        success: true,
        message: 'Lấy thông tin người dùng thành công',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          address: user.address,
          subscribedToNewsletter: user.subscribedToNewsletter,
          preferences: user.preferences,
          registrationDate: user.registrationDate,
          lastLoginDate: user.lastLoginDate
        }
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy thông tin người dùng' 
      });
    }
  } catch (error) {
    console.error('Lỗi lấy thông tin người dùng:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi lấy thông tin người dùng' 
    });
  }
};

// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Không tìm thấy người dùng' 
      });
    }

    // Validation dữ liệu đầu vào
    if (req.body.name && req.body.name.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Họ tên phải có ít nhất 2 ký tự' 
      });
    }

    if (req.body.phone && req.body.phone.trim() !== '') {
      const phoneRegex = /^[0-9+\-\s()]{8,15}$/;
      if (!phoneRegex.test(req.body.phone.trim())) {
        return res.status(400).json({ 
          success: false,
          message: 'Số điện thoại không hợp lệ' 
        });
      }
    }

    // Cập nhật thông tin cơ bản
    user.name = req.body.name ? req.body.name.trim() : user.name;
    user.phone = req.body.phone ? req.body.phone.trim() : user.phone;
    user.address = req.body.address ? req.body.address.trim() : user.address;
    
    // Cập nhật email nếu khác
    if (req.body.email && req.body.email.trim() !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email.trim())) {
        return res.status(400).json({ 
          success: false,
          message: 'Email mới không hợp lệ' 
        });
      }

      const emailExists = await User.findOne({ 
        email: req.body.email.toLowerCase().trim(),
        _id: { $ne: user._id }
      });
      
      if (emailExists) {
        return res.status(400).json({ 
          success: false,
          message: 'Email này đã được sử dụng bởi tài khoản khác' 
        });
      }
      
      user.email = req.body.email.toLowerCase().trim();
      user.emailVerified = false;
    }
    
    // Cập nhật preferences
    if (req.body.preferences) {
      user.preferences = { ...user.preferences.toObject(), ...req.body.preferences };
    }
    
    if (req.body.subscribedToNewsletter !== undefined) {
      user.subscribedToNewsletter = req.body.subscribedToNewsletter;
    }

    // Cập nhật mật khẩu nếu có
    if (req.body.password) {
      if (req.body.password.length < 6) {
        return res.status(400).json({ 
          success: false,
          message: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
        });
      }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Cập nhật thông tin cá nhân thành công',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        subscribedToNewsletter: updatedUser.subscribedToNewsletter,
        preferences: updatedUser.preferences,
        token: generateToken(updatedUser._id)
      }
    });

  } catch (error) {
    console.error('Lỗi cập nhật thông tin:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => {
        switch (err.path) {
          case 'email':
            return 'Email không hợp lệ';
          case 'name':
            return 'Họ tên không hợp lệ';
          default:
            return 'Thông tin không hợp lệ';
        }
      });
      return res.status(400).json({ 
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Lỗi server khi cập nhật thông tin. Vui lòng thử lại sau' 
    });
  }
};

module.exports = {
  register,
  login,
  getUserProfile,
  updateUserProfile
};