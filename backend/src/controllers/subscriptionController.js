const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const User = require('../models/User');

const PLANS = {
  premium: { amount: 19900, label: 'Premium Monthly', days: 30, amountInRupees: 199 },
  annual: { amount: 149900, label: 'Nirbhaya Annual', days: 365, amountInRupees: 1499 }
};

let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id') {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.warn('[PAYMENT] Razorpay not configured. Payment features disabled.');
}

const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: "Invalid plan. Choose 'premium' or 'annual'" });
    }

    const existing = await Subscription.findOne({ userId: req.userId });
    if (existing && existing.status === 'active' && existing.expiryDate > new Date()) {
      return res.status(409).json({ success: false, message: "You already have an active plan.", subscription: existing });
    }

    if (!razorpay) {
      return res.status(503).json({ success: false, message: "Payment gateway not configured. Please contact support." });
    }

    const receipt = "Nirbhaya_" + req.userId + "_" + Date.now();

    const order = await razorpay.orders.create({
      amount: PLANS[plan].amount,
      currency: 'INR',
      receipt,
      notes: { plan, userId: req.userId.toString(), userName: req.user.name }
    });

    await Subscription.findOneAndUpdate(
      { userId: req.userId },
      { 
        plan, 
        razorpayOrderId: order.id, 
        status: 'pending', 
        amount: PLANS[plan].amount, 
        updatedAt: new Date() 
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ 
      success: true, 
      order, 
      key: process.env.RAZORPAY_KEY_ID, 
      plan: PLANS[plan] 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !plan) {
      return res.status(400).json({ success: false, message: "Missing required payment details" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    
    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment signature verification failed. Do not retry." });
    }

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + PLANS[plan].days);
    
    const invoiceNumber = "SH-" + Date.now().toString().slice(-8);

    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.userId },
      {
        status: 'active',
        startDate,
        expiryDate,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        invoiceNumber,
        updatedAt: new Date()
      },
      { new: true }
    );

    await User.findByIdAndUpdate(req.userId, { plan: 'premium', planExpiry: expiryDate });

    return res.status(200).json({ 
      success: true, 
      message: "Payment verified. Welcome to Nirbhaya Premium!", 
      subscription, 
      invoiceNumber 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const subscription = await Subscription.findOne({ userId: req.userId });

    const daysRemaining = subscription && subscription.expiryDate 
      ? Math.max(0, Math.ceil((subscription.expiryDate - new Date()) / (1000 * 60 * 60 * 24)))
      : 0;

    return res.status(200).json({ 
      success: true, 
      plan: user.plan, 
      planExpiry: user.planExpiry, 
      daysRemaining, 
      isActive: daysRemaining > 0, 
      subscription 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const { reason } = req.body;

    const subscription = await Subscription.findOne({ userId: req.userId, status: 'active' });
    
    if (!subscription) {
      return res.status(404).json({ success: false, message: "No active subscription found" });
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.cancellationReason = reason || 'User requested cancellation';
    
    await subscription.save();

    await User.findByIdAndUpdate(req.userId, { plan: 'free', planExpiry: null });

    return res.status(200).json({ 
      success: true, 
      message: "Subscription cancelled. Your premium access continues until " + subscription.expiryDate 
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getInvoice = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.userId, 
      $or: [{ status: 'active' }, { invoiceNumber: { $ne: null } }] 
    });
    
    if (!subscription) {
      return res.status(404).json({ success: false, message: "No invoice available" });
    }

    const user = await User.findById(req.userId);

    const invoice = {
      invoiceNumber: subscription.invoiceNumber,
      userName: user.name,
      email: user.email,
      plan: subscription.plan,
      amount: subscription.amount,
      currency: subscription.currency,
      startDate: subscription.startDate,
      expiryDate: subscription.expiryDate,
      paymentId: subscription.razorpayPaymentId,
      issuedAt: subscription.updatedAt
    };

    return res.status(200).json({ success: true, invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const handleWebhook = async (req, res) => {
  try {
    const webhookSig = req.headers['x-razorpay-signature'];
    
    // In production you might want to use the raw body for signature verification if your framework changes JSON payload.
    // Assuming express.json() is used and parsing body correctly.
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex');
    
    if (webhookSig !== expectedSig) {
      return res.status(401).send();
    }

    const event = req.body.event;

    if (event === 'payment.captured') {
      // confirm subscription
    } else if (event === 'payment.failed') {
      // mark subscription as failed, notify user
    } else if (event === 'subscription.cancelled') {
      // update to cancelled
    }

    return res.status(200).send();
  } catch (error) {
    return res.status(500).send();
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getStatus,
  cancelSubscription,
  getInvoice,
  handleWebhook
};
