// MARASSEURAVIE PWA Service Worker - Push Notifications & Offline Cache
const CACHE_NAME = 'marasseuravie-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/logo.png',
  '/icon-512.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      })
    ])
  );
});

// Real Web Push / FCM background handler
self.addEventListener('push', (event) => {
  let data = {
    title: 'MARASSEURAVIE',
    body: 'Nouvelle notification officielle.',
    icon: '/assets/logo.png',
    badge: '/assets/logo.png',
    data: { url: '/admin' }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = {
        title: payload.title || payload.notification?.title || data.title,
        body: payload.body || payload.message || payload.notification?.body || data.body,
        icon: payload.icon || payload.notification?.icon || '/assets/logo.png',
        badge: payload.badge || '/assets/logo.png',
        image: payload.image || payload.imageUrl || payload.notification?.image,
        data: payload.data || { url: payload.actionUrl || payload.url || '/admin' },
        tag: payload.tag || `mav-${Date.now()}`,
        renotify: true
      };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    image: data.image,
    data: data.data,
    tag: data.tag,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Voir la commande' },
      { action: 'close', title: 'Fermer' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, notificationOptions)
  );
});

// Push notification click handler - opens /admin/orders/:id
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  let targetUrl = '/';
  if (event.notification.data && event.notification.data.url) {
    targetUrl = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
