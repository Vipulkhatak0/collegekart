import express from 'express';
import AffiliateProduct from '../models/AffiliateProduct.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


router.get('/:id', async (req, res) => {
  try {
    const affiliateProduct = await AffiliateProduct.findById(req.params.id);
    if (!affiliateProduct) return res.status(404).json({ message: 'Product not found.' });
    res.json({ affiliateProduct });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product.', error: err.message });
  }
});

// @route GET /api/affiliate-products?category=
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;

    const affiliateProducts = await AffiliateProduct.find(filter).sort({ createdAt: -1 });
    res.json({ affiliateProducts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch affiliate products.', error: err.message });
  }
});

// @route POST /api/affiliate-products  (admin only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized. Admins only.' });
    }

    const { title, image, price, rating, category, affiliateLink } = req.body;
    if (!title || !image || !price || !category || !affiliateLink) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const affiliateProduct = await AffiliateProduct.create({
      title, image, price, rating, category, affiliateLink
    });

    res.status(201).json({ affiliateProduct });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create affiliate product.', error: err.message });
  }
});

// @route DELETE /api/affiliate-products/:id  (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized. Admins only.' });
    }

    const affiliateProduct = await AffiliateProduct.findById(req.params.id);
    if (!affiliateProduct) return res.status(404).json({ message: 'Affiliate product not found.' });

    await affiliateProduct.deleteOne();
    res.json({ message: 'Affiliate product removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete affiliate product.', error: err.message });
  }
});

export default router;