const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  verifyPayment, 
  getStatus, 
  cancelSubscription, 
  getInvoice, 
  handleWebhook 
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/webhook', express.json(), handleWebhook); // NO protect middleware

router.use(protect);

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/status', getStatus);
router.post('/cancel', cancelSubscription);
router.get('/invoice', getInvoice);

module.exports = router;
