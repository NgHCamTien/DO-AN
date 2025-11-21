const Newsletter = require('../models/Newsletter');

const subscribe = async (req,res)=>{
  try{
    const { email, name } = req.body;
    if(!email) return res.status(400).json({message:'Email required'});
    const exists = await Newsletter.findOne({ email });
    if(exists) return res.status(200).json({ message:'Already subscribed' });
    const n = new Newsletter({ email, name });
    await n.save();
    res.status(201).json({ success:true, data: n });
  }catch(err){ res.status(500).json({message:err.message}); }
};

const list = async (req,res)=>{
  try{ const list = await Newsletter.find().sort({ subscribedAt:-1 }); res.json({ success:true, data: list }); }
  catch(err){ res.status(500).json({message:err.message}); }
};

const remove = async (req,res)=>{
  try{ await Newsletter.findByIdAndDelete(req.params.id); res.json({ success:true }); }
  catch(err){ res.status(500).json({message:err.message}); }
};

module.exports = { subscribe, list, remove };
