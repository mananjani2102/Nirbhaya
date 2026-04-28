const express = require('express');
const router = express.Router();
const { 
  getGuardians, 
  addGuardian, 
  verifyGuardian,
  resendOTP,
  updateGuardian,
  removeGuardian,
  sendTestAlert
} = require('../controllers/guardianController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getGuardians);
router.post('/', addGuardian);
router.post('/verify', verifyGuardian);
router.post('/resend-otp', resendOTP);
router.put('/:id', updateGuardian);
router.delete('/:id', removeGuardian);
router.post('/:id/test-alert', sendTestAlert);

module.exports = router;
