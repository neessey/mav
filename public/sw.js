// MARASSEURAVIE - production Web Push service worker
const CACHE_NAME = 'marasseuravie-v2';
const CORE_ASSETS = ['/', '/index.html', '/manifest.json', '/assets/logo.png', '/icon-512.svg'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {})));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html')))
  );
});

self.addEventListener('push', (event) => {
  let payload = {
    title: 'MARASSEURAVIE',
    body: 'Nouvelle notification.',
    icon: '/assets/logo.png',
    badge: '/assets/logo.png',
    data: { url: '/admin' },
    tag: `mav-${Date.now()}`,
  };

  if (event.data) {
    try {
      const input = event.data.json();
      payload = {
        ...payload,
        ...input,
        data: input.data || { url: input.actionUrl || input.url || '/admin' },
      };
    } catch {
      payload.body = event.data.text();
    }
  }

  // Safari requires every push to produce a visible notification.
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: payload.badge,
      ...(payload.image ? { image: payload.image } : {}),
      data: payload.data,
      tag: payload.tag,
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'close') return;

  const rawUrl = event.notification.data?.url || '/admin';
  const targetUrl = new URL(rawUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          if ('navigate' in client) client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
      return undefined;
    })
  );
});
