const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  emailVerified: { type: Boolean, default: false },
  emailOTP: { type: String, default: null },
  emailOTPExpiry: { type: Date, default: null },
  refreshToken: { type: String, default: null },
  passwordResetToken: { type: String, default: null },
  passwordResetExpiry: { type: Date, default: null },
  emergencyPin: { type: String, default: null },
  profilePhoto: { type: String, default: null },
  address: { type: String, default: null },
  city: { type: String, default: null },
  lastLogin: { type: Date, default: null },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  phone: {
    type: String,
    required: function() { return this.authProvider === 'local'; },
    trim: true
  },
  password: {
    type: String,
    required: function() { return this.authProvider === 'local'; },
    minlength: 6
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  googleId: {
    type: String,
    default: null
  },
  plan: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free'
  },
  planExpiry: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('User', userSchema);
