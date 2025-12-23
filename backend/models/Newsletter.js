const mongoose = require('mongoose');
const newsSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  name: { type: String },
  subscribedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Newsletter', newsSchema);
