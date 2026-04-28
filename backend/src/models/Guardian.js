const mongoose = require('mongoose');

const guardianSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  guardianName: { type: String, required: true, trim: true, maxlength: 50 },
  guardianPhone: { 
    type: String, required: true, trim: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian mobile number']
  },
  relation: { 
    type: String, required: true,
    enum: ['Mother', 'Father', 'Sister', 'Brother', 'Friend', 'Partner', 'Colleague', 'Other']
  },
  isVerified: { type: Boolean, default: false },
  verificationOTP: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  otpAttempts: { type: Number, default: 0 },
  acceptedAt: { type: Date, default: null },
  lastAlertedAt: { type: Date, default: null },
  alertCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  notes: { type: String, default: null, maxlength: 200 },
  addedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Guardian', guardianSchema);
