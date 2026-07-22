import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const PREMIUM_PRICE_PAISE = 9900; // ₹99

// @route POST /api/premium/create-order
router.post('/create-order', protect, async (req, res) => {
  try {
    const Razorpay = (await import('razorpay')).default;
    const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const order = await instance.orders.create({
      amount: PREMIUM_PRICE_PAISE,
      currency: 'INR',
      receipt: `premium_${req.user._id}_${Date.now()}`
    });
    res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create payment order.', error: err.message });
  }
});

// @route POST /api/premium/verify
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed.' });
    }

    const user = await User.findById(req.user._id);
    const currentExpiry = user.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date()
      ? new Date(user.premiumExpiresAt)
      : new Date();
    user.premiumExpiresAt = new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    res.json({ message: 'Premium activated!', premiumExpiresAt: user.premiumExpiresAt });
  } catch (err) {
    res.status(500).json({ message: 'Failed to verify payment.', error: err.message });
  }
});

export default router;