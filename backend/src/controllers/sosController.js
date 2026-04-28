const SosAlert = require('../models/SosAlert');
const Guardian = require('../models/Guardian');
const { getIO } = require('../config/socket');
const twilio = require('twilio');

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const sendSMSToGuardian = async (guardian, alertData) => {
  const smsBody = `EMERGENCY ALERT from Nirbhaya\n\n${alertData.userName} needs immediate help!\n\nLocation: ${alertData.googleMapsLink}\n\nCall them: ${alertData.userPhone}\n\nThis alert was sent automatically by Nirbhaya safety app.`;
  
  if (!twilioClient) {
    console.log('[MOCK SMS] Would send to:', guardian.guardianPhone, 'Message:', smsBody);
    return { success: true, mock: true };
  }

  try {
    await twilioClient.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: guardian.guardianPhone
    });
    return { success: true };
  } catch (error) {
    console.error('SMS failed for', guardian.guardianPhone, error.message);
    return { success: false };
  }
};

const triggerSos = async (req, res) => {
  try {
    const { latitude, longitude, message } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Latitude and longitude are required" });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: "Invalid latitude or longitude" });
    }

    const existingAlert = await SosAlert.findOne({ userId: req.userId, status: 'active' });
    if (existingAlert) {
      return res.status(409).json({ success: false, message: "You already have an active SOS alert", alert: existingAlert });
    }

    const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    
    const sosAlert = new SosAlert({
      userId: req.userId,
      latitude,
      longitude,
      message: message || "I need help!",
      googleMapsLink,
      status: 'active'
    });

    const guardians = await Guardian.find({ userId: req.userId });
    
    if (!guardians || guardians.length === 0) {
      await sosAlert.save();
      return res.status(200).json({ success: true, warning: "No guardians added. Please add emergency contacts.", alert: sosAlert });
    }

    const alertData = {
      userName: req.user.name,
      userPhone: req.user.phone,
      googleMapsLink
    };

    const smsResults = await Promise.allSettled(guardians.map(g => sendSMSToGuardian(g, alertData)));
    
    let smsSentCount = 0;
    let smsFailedCount = 0;
    
    smsResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success) {
        smsSentCount++;
      } else {
        smsFailedCount++;
      }
    });

    sosAlert.guardiansAlerted = guardians.length;
    sosAlert.smsSentCount = smsSentCount;
    sosAlert.smsFailedCount = smsFailedCount;

    await sosAlert.save();

    const io = getIO();
    io.to("sos_" + req.userId).emit("sos-triggered", {
      alertId: sosAlert._id,
      userName: req.user.name,
      userPhone: req.user.phone,
      latitude,
      longitude,
      googleMapsLink,
      message: sosAlert.message,
      timestamp: sosAlert.createdAt,
      guardiansAlerted: guardians.length
    });

    return res.status(201).json({
      success: true,
      message: `SOS alert sent to ${smsSentCount} guardian(s)`,
      alert: sosAlert,
      guardiansAlerted: guardians.length,
      smsSent: smsSentCount,
      smsFailed: smsFailedCount
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const cancelSos = async (req, res) => {
  try {
    const alert = await SosAlert.findOne({ userId: req.userId, status: 'active' });
    
    if (!alert) {
      return res.status(404).json({ success: false, message: "No active SOS alert found" });
    }

    alert.status = 'cancelled';
    alert.cancelledAt = new Date();
    await alert.save();

    const io = getIO();
    io.to("sos_" + req.userId).emit("sos-cancelled", {
      userName: req.user.name,
      timestamp: new Date()
    });

    const guardians = await Guardian.find({ userId: req.userId });
    if (guardians && guardians.length > 0) {
      const smsBody = `FALSE ALARM - ${req.user.name} is safe. The SOS alert has been cancelled.`;
      
      const sendSMS = async (guardian) => {
        if (!twilioClient) {
          console.log('[MOCK SMS] Would send to:', guardian.guardianPhone, 'Message:', smsBody);
          return { success: true, mock: true };
        }
        try {
          await twilioClient.messages.create({
            body: smsBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: guardian.guardianPhone
          });
          return { success: true };
        } catch (error) {
          return { success: false };
        }
      };

      await Promise.allSettled(guardians.map(g => sendSMS(g)));
    }

    return res.status(200).json({ success: true, message: "SOS alert cancelled. Guardians have been notified." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const markSafe = async (req, res) => {
  try {
    const alert = await SosAlert.findOne({ userId: req.userId, status: 'active' });
    
    if (!alert) {
      return res.status(404).json({ success: false, message: "No active SOS alert found" });
    }

    alert.status = 'resolved';
    alert.resolved = true;
    alert.resolvedAt = new Date();
    await alert.save();

    const io = getIO();
    io.to("sos_" + req.userId).emit("user-safe", {
      userName: req.user.name,
      timestamp: alert.resolvedAt
    });

    const guardians = await Guardian.find({ userId: req.userId });
    if (guardians && guardians.length > 0) {
      const smsBody = `SAFE - ${req.user.name} is now safe. The emergency has been resolved.`;
      
      const sendSMS = async (guardian) => {
        if (!twilioClient) {
          console.log('[MOCK SMS] Would send to:', guardian.guardianPhone, 'Message:', smsBody);
          return { success: true, mock: true };
        }
        try {
          await twilioClient.messages.create({
            body: smsBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: guardian.guardianPhone
          });
          return { success: true };
        } catch (error) {
          return { success: false };
        }
      };

      await Promise.allSettled(guardians.map(g => sendSMS(g)));
    }

    return res.status(200).json({ success: true, message: "You are now marked as safe", alert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSosHistory = async (req, res) => {
  try {
    const { status } = req.query;
    let query = { userId: req.userId };
    
    if (status && ['active', 'resolved', 'cancelled'].includes(status)) {
      query.status = status;
    }
    
    const alerts = await SosAlert.find(query).sort({ createdAt: -1 }).limit(20);
    return res.status(200).json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveSos = async (req, res) => {
  try {
    const alert = await SosAlert.findOne({ userId: req.userId, status: 'active' });
    
    if (!alert) {
      return res.status(200).json({ success: true, hasActiveAlert: false });
    }

    return res.status(200).json({ success: true, hasActiveAlert: true, alert });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  triggerSos,
  cancelSos,
  markSafe,
  getSosHistory,
  getActiveSos
};
