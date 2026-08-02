import express from 'express';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/threads', protect, async (req, res) => {
  const messages = await Message.find({ $or: [{ sender: req.user._id }, { receiver: req.user._id }] })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .populate('product', 'title images')
    .populate('serviceRequest', 'title')
    .sort({ createdAt: -1 });
  res.json({ messages });
});

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

    // Persisted notification + bell/sound alert for the receiver, so they know even if not on the Chat page.
    const preview = text.length > 60 ? `${text.slice(0, 60)}...` : text;
    const notification = await Notification.create({
      recipient: receiverId,
      type: 'message',
      text: `${req.user.name} sent you a message: "${preview}"`,
      link: `/chat?with=${req.user._id}`,
      meta: { senderId: req.user._id, senderName: req.user.name }
    });
    io.to(String(receiverId)).emit('newNotification', notification);

    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message.', error: err.message });
  }
});

export default router;