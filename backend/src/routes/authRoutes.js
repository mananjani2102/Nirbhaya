const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendOTP,
  login,
  googleLogin,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  logout,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/update-profile', protect, updateProfile);
router.post('/logout', protect, logout);
router.put('/change-password', protect, changePassword);

module.exports = router;
