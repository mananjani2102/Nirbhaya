const LocationShare = require('../models/LocationShare');
const User = require('../models/User');
const { getIO } = require('../config/socket');
const crypto = require('crypto');

const startShare = async (req, res) => {
  try {
    const { latitude, longitude, journeyTitle, destinationLat, destinationLng, estimatedArrival } = req.body;
    
    if (latitude === undefined || longitude === undefined || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: "Valid latitude and longitude are required" });
    }

    const shareCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const location = await LocationShare.findOneAndUpdate(
      { userId: req.userId },
      { 
        latitude, 
        longitude, 
        isActive: true,
        journeyTitle: journeyTitle || null,
        destinationLat: destinationLat || null,
        destinationLng: destinationLng || null,
        estimatedArrival: estimatedArrival || null,
        shareCode,
        startedAt: new Date(), 
        updatedAt: new Date() 
      },
      { upsert: true, new: true }
    );

    const io = getIO();
    io.to("sos_" + req.userId).emit("location-started", {
      latitude,
      longitude,
      userName: req.user.name,
      journeyTitle,
      destinationLat,
      destinationLng,
      estimatedArrival,
      shareCode
    });

    return res.status(200).json({ 
      success: true, 
      location, 
      shareCode,
      message: "Location sharing started. Share code: " + shareCode 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (latitude === undefined || longitude === undefined || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: "Valid latitude and longitude are required" });
    }

    const location = await LocationShare.findOne({ userId: req.userId });

    if (!location || !location.isActive) {
      return res.status(404).json({ success: false, message: "No active share session. Start a new one." });
    }

    location.latitude = latitude;
    location.longitude = longitude;
    location.updatedAt = new Date();
    
    await location.save();

    const io = getIO();
    io.to("sos_" + req.userId).emit("location-updated", {
      latitude,
      longitude,
      timestamp: location.updatedAt
    });

    if (location.estimatedArrival) {
      const now = new Date();
      const diffMs = new Date(location.estimatedArrival) - now;
      if (diffMs > 0 && diffMs <= 5 * 60 * 1000) {
        io.to("sos_" + req.userId).emit("journey-eta-alert", {
          message: "User is within 5 minutes of their destination.",
          estimatedArrival: location.estimatedArrival
        });
      }
    }

    return res.status(200).json({ success: true, location, sharingActive: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const stopShare = async (req, res) => {
  try {
    const location = await LocationShare.findOneAndUpdate(
      { userId: req.userId },
      { isActive: false, shareCode: null },
      { new: true }
    );

    const io = getIO();
    io.to("sos_" + req.userId).emit("location-stopped", {
      userName: req.user.name,
      timestamp: new Date()
    });

    return res.status(200).json({ success: true, message: "Location sharing ended safely." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSharedLocation = async (req, res) => {
  try {
    const { shareCode } = req.query;

    if (!shareCode) {
      return res.status(400).json({ success: false, message: "Share code is required" });
    }

    const location = await LocationShare.findOne({ shareCode: shareCode.toUpperCase(), isActive: true }).populate('userId', 'name');

    if (!location) {
      return res.status(404).json({ success: false, message: "No active share found for this code" });
    }

    return res.status(200).json({ 
      success: true, 
      latitude: location.latitude,
      longitude: location.longitude,
      userName: location.userId.name,
      updatedAt: location.updatedAt,
      journeyTitle: location.journeyTitle
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyLocation = async (req, res) => {
  try {
    const location = await LocationShare.findOne({ userId: req.userId });

    if (!location || !location.isActive) {
      return res.status(200).json({ success: true, isSharing: false });
    }

    return res.status(200).json({ success: true, isSharing: true, location });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  startShare,
  updateLocation,
  stopShare,
  getSharedLocation,
  getMyLocation
};
