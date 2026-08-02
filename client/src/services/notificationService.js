import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";
import api from "./api"; // Your Axios instance

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();

  if (permission !== "granted") return;

  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    console.log("FCM Token:", token);

    // Send token to backend to store against the logged-in user
    if (token) {
      await api.post('/users/fcm-token', { fcmToken: token });
    }

    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
}