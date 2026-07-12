import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route GET /api/orders/me
router.get('/me', protect, async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id }).populate('product').sort({ createdAt: -1 });
  res.json({ orders });
});

// @route POST /api/orders  — create order (COD or after payment confirmation)
router.post('/', protect, async (req, res) => {
  try {
    const { productId, paymentMethod, paymentRef } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') return res.status(400).json({ message: 'Product is not available.' });

    const order = await Order.create({
      product: product._id, buyer: req.user._id, seller: product.seller,
      price: product.price, paymentMethod, paymentRef,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      status: paymentMethod === 'cod' ? 'Pending' : 'Confirmed'
    });

    product.status = 'sold';
    await product.save();

    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create order.', error: err.message });
  }
});

// @route PUT /api/orders/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (String(order.seller) !== String(req.user._id) && String(order.buyer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    order.status = status;
    await order.save();
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order.', error: err.message });
  }
});

// --- Stripe payment intent (requires STRIPE_SECRET_KEY) ---
// @route POST /api/orders/stripe/create-intent
router.post('/stripe/create-intent', protect, async (req, res) => {
  try {
    const stripe = (await import('stripe')).default(process.env.STRIPE_SECRET_KEY);
    const { amount } = req.body; // amount in smallest currency unit (e.g. paise)
    const intent = await stripe.paymentIntents.create({ amount, currency: 'inr', metadata: { userId: String(req.user._id) } });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ message: 'Stripe payment intent failed.', error: err.message });
  }
});

// --- Razorpay order creation (requires RAZORPAY_KEY_ID / SECRET) ---
// @route POST /api/orders/razorpay/create-order
router.post('/razorpay/create-order', protect, async (req, res) => {
  try {
    const Razorpay = (await import('razorpay')).default;
    const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const { amount } = req.body; // amount in paise
    const order = await instance.orders.create({ amount, currency: 'INR', receipt: `ck_${Date.now()}` });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Razorpay order creation failed.', error: err.message });
  }
});

export default router;
