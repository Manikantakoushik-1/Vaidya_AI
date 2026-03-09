const CACHE_NAME = 'vaidyaai-v2';
const API_CACHE = 'vaidyaai-api-v1';
const MAX_API_CACHE = 10;

const STATIC_ASSETS = [
  '/',
  '/consultation',
  '/hospitals',
  '/history',
  '/analytics',
  '/chat',
  '/reminders',
  '/offline',
  '/manifest.json',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== API_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: strategy based on request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: Network First, Cache Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(API_CACHE);
            // Limit API cache to last N entries
            const keys = await cache.keys();
            if (keys.length >= MAX_API_CACHE) {
              await cache.delete(keys[0]);
            }
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || new Response('{"error":"offline"}', { headers: { 'Content-Type': 'application/json' } })))
    );
    return;
  }

  // Static assets: Cache First, Network Fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok && request.method === 'GET') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          if (request.destination === 'document') {
            return caches.match('/offline');
          }
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Push notification listener
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'VaidyaAI';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: data.actions || [],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data || '/')
  );
});
