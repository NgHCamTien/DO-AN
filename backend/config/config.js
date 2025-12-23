require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key',
  EMAIL_USER: process.env.EMAIL_USER || '@ddtflowershopgmail.com',
  EMAIL_PASS: process.env.EMAIL_PASS || '123456',
  PORT: process.env.PORT || 5000
};