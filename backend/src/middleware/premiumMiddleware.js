const User = require('../models/User');

const premiumOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.plan !== 'premium') {
      return res.status(403).json({
        message: 'This feature requires Premium plan. Please upgrade.',
        upgradeUrl: '/pricing'
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = { premiumOnly };
