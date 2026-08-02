self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'CollegeKart Notification';
  
  const options = {
    body: data.body || 'You have a new update on CollegeKart!',
    icon: '/logo192.png',
    badge: '/badge.png',
    // Vibrate pattern for mobile devices (e.g., vibrate, pause, vibrate)
    vibrate: [200, 100, 200],
    // Pass sound URL if supported by the notification payload
    data: { 
      url: data.url || '/notifications',
      sound: data.sound || '/notification-sound.mp3'
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  
  // Optional: Play audio client-side when notification is clicked if desired
  const soundUrl = event.notification.data?.sound;
  if (soundUrl) {
    const audio = new Audio(soundUrl);
    audio.play().catch(() => {});
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});