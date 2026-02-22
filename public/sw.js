const CACHE_NAME = 'yourel-cache-v2';
const CRITICAL_ASSETS = [
  '/yourel-logo.png',
  '/',
  '/logos/vercel.ico',
  '/logos/github.svg',
  '/logos/netlify.ico',
  '/logos/railway.ico',
  '/logos/render.png',
  '/logos/bubble.webp',
  '/logos/framer.png',
  '/logos/replit.png',
  '/logos/bolt.png',
  '/logos/bolt.ico',
  '/logos/fly.svg',
  '/logos/lovable.ico',
  '/logos/emergent.jpg',
  '/logos/huggingface.png',
  '/logos/huggingface.svg',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching critical assets including logos');
        return cache.addAll(CRITICAL_ASSETS);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache-first for logos and images, network-first for everything else
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Cache-first for logo assets and images
  if (url.pathname.startsWith('/logos/') || url.pathname === '/yourel-logo.png') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) return response;
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return networkResponse;
          });
        })
        .catch(() => new Response('Image not available', { status: 404 }))
    );
  }
});
