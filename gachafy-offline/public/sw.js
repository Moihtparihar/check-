// Enhanced service worker with offline request queuing
const CACHE_NAME = 'gachafi-poc-v4';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        self.clients.claim();
      })
  );
});

// Fetch event - smarter caching to avoid stale PWA and not interfere with wallet links
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET
  if (request.method !== 'GET') return;

  // Handle mint requests when offline
  if (request.url.includes('/api/mint') && !navigator.onLine) {
    event.respondWith(
      new Response(JSON.stringify({ queued: true }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      })
    );
    return;
  }

  const url = new URL(request.url);

  // Network-first for navigations to always get the latest app shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match('/');
        return cached || new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  // Stale-while-revalidate for our static assets
  const isSameOrigin = url.origin === self.location.origin;
  const isStaticAsset = /\.(?:js|css|png|jpg|jpeg|svg|ico|webp|woff2?)$/i.test(url.pathname);
  if (isSameOrigin && isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request).then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        });
        return cached || networkFetch;
      })
    );
    return;
  }

  // Default: just fetch (don’t cache cross-origin e.g., Radix endpoints, wallet links)
  event.respondWith(fetch(request));
});

// Listen for online events to process queued requests
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PROCESS_QUEUE') {
    processOfflineQueue();
  }
});

async function processOfflineQueue() {
  // This will be handled by the main thread
  // Send message to main thread to process queue
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'PROCESS_OFFLINE_QUEUE' });
  });
}