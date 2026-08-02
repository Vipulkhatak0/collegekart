import express from 'express';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import { haversineKm } from '../utils/geo.js';

const router = express.Router();

// @route GET /api/products?category=&search=&sort=&minPrice=&maxPrice=&lat=&lng=&radiusKm=
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, lat, lng, radiusKm } = req.query;
    const filter = { status: 'active' };
    if (category && category !== 'all') filter.category = category;
    if (minPrice || maxPrice) filter.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
    if (search) filter.$text = { $search: search };

    let query = Product.find(filter).populate('seller', 'name avatar sellerRating isSellerVerified hostel');
    if (sort === 'low') query = query.sort({ price: 1 });
    else if (sort === 'high') query = query.sort({ price: -1 });
    else if (sort !== 'nearby') query = query.sort({ createdAt: -1 });

    let products = await query.limit(200);
    products = products.map((p) => p.toObject());

    // Attach distance (km) from the requester when coordinates are supplied.
    if (lat && lng) {
      products = products.map((p) => ({
        ...p,
        distanceKm: haversineKm(Number(lat), Number(lng), p.location?.lat, p.location?.lng)
      }));

      if (radiusKm) {
        products = products.filter((p) => p.distanceKm === null || p.distanceKm <= Number(radiusKm));
      }
      if (sort === 'nearby') {
        products.sort((a, b) => {
          if (a.distanceKm === null) return 1;
          if (b.distanceKm === null) return -1;
          return a.distanceKm - b.distanceKm;
        });
      }
    }

    res.json({ products: products.slice(0, 100) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products.', error: err.message });
  }
});

// @route GET /api/products/mine/list — listings created by the logged-in user
router.get('/mine/list', protect, async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.json({ products });
});

// @route GET /api/products/category-counts — live count of active listings per category
router.get('/category-counts', async (req, res) => {
  try {
    const results = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const counts = {};
    results.forEach((r) => { counts[r._id] = r.count; });

    res.json({ counts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch category counts.', error: err.message });
  }
});

// @route GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('seller', 'name avatar phone sellerRating isSellerVerified hostel');
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product.', error: err.message });
  }
});

// @route POST /api/products  (multipart form: images[] + fields, incl. phone + location)
router.post('/', protect, upload.array('images', 6), async (req, res) => {
  try {
    const { title, description, price, originalPrice, category, condition, allowCOD, phone, address, lat, lng } = req.body;
    const images = (req.files || []).map((f) => f.path);
    if (images.length === 0) return res.status(400).json({ message: 'At least one image is required.' });
    if (!phone) return res.status(400).json({ message: 'A contact phone number is required.' });
    if (!address) return res.status(400).json({ message: 'A pickup location / address is required.' });

    const product = await Product.create({
      title, description, price, originalPrice, category, condition,
      allowCOD: allowCOD === 'true' || allowCOD === true,
      images, seller: req.user._id,
      phone,
      location: {
        address,
        lat: lat ? Number(lat) : undefined,
        lng: lng ? Number(lng) : undefined
      }
    });

    // Keep the seller's profile phone in sync so future listings can prefill it.
    if (!req.user.phone) {
      req.user.phone = phone;
      await req.user.save();
    }

    // Notify every admin with full poster details.
    const admins = await User.find({ role: 'admin' }).select('_id');
    const notifDocs = await Notification.insertMany(
      admins.map((a) => ({
        recipient: a._id,
        type: 'new_product',
        text: `${req.user.name} (${req.user.email}) listed a new product: "${title}"`,
        link: `/product/${product._id}`,
        meta: {
          posterId: req.user._id,
          posterName: req.user.name,
          posterEmail: req.user.email,
          posterPhone: phone,
          productId: product._id,
          category,
          price
        }
      }))
    );

    const io = req.app.get('io');
    notifDocs.forEach((n) => io.to(String(n.recipient)).emit('newNotification', n));

    // Lightweight broadcast so every connected client can show a "new listing" badge + sound.
    io.emit('newListing', { productId: product._id, title: product.title, category: product.category });

    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create listing.', error: err.message });
  }
});

// @route PUT /api/products/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (String(product.seller) !== String(req.user._id)) return res.status(403).json({ message: 'Not authorized to edit this listing.' });
    Object.assign(product, req.body);
    await product.save();
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update listing.', error: err.message });
  }
});

// @route DELETE /api/products/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (String(product.seller) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this listing.' });
    }
    await product.deleteOne();
    res.json({ message: 'Listing removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete listing.', error: err.message });
  }
});

// @route POST /api/products/:id/report
router.post('/:id/report', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $inc: { reportCount: 1 } }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.reportCount >= 5) { product.status = 'reported'; await product.save(); }
    res.json({ message: 'Listing reported. Our team will review it.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to report listing.', error: err.message });
  }
});

// @route POST /api/products/ai/description
router.post('/ai/description', protect, async (req, res) => {
  const { title, category, condition } = req.body;
  const description = `${title} in ${condition?.toLowerCase() || 'good'} condition. Well maintained and ready for a new owner on campus.`;
  res.json({ description });
});

// @route POST /api/products/ai/price-suggestion
router.post('/ai/price-suggestion', protect, async (req, res) => {
  const { category } = req.body;
  const similar = await Product.find({ category }).select('price').limit(20);
  const avg = similar.length ? Math.round(similar.reduce((a, p) => a + p.price, 0) / similar.length) : 1000;
  res.json({ suggestedPrice: avg });
});

export default router;