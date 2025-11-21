// const express = require('express');
// const User = require('../models/User');
// const { protect, admin } = require('../middleware/auth');
// const { sendPromotionEmail, sendBulkEmail } = require('../services/emailService');

// const router = express.Router();

// // @desc    Gửi email khuyến mãi cho tất cả subscribers
// // @route   POST /api/newsletter/send-promotion
// // @access  Private/Admin
// const sendPromotionToAll = async (req, res) => {
//   try {
//     const { title, content, discountCode, targetGroup = 'all' } = req.body;

//     if (!title || !content) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Vui lòng nhập tiêu đề và nội dung email' 
//       });
//     }

//     // Xây dựng query dựa trên target group
//     let query = { subscribedToNewsletter: true };
    
//     switch (targetGroup) {
//       case 'new_users':
//         // Users đăng ký trong 30 ngày qua
//         const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
//         query.registrationDate = { $gte: thirtyDaysAgo };
//         break;
//       case 'active_users':
//         // Users đăng nhập trong 7 ngày qua
//         const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//         query.lastLoginDate = { $gte: sevenDaysAgo };
//         break;
//       case 'all':
//       default:
//         // Tất cả subscribers
//         break;
//     }

//     const subscribers = await User.find(query).select('name email');

//     if (subscribers.length === 0) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Không có người đăng ký nào trong nhóm được chọn' 
//       });
//     }

//     // Chuẩn bị danh sách email
//     const emailList = subscribers.map(user => ({
//       email: user.email,
//       name: user.name
//     }));

//     console.log(`📧 Bắt đầu gửi email "${title}" cho ${emailList.length} subscribers...`);

//     // Gửi email hàng loạt
//     const results = await sendBulkEmail(emailList, title, content, discountCode);

//     // Đếm kết quả
//     const successCount = results.filter(r => r.success).length;
//     const failureCount = results.filter(r => !r.success).length;
//     const failures = results.filter(r => !r.success);

//     console.log(`✅ Hoàn thành gửi email: ${successCount} thành công, ${failureCount} thất bại`);

//     res.json({
//       success: true,
//       message: `Đã gửi email khuyến mãi thành công cho ${successCount}/${emailList.length} người đăng ký`,
//       data: {
//         title,
//         totalSubscribers: emailList.length,
//         successCount,
//         failureCount,
//         targetGroup,
//         failures: failures.length > 0 ? failures : undefined
//       }
//     });

//   } catch (error) {
//     console.error('❌ Send promotion error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Lỗi server khi gửi email khuyến mãi' 
//     });
//   }
// };

// // @desc    Lấy thống kê subscribers
// // @route   GET /api/newsletter/stats
// // @access  Private/Admin
// const getSubscriberStats = async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments({});
//     const totalSubscribers = await User.countDocuments({ subscribedToNewsletter: true });
    
//     // Subscribers đăng ký trong 30 ngày qua
//     const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
//     const newSubscribers = await User.countDocuments({
//       subscribedToNewsletter: true,
//       registrationDate: { $gte: thirtyDaysAgo }
//     });

//     // Active subscribers (đăng nhập trong 7 ngày qua)
//     const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//     const activeSubscribers = await User.countDocuments({
//       subscribedToNewsletter: true,
//       lastLoginDate: { $gte: sevenDaysAgo }
//     });

//     res.json({
//       success: true,
//       data: {
//         totalUsers,
//         totalSubscribers,
//         newSubscribers,
//         activeSubscribers,
//         subscriptionRate: totalUsers > 0 ? ((totalSubscribers / totalUsers) * 100).toFixed(1) : 0
//       }
//     });

//   } catch (error) {
//     console.error('Get subscriber stats error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Lỗi server khi lấy thống kê' 
//     });
//   }
// };

// // @desc    Lấy danh sách subscribers
// // @route   GET /api/newsletter/subscribers
// // @access  Private/Admin
// const getSubscribers = async (req, res) => {
//   try {
//     const { page = 1, limit = 20, group = 'all' } = req.query;
    
//     let query = { subscribedToNewsletter: true };
    
//     switch (group) {
//       case 'new':
//         const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
//         query.registrationDate = { $gte: thirtyDaysAgo };
//         break;
//       case 'active':
//         const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
//         query.lastLoginDate = { $gte: sevenDaysAgo };
//         break;
//     }

//     const subscribers = await User.find(query)
//       .select('name email registrationDate lastLoginDate preferences')
//       .sort({ registrationDate: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit);

//     const total = await User.countDocuments(query);

//     res.json({
//       success: true,
//       data: {
//         subscribers,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(total / limit),
//           totalItems: total,
//           itemsPerPage: parseInt(limit)
//         }
//       }
//     });

//   } catch (error) {
//     console.error('Get subscribers error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Lỗi server khi lấy danh sách subscribers' 
//     });
//   }
// };

// // @desc    Gửi email test
// // @route   POST /api/newsletter/test
// // @access  Private/Admin
// const sendTestEmail = async (req, res) => {
//   try {
//     const { title, content, discountCode, testEmail } = req.body;
//     const adminUser = req.user;

//     if (!title || !content) {
//       return res.status(400).json({ 
//         success: false,
//         message: 'Vui lòng nhập tiêu đề và nội dung email' 
//       });
//     }

//     const targetEmail = testEmail || adminUser.email;
//     const targetName = testEmail ? 'Test User' : adminUser.name;

//     console.log(`📧 Gửi email test "${title}" đến ${targetEmail}...`);

//     const result = await sendPromotionEmail(targetEmail, targetName, title, content, discountCode);

//     if (result.success) {
//       res.json({
//         success: true,
//         message: `Email test đã được gửi thành công đến ${targetEmail}`,
//         data: { messageId: result.messageId }
//       });
//     } else {
//       res.status(500).json({
//         success: false,
//         message: 'Không thể gửi email test',
//         error: result.error
//       });
//     }

//   } catch (error) {
//     console.error('❌ Send test email error:', error);
//     res.status(500).json({ 
//       success: false,
//       message: 'Lỗi server khi gửi email test' 
//     });
//   }
// };

// // Routes
// router.post('/send-promotion', protect, admin, sendPromotionToAll);
// router.get('/stats', protect, admin, getSubscriberStats);
// router.get('/subscribers', protect, admin, getSubscribers);
// router.post('/test', protect, admin, sendTestEmail);

// module.exports = router;
const express = require('express');
const router = express.Router();
const { subscribe, list, remove } = require('../controllers/newsletterController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', subscribe);
router.get('/', protect, admin, list);
router.delete('/:id', protect, admin, remove);

module.exports = router;
