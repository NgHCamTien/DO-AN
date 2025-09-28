const Category = require('../models/Category');
const Product = require('../models/Product');

// Lấy tất cả danh mục
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh mục theo slug
const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo danh mục
const getProductsByCategory = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
    
    const count = await Product.countDocuments({ category: category._id });
    
    const products = await Product.find({ category: category._id })
      .populate('category', 'name slug')
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });
    
    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      category
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm danh mục mới (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    
    // Kiểm tra slug có trùng không
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ message: 'Slug đã tồn tại' });
    }
    
    // Lưu đường dẫn hình ảnh nếu có
    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    
    const category = new Category({
      name,
      slug,
      description,
      image
    });
    
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật danh mục (Admin)
const updateCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    
    const category = await Category.findById(req.params.id);
    
    if (category) {
      // Kiểm tra slug có trùng không (nếu thay đổi)
      if (slug && slug !== category.slug) {
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
          return res.status(400).json({ message: 'Slug đã tồn tại' });
        }
        category.slug = slug;
      }
      
      category.name = name || category.name;
      category.description = description || category.description;
      
      // Cập nhật hình ảnh nếu có
      if (req.file) {
        category.image = `/uploads/${req.file.filename}`;
      }
      
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa danh mục (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (category) {
      // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
      const productsCount = await Product.countDocuments({ category: category._id });
      
      if (productsCount > 0) {
        return res.status(400).json({ 
          message: 'Không thể xóa danh mục này vì có sản phẩm liên quan' 
        });
      }
      
      await category.remove();
      res.json({ message: 'Đã xóa danh mục' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
  createCategory,
  updateCategory,
  deleteCategory
};