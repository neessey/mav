// Firebase Cloud Messaging Service Worker for MARASSEURAVIE
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Fallback native push listener
self.addEventListener('push', (event) => {
  if (event.data) {
    let payload;
    try {
      payload = event.data.json();
    } catch (e) {
      payload = { notification: { title: 'MARASSEURAVIE', body: event.data.text() } };
    }

    const title = payload.notification?.title || payload.title || '🛍️ Nouvelle commande — MARASSEURAVIE';
    const options = {
      body: payload.notification?.body || payload.body || payload.message || 'Détails de commande reçus.',
      icon: '/assets/logo.png',
      badge: '/assets/logo.png',
      image: payload.notification?.image || payload.image,
      data: payload.data || { url: '/admin/orders' },
      tag: 'mav-order-notification',
      renotify: true,
      vibrate: [200, 100, 200]
    };

    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/admin/orders';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
