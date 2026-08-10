importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBTAsbQLwI0KJXl2kjR8QbxDnY8Ibydxqk",
  authDomain: "collegekart-4d653.firebaseapp.com",
  projectId: "collegekart-4d653",
  storageBucket: "collegekart-4d653.firebasestorage.app",
  messagingSenderId: "650123534519",
  appId: "1:650123534519:web:221f48054da2be41516d32"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = payload.notification?.title || data.title || 'CollegeKart Notification';

  self.registration.showNotification(title, {
    body: payload.notification?.body || data.body || 'You have a new update on CollegeKart!',
    icon: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url: payload.notification?.click_action || data.url || '/notifications' }
  });
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});