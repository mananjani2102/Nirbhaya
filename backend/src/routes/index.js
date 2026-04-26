const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/sos', require('./sosRoutes'));
router.use('/guardian', require('./guardianRoutes'));
router.use('/map', require('./mapRoutes'));
router.use('/location', require('./locationRoutes'));
router.use('/subscription', require('./subscriptionRoutes'));

module.exports = router;
