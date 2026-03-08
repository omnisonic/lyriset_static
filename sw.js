// BUMP THIS VERSION ON EVERY DEPLOY to force cache refresh on all devices
const CACHE_NAME = 'lyriset-v15';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/lyrics_app.css',
  '/js/clean_lyrics.js',
  '/js/chord_diagrams.js',
  '/js/lyrics_storage.js',
  '/js/theme_toggle.js',
  '/js/lyrics_app.js',
  '/js/reset_autofit.js',
  '/js/edit.js',
  '/js/search.js',
  '/theme_config.js',
  '/favicon.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
  // Force immediate activation
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network (same-origin only)
self.addEventListener('fetch', event => {
  // Skip cross-origin requests (CDN resources) — let browser handle them directly
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Listen for messages from client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
