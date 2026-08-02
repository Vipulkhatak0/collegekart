importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBTAsbQLwI0KJXl2kjR8QbxDnY8Ibydxqk",
  authDomain: "collegekart-4d653.firebaseapp.com",
  projectId: "collegekart-4d653",
  storageBucket: "collegekart-4d653.firebasestorage.app",
  messagingSenderId: "650123534519",
  appId: "1:650123534519:web:221f48054da2be41516d32",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || "CollegeKart", {
    body,
    icon: icon || "/logo192.png",
  });
});