import User from '../models/User.js';
import { sendPushNotification } from './sendPush.js'; // Your firebase send function

export async function notifyUserOnActivity(recipientUserId, title, body, targetUrl) {
  try {
    const recipient = await User.findById(recipientUserId);
    if (recipient && recipient.fcmToken) {
      await sendPushNotification(recipient.fcmToken, {
        title,
        body,
        url: targetUrl
      });
    }
  } catch (err) {
    console.error('Failed to trigger push notification:', err);
  }
}