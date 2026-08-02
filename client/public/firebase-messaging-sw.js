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
  const { title, body, icon, image } = payload.notification || {};
  const data = payload.data || {};

  const notificationTitle = title || "CollegeKart Notification";
  const notificationOptions = {
    body: body || "You have a new update on CollegeKart!",
    icon: icon || "/logo192.png",
    image: image,
    // Vibrate pattern for mobile devices (vibrate, pause, vibrate)
    vibrate: [200, 100, 200],
    // Pass sound file path (fallback to standard audio asset if available)
    data: { 
      url: data.url || "/notifications",
      sound: data.sound || "/notification-sound.mp3"
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  const soundUrl = event.notification.data?.sound;
  if (soundUrl) {
    // Optional client-side sound execution on click if required
    const audio = new Audio(soundUrl);
    audio.play().catch(() => {});
  }

  const urlToOpen = event.notification.data?.url || "/notifications";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});