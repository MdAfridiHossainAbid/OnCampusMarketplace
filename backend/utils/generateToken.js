const jwt = require('jsonwebtoken');

// Payload carries id + role so middleware can check permissions
// without hitting the database on every request.
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;