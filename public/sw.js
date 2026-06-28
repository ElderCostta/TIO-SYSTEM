const CACHE_NAME = 'tiosystem-pwa-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.jpg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      // Use Promise.allSettled to ensure that if any individual asset fails to cache,
      // the Service Worker itself is still installed and activated successfully.
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url)
            .then(() => console.log(`[Service Worker] Cached: ${url}`))
            .catch((err) => console.warn(`[Service Worker] Failed to cache: ${url}`, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and exclude chrome-extension / third-party API URLs if needed
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Exclude non-http(s) protocols like chrome-extension
  if (!url.protocol.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch from network in background to update cache (stale-while-revalidate pattern)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => { /* Ignore background fetch failures offline */ });
        
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Cache successful responses
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Fallback if offline and asset not in cache
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
