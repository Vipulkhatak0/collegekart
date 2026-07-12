import express from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route PUT /api/users/me
router.put('/me', protect, async (req, res) => {
  const { name, phone, hostel, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, phone, hostel, avatar }, { new: true });
  res.json({ user });
});

// @route POST /api/users/wishlist/:productId
router.post('/wishlist/:productId', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const idx = user.wishlist.findIndex((id) => String(id) === req.params.productId);
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(req.params.productId);
  await user.save();
  res.json({ wishlist: user.wishlist });
});

// @route GET /api/users/wishlist
router.get('/wishlist', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  res.json({ wishlist: user.wishlist });
});

// --- Admin (must come before the generic '/:id' route below) ---
// @route GET /api/users (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ users });
});

// @route GET /api/users/admin/stats (admin)
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
  const [userCount, productCount, reportedCount] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments({ status: 'active' }),
    Product.countDocuments({ status: 'reported' })
  ]);
  res.json({ userCount, productCount, reportedCount });
});

// @route DELETE /api/users/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User removed.' });
});

// @route GET /api/users/:id — public profile snippet (used by chat/product views).
// Kept last so it never shadows the more specific routes above.
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar hostel sellerRating isSellerVerified');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(404).json({ message: 'User not found.' });
  }
});

export default router;
