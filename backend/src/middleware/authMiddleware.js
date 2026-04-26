const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      req.user = user;
      req.userId = decoded.userId;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ success: false, message: 'Invalid token', code: 'INVALID_TOKEN' });
      }
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
