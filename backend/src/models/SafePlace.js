const mongoose = require('mongoose');

const safePlaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { 
    type: String, required: true,
    enum: ['police', 'hospital', 'safezone', 'pharmacy', 'metro', 'bus_stand', 'atm', 'cafe']
  },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  address: { type: String, required: true },
  city: { type: String, required: true, lowercase: true, index: true },
  state: { type: String, default: 'India' },
  phone: { type: String, default: null },
  openHours: { type: String, default: '24/7' },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  safetyReports: { type: Number, default: 0 },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// CRITICAL: 2dsphere index for geospatial queries
safePlaceSchema.index({ location: '2dsphere' });
safePlaceSchema.index({ city: 1, type: 1 });

module.exports = mongoose.model('SafePlace', safePlaceSchema);
