const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

  // ⭐ Thông tin cơ bản
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  active: {
  type: Boolean,
  default: true,
},


  // ⭐ Khi login bằng Google
  googleId: { type: String, default: null },
  picture: { type: String, default: "" },

  // ⭐ Khi login bằng Facebook
  facebookId: { type: String, default: null },

  // ⭐ Password chỉ cần khi người dùng đăng ký thủ công
  password: {
    type: String,
    required: function () {
      return !this.googleId && !this.facebookId;
    },
  },

  phone: {
    type: String,
    default: ''
  },

  address: {
    type: String,
    default: ''
  },

  // ⭐ Phân quyền user / admin
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
    refreshToken: { type: String, default: "" },


  // ⭐ Dùng để gửi mail khuyến mãi / dịp lễ
  subscribedToNewsletter: {
    type: Boolean,
    default: true
  },

  emailVerified: {
    type: Boolean,
    default: false
  },

  lastLoginDate: {
    type: Date
  },

  registrationDate: {
    type: Date,
    default: Date.now
  },

  // ⭐ Tính năng Refresh Token — mỗi user có 1 refresh token
  refreshToken: {
    type: String,
    default: null
  },

  // ⭐ Preferences (dùng trong email marketing)
  preferences: {
    receivePromotions: {
      type: Boolean,
      default: true
    },
    receiveOrderUpdates: {
      type: Boolean,
      default: true
    },
    receiveNewsletter: {
      type: Boolean,
      default: true
    }
  }

}, {
  timestamps: true
});


// ================================
// 🔐 Mã hóa mật khẩu trước khi lưu
// ================================
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    next();
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


// ================================
// 🔑 Kiểm tra mật khẩu nhập vào
// ================================
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false; // Google/Facebook không có password
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};


const User = mongoose.model('User', userSchema);
module.exports = User;
