const Coupon = require('../models/Coupon');

// Create
const createCoupon = async (req,res)=>{
  try{
    const { code, discountPercent, maxDiscount, expireAt, usageLimit } = req.body;
    const coupon = new Coupon({ code, discountPercent, maxDiscount, expireAt: expireAt||null, usageLimit: usageLimit||null });
    await coupon.save();
    res.status(201).json({ success:true, data: coupon });
  }catch(err){ res.status(500).json({ success:false, message: err.message }); }
};

// List
const getCoupons = async (req,res)=>{
  try{
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success:true, data: coupons });
  }catch(err){ res.status(500).json({ success:false, message: err.message }); }
};

// Get one
const getCouponById = async (req,res)=>{
  try{ const c = await Coupon.findById(req.params.id); if(!c) return res.status(404).json({message:'Not found'}); res.json({success:true,data:c}); }
  catch(err){ res.status(500).json({message:err.message}); }
};

// Update
const updateCoupon = async (req,res)=>{
  try{
    const coupon = await Coupon.findById(req.params.id);
    if(!coupon) return res.status(404).json({message:'Not found'});
    Object.assign(coupon, req.body);
    await coupon.save();
    res.json({success:true, data: coupon});
  }catch(err){ res.status(500).json({message:err.message}); }
};

// Delete
const deleteCoupon = async (req,res)=>{
  try{
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if(!coupon) return res.status(404).json({message:'Not found'});
    res.json({ success:true, message:'Deleted' });
  }catch(err){ res.status(500).json({message:err.message}); }
};

module.exports = { createCoupon, getCoupons, getCouponById, updateCoupon, deleteCoupon };
