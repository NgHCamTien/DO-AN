const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/flowershop', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

const User = mongoose.model('User', userSchema);

const resetAdminPassword = async () => {
  try {
    // Find admin user
    const admin = await User.findOne({ email: 'ddtflowershop@gmail.com' });
    
    if (!admin) {
      console.log('Admin user not found!');
      process.exit(1);
    }

    console.log('Found admin user:', admin.email, 'Role:', admin.role);

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    // Update password
    admin.password = hashedPassword;
    await admin.save();

    console.log('Admin password has been reset successfully!');
    console.log('Email: ddtflowershop@gmail.com');
    console.log('New Password: 123456');
    
    // Test the new password
    const isMatch = await bcrypt.compare('123456', hashedPassword);
    console.log('Password verification test:', isMatch ? 'PASSED' : 'FAILED');
    
  } catch (error) {
    console.error('Error resetting password:', error);
  }
  
  process.exit(0);
};

resetAdminPassword();