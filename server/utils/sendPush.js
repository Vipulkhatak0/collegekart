import admin from '../config/firebase.js';
import UserToken from '../models/UserToken.js';

export async function sendPushNotification(fcmToken, { title, body, url }) {
  if (!fcmToken) return;

  const message = {
    token: fcmToken,
    notification: {
      title: title || 'CollegeKart Notification',
      body: body || 'You have a new update!',
    },
    data: {
      url: url || '/notifications',
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Push sent:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

// NEW: push to everyone except one user (e.g. the person who created the listing)
export async function sendPushToAll({ title, body, url }, excludeUserId) {
  try {
    const filter = excludeUserId ? { userId: { $ne: excludeUserId } } : {};
    const tokens = (await UserToken.find(filter)).map((t) => t.fcmToken).filter(Boolean);
    if (tokens.length === 0) return;

    await admin.messaging().sendEachForMulticast({
      notification: { title, body },
      data: { url: url || '/notifications' },
      tokens,
    });
  } catch (err) {
    console.error('sendPushToAll error:', err);
  }
}

// NEW: push to a specific set of users (e.g. all admins)
export async function sendPushToUsers(userIds, { title, body, url }) {
  try {
    const tokens = (await UserToken.find({ userId: { $in: userIds } })).map((t) => t.fcmToken).filter(Boolean);
    if (tokens.length === 0) return;

    await admin.messaging().sendEachForMulticast({
      notification: { title, body },
      data: { url: url || '/notifications' },
      tokens,
    });
  } catch (err) {
    console.error('sendPushToUsers error:', err);
  }
}