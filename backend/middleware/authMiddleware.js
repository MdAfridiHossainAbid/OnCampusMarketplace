const jwt = require('jsonwebtoken');

// Verifies the request carries a valid JWT and attaches the decoded
// { id, role } to req.user. Use this in front of any route that
// requires the caller to be logged in.
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
};

// Restricts a route to specific roles. Must run AFTER protect,
// since it reads req.user.role.
// Usage: authorize('seller', 'admin')
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires role: ${allowedRoles.join(' or ')}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };