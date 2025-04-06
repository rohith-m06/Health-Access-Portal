/**
 * Service Worker for HealthAccess
 * Provides offline functionality and caching
 */

const CACHE_NAME = 'healthaccess-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/access.html',
  '/css/styles.css',
  '/css/responsive.css',
  '/js/app.js',
  '/js/database.js',
  '/js/offline.js',
  '/js/map.js',
  '/js/resources.js',
  '/js/assessment.js',
  '/js/telehealth.js',
  '/js/server-connection.js',
  '/js/ai-assistant.js',
  '/pages/map.html',
  '/pages/education.html',
  '/pages/assessment.html',
  '/pages/telehealth.html',
  '/pages/settings.html',
  '/pages/ai-assistant.html'
];

// Install event - cache basic assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Ensure the service worker takes control immediately
  return self.clients.claim();
});

// Fetch event - serve from cache or fetch from network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip certain URLs (like remote APIs or external resources)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin && !url.href.includes('unpkg.com') && !url.href.includes('cdn.jsdelivr.net')) {
    return;
  }
  
  // Cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached response
          return cachedResponse;
        }
        
        // If not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response since it can only be consumed once
            const responseToCache = response.clone();
            
            // Add the response to the cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // If HTML page request fails, return the offline fallback page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            // Otherwise, just return the error
            throw error;
          });
      })
  );
});

// Handle messages from the client
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
