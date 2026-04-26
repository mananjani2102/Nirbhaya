const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── Token Generation ─────────────────────────────────────────────────
const generateAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

// ── Register ─────────────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit Indian phone number' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = new User({
      name,
      email,
      phone,
      password,
      emailVerified: true // Auto-verify for now since there's no OTP UI
    });
    await user.save();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        plan: user.plan
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ── Verify Email ─────────────────────────────────────────────────────
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (!user.emailOTPExpiry || user.emailOTPExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired. Request a new one.' });
    }

    if (user.emailOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.emailVerified = true;
    user.emailOTP = null;
    user.emailOTPExpiry = null;

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save();

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        plan: user.plan
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ── Resend OTP ───────────────────────────────────────────────────────
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOTP = otp;
    user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // TODO: Replace with actual email integration
    console.log("EMAIL OTP for", email, ":", otp);

    return res.status(200).json({ success: true, message: 'New OTP sent' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ── Login ────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check account lock
    if (user.isLocked()) {
      return res.status(423).json({ success: false, message: 'Account temporarily locked. Try again in 15 minutes.' });
    }

    // Check email verification
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first.',
        requiresVerification: true
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Successful login — reset lockout counters
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await user.save();

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        plan: user.plan,
        planExpiry: user.planExpiry
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ── Google Login ─────────────────────────────────────────────────────
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google token is required' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user for Google login
      user = new User({
        name,
        email,
        authProvider: 'google',
        googleId,
        emailVerified: true,
        profilePhoto: picture,
      });
      await user.save();
    } else {
      // If user exists but used local auth, we could link it, or just log them in.
      // We will just log them in and update googleId if not present.
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        user.emailVerified = true;
        await user.save();
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    user.lastLogin = new Date();
    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        plan: user.plan,
        profilePhoto: user.profilePhoto
      }
    });

  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ success: false, message: 'Failed to authenticate with Google' });
  }
};

// ── Refresh Access Token ─────────────────────────────────────────────
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== tokenHash) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user._id);

    return res.status(200).json({ success: true, accessToken });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ── Forgot Password ─────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // TODO: Replace with actual email integration
      console.log("PASSWORD RESET LINK: http://localhost:5173/reset-password?token=" + resetToken);
    }

    // Always return same message for security
    return res.status(200).json({
      success: true,
      message: 'If this email exists, a reset link has been sent.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ── Reset Password ───────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    user.password = newPassword; // pre-save hook will hash it
    user.passwordResetToken = null;
    user.passwordResetExpiry = null;
    user.refreshToken = null; // Invalidate all sessions
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ── Get Profile ──────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ── Update Profile ───────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, profilePhoto } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate phone if provided
    if (phone) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit Indian phone number' });
      }
      user.phone = phone;
    }

    if (name !== undefined) user.name = name;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save();

    const updatedUser = await User.findById(req.userId).select('-password');
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ── Logout ───────────────────────────────────────────────────────────
const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { refreshToken: null });
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ── Change Password ──────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    user.password = newPassword; // pre-save hook will hash it
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

module.exports = {
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
};
