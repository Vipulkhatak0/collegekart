import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from './lib/api.js'; // ⚠️ adjust path if firebase.js isn't in src/ root

const firebaseConfig = {
  apiKey: "AIzaSyBTAsbQLwI0KJXl2kjR8QbxDnY8Ibydxqk",
  authDomain: "collegekart-4d653.firebaseapp.com",
  projectId: "collegekart-4d653",
  storageBucket: "collegekart-4d653.firebasestorage.app",
  messagingSenderId: "650123534519",
  appId: "1:650123534519:web:221f48054da2be41516d32",
  measurementId: "G-KSXEJDC41G"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export const requestNotificationPermission = async (isAdmin = false) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const fcmToken = await getToken(messaging, {
      vapidKey: "PASTE_YOUR_VAPID_KEY_HERE"
    });
    if (!fcmToken) return;

    // uses your existing axios instance — token/auth header handled automatically
   await api.post('/notifications/fcm-token', { token: fcmToken });
  } catch (err) {
    console.error("Notification permission error:", err);
  }
};

export const listenForForegroundMessages = (callback) => {
  return onMessage(messaging, (payload) => {
    if (callback) callback(payload);
  });
};

export { app, analytics, messaging };