const express = require('express');
const router = express.Router();
const { startShare, updateLocation, stopShare, getSharedLocation, getMyLocation } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/shared', getSharedLocation); // NO auth - public

router.use(protect);

router.post('/start', startShare);
router.put('/update', updateLocation);
router.post('/stop', stopShare);
router.get('/status', getMyLocation);

module.exports = router;
