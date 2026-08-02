import admin from '../config/firebase.js'; // Adjust path to your firebase admin initialization

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
      sound: '/notification-sound.mp3'
    },
    webpush: {
      fcmOptions: {
        link: url || '/notifications'
      }
    }
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent FCM push message:', response);
    return response;
  } catch (error) {
    console.error('Error sending FCM push message:', error);
    // If token is invalid or unregistered, you can remove it from the user's DB record here if desired
  }
}