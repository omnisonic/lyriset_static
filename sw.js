const CACHE_NAME = 'lyriset-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/lyrics_app.css',
  '/js/clean_lyrics.js',
  '/js/lyrics_storage.js',
  '/js/theme_toggle.js',
  '/js/lyrics_app.js',
  '/js/reset_autofit.js',
  '/js/edit.js',
  '/favicon.png',
  '/icon-180.png',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
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
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
