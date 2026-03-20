const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET || 'super_secret_banking_key_123',
    { expiresIn: '1d' }
  );
};

module.exports = {
  generateToken
};
