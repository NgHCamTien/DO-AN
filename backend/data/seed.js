const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');


// Tải biến môi trường
dotenv.config();

// Kết nối MongoDB
connectDB();

// sử dụng API đăng ký
const users = [
  {
    name: 'Admin',
    email: '@ddtflowershopgmail.com',
    password: bcrypt.hashSync('123456', 10), // 🔥 Hash đúng chuẩn
    role: 'admin'
  }
];

  
const categories = [
  {
    name: 'Khuyến mãi gốc',
    slug: 'sale',
    description: 'Các sản phẩm đang được khuyến mãi'
  },
  {
    name: 'Hoa cảm ơn',
    slug: 'thank-you',
    description: 'Hoa dành cho việc bày tỏ lòng biết ơn'
  },
  {
    name: 'Hoa sinh nhật',
    slug: 'birthday',
    description: 'Hoa dành tặng trong dịp sinh nhật'
  },
  {
    name: 'Hoa sự kiện',
    slug: 'events',
    description: 'Hoa dùng trong các sự kiện đặc biệt'
  },
  {
    name: 'Hoa tươi',
    slug: 'fresh',
    description: 'Các loại hoa tươi mới nhất'
  },
  {
    name: 'Quà tặng',
    slug: 'gifts',
    description: 'Quà tặng kèm hoa'
  }
];

// Hàm nhập dữ liệu
const importData = async () => {
  try {
    // Xóa tất cả dữ liệu hiện có
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    
    // Thêm người dùng
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;
    
    // Thêm danh mục
    const createdCategories = await Category.insertMany(categories);
    
    // Chuẩn bị dữ liệu sản phẩm
    const products = [
      {
        name: 'Hoa sinh nhật tặng người yêu mới nhất',
        description: 'Bó hoa tươi đẹp dành cho sinh nhật người yêu',
        price: 500000,
        images: ['/img/hoa1.jpg'],
        category: createdCategories[2]._id, // Hoa sinh nhật
        quantity: 10,
        isFeatured: true,
        rating: 5
      },
      {
        name: 'Hoa bó kỷ niệm ngày cưới cực teen cho vợ',
        description: 'Bó hoa tươi dành cho dịp kỷ niệm ngày cưới',
        price: 399000,
        images: ['/img/hoa2.jpg'],
        category: createdCategories[3]._id, // Hoa sự kiện
        quantity: 15,
        isFeatured: false,
        rating: 5
      },
      {
        name: 'Lẵng hoa như ý đẹp tặng sếp',
        description: 'Lẵng hoa sang trọng dành tặng sếp',
        price: 500000,
        images: ['/img/hoa3.jpg'],
        category: createdCategories[1]._id, // Hoa cảm ơn
        quantity: 8,
        isFeatured: false,
        rating: 5
      },
      {
        name: 'Hoa cảm hứng cầu tặng bạn gái cực đẹp',
        description: 'Bó hoa tú cầu tươi tắn dành cho bạn gái',
        price: 510000,
        discountPrice: 399000,
        images: ['/img/hoa4.jpg'],
        category: createdCategories[0]._id, // Khuyến mãi gốc
        quantity: 12,
        isFeatured: false,
        rating: 5
      },
      {
        name: 'Hoa bó cẩm tú cầu + cẩm chướng đẹp lãng mạn',
        description: 'Bó hoa kết hợp giữa cẩm tú cầu và cẩm chướng',
        price: 350000,
        discountPrice: 299000,
        images: ['/img/hoa5.jpg'],
        category: createdCategories[0]._id, // Khuyến mãi gốc
        quantity: 20,
        isFeatured: false,
        rating: 5
      },
      {
        name: 'Hoa bình cắm cao cấp cho chồng tặng vợ cực đẹp',
        description: 'Bình hoa cao cấp dành tặng vợ yêu',
        price: 2000000,
        discountPrice: 1100000,
        images: ['/img/hoa6.jpg'],
        category: createdCategories[0]._id, // Khuyến mãi gốc
        quantity: 5,
        isFeatured: false,
        rating: 5
      },
      {
        name: 'Bó hoa tulip đỏ tươi mới',
        description: 'Bó hoa tulip đỏ tươi mới, biểu tượng của tình yêu',
        price: 450000,
        images: ['/img/hoa7.jpg'],
        category: createdCategories[4]._id, // Hoa tươi
        quantity: 15,
        isFeatured: true,
        rating: 5
      },
      {
        name: 'Hộp hoa hồng mix hoa baby',
        description: 'Hộp hoa hồng kết hợp hoa baby trắng tinh khôi',
        price: 550000,
        images: ['/img/hoa8.jpg'],
        category: createdCategories[2]._id, // Hoa sinh nhật
        quantity: 10,
        isFeatured: true,
        rating: 4
      }
    ];
    
    // Thêm sản phẩm
    await Product.insertMany(products);
    
    console.log('Dữ liệu đã được nhập thành công!');
    process.exit(0);
  } catch (error) {
    console.error(`Lỗi: ${error.message}`);
    process.exit(1);
  }
};

// Hàm xóa dữ liệu
const destroyData = async () => {
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    
    console.log('Dữ liệu đã được xóa!');
    process.exit(0);
  } catch (error) {
    console.error(`Lỗi: ${error.message}`);
    process.exit(1);
  }
};

// Gọi hàm tương ứng dựa trên tham số dòng lệnh
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}