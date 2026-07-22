import express from 'express';
import Gig from '../models/Gig.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const isPremiumActive = (user) => user?.premiumExpiresAt && new Date(user.premiumExpiresAt) > new Date();

// @route GET /api/gigs?category=
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { status: 'active' };
    if (category && category !== 'all') filter.category = category;

    const gigs = await Gig.find(filter)
      .populate('provider', 'name avatar premiumExpiresAt sellerRating isSellerVerified')
      .sort({ createdAt: -1 });

    // Featured (active premium) providers first, then most recent within each group.
    gigs.sort((a, b) => {
      const aPrem = isPremiumActive(a.provider) ? 1 : 0;
      const bPrem = isPremiumActive(b.provider) ? 1 : 0;
      if (aPrem !== bPrem) return bPrem - aPrem;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json({ gigs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch gigs.', error: err.message });
  }
});

router.get('/mine/list', protect, async (req, res) => {
  const gigs = await Gig.find({ provider: req.user._id }).sort({ createdAt: -1 });
  res.json({ gigs });
});

router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('provider', 'name avatar premiumExpiresAt sellerRating isSellerVerified college');
    if (!gig) return res.status(404).json({ message: 'Gig not found.' });
    res.json({ gig });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch gig.', error: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, price, deliveryDays, portfolioImage } = req.body;
    const gig = await Gig.create({
      title, description, category, price, deliveryDays, portfolioImage,
      provider: req.user._id
    });
    res.status(201).json({ gig });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create gig.', error: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found.' });
    if (String(gig.provider) !== String(req.user._id)) return res.status(403).json({ message: 'Not authorized.' });
    Object.assign(gig, req.body);
    await gig.save();
    res.json({ gig });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update gig.', error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: 'Gig not found.' });
    if (String(gig.provider) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    await gig.deleteOne();
    res.json({ message: 'Gig deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete gig.', error: err.message });
  }
});

export default router;