const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/config');

const protect = async (req, res, next) => {
  let token;
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];
      
      console.log('============= TOKEN VERIFICATION =============');
      console.log('Token:', token ? 'Received' : 'Not found');
      
      // Xác nhận token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decoded token:', decoded);
      
      // Lấy thông tin user từ token (trừ password)
      req.user = await User.findById(decoded.id).select('-password');
      console.log('User found from token:', req.user ? `Yes - ID: ${req.user._id}, Role: ${req.user.role}` : 'No');
      
      if (!req.user) {
        console.log('User not found with ID:', decoded.id);
        return res.status(401).json({ message: 'Không tìm thấy người dùng' });
      }
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Không được ủy quyền, token không hợp lệ' });
    }
  } else {
    console.log('No token provided in request');
    return res.status(401).json({ message: 'Không được ủy quyền, không có token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Không được ủy quyền, bạn không phải admin' });
  }
};

module.exports = { protect, admin };