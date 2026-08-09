import express from 'express';
import { protect } from '../middleware/auth.js';
import UserToken from '../models/UserToken.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Save/update this logged-in user's FCM device token
router.post('/notifications/fcm-token', protect, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Token is required.' });

    await UserToken.findOneAndUpdate(
      { userId: req.user._id },
      { fcmToken: token },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save token.', error: err.message });
  }
});

// Fetch this user's notifications (for your existing /notifications page)
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifs = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json({ notifications: notifs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications.', error: err.message });
  }
});

router.patch('/notifications/:id/read', protect, async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

export default router;
