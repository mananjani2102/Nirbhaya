const mongoose = require('mongoose');

const locationShareSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  },
  journeyTitle: { type: String, default: null },
  estimatedArrival: { type: Date, default: null },
  destinationLat: { type: Number, default: null },
  destinationLng: { type: Number, default: null },
  shareCode: { type: String, unique: true, sparse: true },
  startedAt: {
    type: Date,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LocationShare', locationShareSchema);
