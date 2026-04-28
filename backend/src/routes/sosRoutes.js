const express = require('express');
const router = express.Router();
const { triggerSos, cancelSos, markSafe, getSosHistory, getActiveSos } = require('../controllers/sosController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/trigger', triggerSos);
router.post('/cancel', cancelSos);
router.post('/mark-safe', markSafe);
router.get('/history', getSosHistory);
router.get('/active', getActiveSos);

module.exports = router;
