// const User = require('../models/User');

// // Get all users (admin)
// const getUsers = async (req,res)=>{
//   try{
//     const users = await User.find().select('-password').sort({ createdAt: -1 });
//     res.json({ success:true, data: users });
//   }catch(err){ res.status(500).json({ message: err.message }); }
// };

// // Update role / block
// const updateUser = async (req,res)=>{
//   try{
//     const user = await User.findById(req.params.id);
//     if(!user) return res.status(404).json({message:'Not found'});
//     const { name, role, active } = req.body;
//     if(name) user.name = name;
//     if(role) user.role = role;
//     if(typeof active !== 'undefined') user.active = active;
//     await user.save();
//     res.json({ success:true, data: user });
//   }catch(err){ res.status(500).json({ message: err.message }); }
// };

// // Delete user
// const deleteUser = async (req,res)=>{
//   try{
//     const user = await User.findByIdAndDelete(req.params.id);
//     if(!user) return res.status(404).json({message:'Not found'});
//     res.json({ success:true, message:'User deleted' });
//   }catch(err){ res.status(500).json({ message: err.message }); }
// };

// module.exports = { getUsers, updateUser, deleteUser };
const User = require("../models/User");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách người dùng",
    });
  }
};
