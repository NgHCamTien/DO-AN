const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// Lấy tất cả sản phẩm
const getProducts = async (req, res) => {
  try {
    // Phân trang và lọc
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    // Tìm kiếm theo tên
    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i'
          }
        }
      : {};
    
    // Lọc theo danh mục
    let category = {};
    if (req.query.category) {
      const categoryObj = await Category.findOne({ slug: req.query.category });
      if (categoryObj) {
        category = { category: categoryObj._id };
      }
    }
    
    const count = await Product.countDocuments({ ...keyword, ...category });
    
    const products = await Product.find({ ...keyword, ...category })
      .populate('category', 'name slug')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });
    
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm nổi bật
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const products = await Product.find({ isFeatured: true })
      .populate('category', 'name slug')
      .limit(limit);
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm liên quan
const getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category
    })
      .populate('category', 'name slug')
      .limit(4);
    
    res.json(relatedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm sản phẩm mới (Admin)
const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      discountPrice, 
      categoryId, 
      isFeatured 
    } = req.body;
    
    // Kiểm tra category có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Danh mục không hợp lệ' });
    }
    
    // Lưu đường dẫn hình ảnh nếu có
    const images = [];
    if (req.files) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }
    
    const product = new Product({
      name,
      description,
      price,
      discountPrice: discountPrice || null,
      images,
      category: categoryId,
      isFeatured: isFeatured || false
    });
    
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật sản phẩm (Admin)
const updateProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      discountPrice, 
      categoryId, 
      isFeatured 
    } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (product) {
      // Cập nhật thông tin cơ bản
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
      
      // Cập nhật danh mục nếu có
      if (categoryId) {
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(400).json({ message: 'Danh mục không hợp lệ' });
        }
        product.category = categoryId;
      }
      
      product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
      
      // Cập nhật hình ảnh nếu có
      if (req.files && req.files.length > 0) {
        const images = [];
        req.files.forEach(file => {
          images.push(`/uploads/${file.filename}`);
        });
        product.images = images;
      }
      
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa sản phẩm (Admin) - ĐÃ SỬA
const deleteProduct = async (req, res) => {
  try {
    console.log('=== DELETE PRODUCT DEBUG ===');
    console.log('Product ID:', req.params.id);
    console.log('User ID:', req.user?._id);
    console.log('User Role:', req.user?.role);
    console.log('User Email:', req.user?.email);
    
    // Kiểm tra ID có hợp lệ không
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('❌ Invalid Product ID format');
      return res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      console.log('❌ Product not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    
    console.log('✅ Product found:', product.name);
    
    // SỬA: Sử dụng findByIdAndDelete thay vì .remove()
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      console.log('❌ Failed to delete product');
      return res.status(500).json({ message: 'Không thể xóa sản phẩm' });
    }
    
    console.log('✅ Product deleted successfully:', deletedProduct.name);
    res.json({ 
      message: 'Đã xóa sản phẩm thành công',
      success: true,
      deletedProduct: {
        id: deletedProduct._id,
        name: deletedProduct.name
      }
    });
    
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ 
      message: 'Lỗi server khi xóa sản phẩm',
      error: error.message,
      success: false
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getFeaturedProducts,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct
};