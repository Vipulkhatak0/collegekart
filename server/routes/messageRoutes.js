import express from 'express';
import Message from '../models/Message.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route GET /api/messages/threads — list conversation threads for the logged-in user
router.get('/threads', protect, async (req, res) => {
  const messages = await Message.find({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .populate('product', 'title images')
    .populate('serviceRequest', 'title')
    .sort({ createdAt: -1 });
  res.json({ messages });
});

// @route GET /api/messages/:userId — conversation with a specific user
router.get('/:userId', protect, async (req, res) => {
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: req.params.userId },
      { sender: req.params.userId, receiver: req.user._id }
    ]
  })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .populate('product', 'title images')
    .populate('serviceRequest', 'title')
    .sort({ createdAt: 1 });
  res.json({ messages });
});

// @route POST /api/messages
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, productId, serviceRequestId, text, isOffer, offerAmount } = req.body;
    let message = await Message.create({
      sender: req.user._id, receiver: receiverId, product: productId, serviceRequest: serviceRequestId,
      text, isOffer, offerAmount
    });
    message = await message.populate([
      { path: 'sender', select: 'name avatar' },
      { path: 'receiver', select: 'name avatar' },
      { path: 'product', select: 'title images' },
      { path: 'serviceRequest', select: 'title' }
    ]);

    const io = req.app.get('io');
    io.to(String(receiverId)).emit('newMessage', message);
    io.to(String(req.user._id)).emit('newMessage', message);

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message.', error: err.message });
  }
});

export default router;