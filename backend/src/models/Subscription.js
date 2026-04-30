const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  plan: { type: String, enum: ['free', 'premium', 'annual'], default: 'free' },
  status: { type: String, enum: ['active', 'expired', 'cancelled', 'pending'], default: 'pending' },
  razorpayOrderId: { type: String, default: null },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },
  amount: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  startDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },
  autoRenew: { type: Boolean, default: false },
  cancelledAt: { type: Date, default: null },
  cancellationReason: { type: String, default: null },
  invoiceNumber: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.expiryDate > new Date();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
