import express from 'express';
import ServiceRequest from '../models/ServiceRequest.js';
import Bid from '../models/Bid.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = { status: status || 'open' };
    if (category && category !== 'all') filter.category = category;

    const requests = await ServiceRequest.find(filter)
      .populate('buyer', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch requests.', error: err.message });
  }
});

router.get('/mine/list', protect, async (req, res) => {
  const requests = await ServiceRequest.find({ buyer: req.user._id }).sort({ createdAt: -1 });
  res.json({ requests });
});

router.get('/:id', async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate('buyer', 'name avatar');
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    const bids = await Bid.find({ request: request._id })
      .populate('provider', 'name avatar')
      .sort({ price: 1 });

    res.json({ request, bids });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch request.', error: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, category, budget, deadline, contactInfo } = req.body;
    const request = await ServiceRequest.create({
      title, description, category, budget, deadline, contactInfo,
      buyer: req.user._id
    });

    const admins = await User.find({ role: 'admin' }).select('_id');
    const notifDocs = await Notification.insertMany(
      admins.map((a) => ({
        recipient: a._id,
        type: 'new_product',
        text: `${req.user.name} (${req.user.email}) posted a service request: "${title}"`,
        link: `/services/${request._id}`,
        meta: { posterId: req.user._id, posterName: req.user.name, posterEmail: req.user.email, requestId: request._id, category, budget }
      }))
    );

    const io = req.app.get('io');
    notifDocs.forEach((n) => io.to(String(n.recipient)).emit('newNotification', n));
    io.emit('newListing', { productId: request._id, title: request.title, category: 'Service Request' });

    res.status(201).json({ request });
  } catch (err) {
    res.status(500).json({ message: 'Failed to post request.', error: err.message });
  }
});

router.post('/:id/bids', protect, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id).populate('buyer', 'name email');
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (request.status !== 'open') return res.status(400).json({ message: 'This request is no longer open.' });
    if (String(request.buyer._id) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot bid on your own request.' });
    }

    const { price, message } = req.body;
    const bid = await Bid.create({ request: request._id, provider: req.user._id, price, message });

    // Notify the service request buyer about the new bid
    const notification = await Notification.create({
      recipient: request.buyer._id,
      type: 'new_bid',
      text: `${req.user.name} placed a bid of ₹${price} on your service request: "${request.title}"`,
      link: `/services/${request._id}`,
      meta: {
        providerId: req.user._id,
        providerName: req.user.name,
        requestId: request._id,
        bidId: bid._id,
        price
      }
    });

    const io = req.app.get('io');
    io.to(String(request.buyer._id)).emit('newNotification', notification);

    res.status(201).json({ bid });
  } catch (err) {
    res.status(500).json({ message: 'Failed to place bid.', error: err.message });
  }
});

router.put('/:id/bids/:bidId/accept', protect, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (String(request.buyer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the request owner can accept a bid.' });
    }

    const bid = await Bid.findById(req.params.bidId).populate('provider', 'name email');
    if (!bid) return res.status(404).json({ message: 'Bid not found.' });

    bid.status = 'accepted';
    await bid.save();

    await Bid.updateMany(
      { request: request._id, _id: { $ne: bid._id } },
      { status: 'rejected' }
    );

    request.status = 'assigned';
    request.acceptedBid = bid._id;
    await request.save();

    // Notify the provider that their bid was accepted
    const notification = await Notification.create({
      recipient: bid.provider._id,
      type: 'bid_accepted',
      text: `Your bid of ₹${bid.price} for "${request.title}" was accepted!`,
      link: `/services/${request._id}`,
      meta: {
        requestId: request._id,
        bidId: bid._id
      }
    });

    const io = req.app.get('io');
    io.to(String(bid.provider._id)).emit('newNotification', notification);

    res.json({ message: 'Bid accepted.', request, bid });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept bid.', error: err.message });
  }
});

router.put('/:id/complete', protect, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (String(request.buyer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the request owner can mark this complete.' });
    }
    request.status = 'completed';
    await request.save();
    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update request.', error: err.message });
  }
});

router.put('/:id/close', protect, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (String(request.buyer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the request owner can close this.' });
    }
    request.status = 'closed';
    await request.save();
    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: 'Failed to close request.', error: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (String(request.buyer) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    await Bid.deleteMany({ request: request._id });
    await request.deleteOne();
    res.json({ message: 'Request deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete request.', error: err.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found.' });
    if (String(request.buyer) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    if (request.status !== 'open') {
      return res.status(400).json({ message: 'Can only edit while the request is open.' });
    }

    const { title, description, category, budget, deadline, contactInfo } = req.body;
    Object.assign(request, { title, description, category, budget, deadline, contactInfo });
    await request.save();

    res.json({ request });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update request.', error: err.message });
  }
});

export default router;