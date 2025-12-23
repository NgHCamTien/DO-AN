const Order = require('../models/Order');
const Product = require('../models/Product');

const getDashboardStats = async (req,res)=>{
  try{
    // orders count by status
    const statuses = ['pending','processing','shipped','delivered','cancelled'];
    const counts = {};
    for(const st of statuses){ counts[st] = await Order.countDocuments({ status: st }); }
    const totalOrders = await Order.countDocuments();
    // revenue: sum totalPrice for delivered orders
    const revenueAgg = await Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const revenue = revenueAgg[0]?.total || 0;
    // low stock products
    const lowStock = await Product.find({ stock: { $gt: 0, $lt: 5 } }).select('name stock');
    res.json({ success:true, data: { counts, totalOrders, revenue, lowStock }});
  }catch(err){ res.status(500).json({message:err.message}); }
};

module.exports = { getDashboardStats };
