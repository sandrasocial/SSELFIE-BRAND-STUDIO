/**
 * Advanced Service Worker for SSELFIE Studio
 * Implements aggressive caching strategies for optimal performance
 */

const CACHE_NAME = 'sselfie-studio-v1.0.0';
const STATIC_CACHE = 'sselfie-static-v1.0.0';
const DYNAMIC_CACHE = 'sselfie-dynamic-v1.0.0';
const IMAGE_CACHE = 'sselfie-images-v1.0.0';

// Cache strategies
const CACHE_STRATEGIES = {
  // Static assets - cache first
  STATIC: ['css', 'js', 'woff', 'woff2', 'ttf', 'eot'],
  // Images - cache first with fallback
  IMAGES: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
  // API calls - network first with cache fallback
  API: ['/api/'],
  // HTML pages - network first with cache fallback
  HTML: ['html']
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll([
          '/',
          '/manifest.json',
          '/favicon.png',
          '/icon-192.png',
          '/icon-512.png'
        ]);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Failed to cache static assets', error);
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
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const strategy = getCacheStrategy(url);
  
  try {
    switch (strategy) {
      case 'STATIC':
        return await cacheFirst(request, STATIC_CACHE);
      case 'IMAGES':
        return await cacheFirstWithFallback(request, IMAGE_CACHE);
      case 'API':
        return await networkFirstWithCache(request, DYNAMIC_CACHE);
      case 'HTML':
        return await networkFirstWithCache(request, DYNAMIC_CACHE);
      default:
        return await networkFirstWithCache(request, DYNAMIC_CACHE);
    }
  } catch (error) {
    console.error('❌ Service Worker: Request failed', error);
    return new Response('Offline', { status: 503 });
  }
}

// Cache First Strategy - for static assets
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Cache First with Fallback - for images
async function cacheFirstWithFallback(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return a placeholder image for failed requests
    return new Response(
      '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" fill="#999">Image not available</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Network First with Cache Fallback - for API and HTML
async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Determine cache strategy based on URL
function getCacheStrategy(url) {
  const pathname = url.pathname;
  const extension = pathname.split('.').pop()?.toLowerCase();
  
  // API calls
  if (pathname.startsWith('/api/')) {
    return 'API';
  }
  
  // HTML pages
  if (extension === 'html' || pathname === '/' || !extension) {
    return 'HTML';
  }
  
  // Images
  if (CACHE_STRATEGIES.IMAGES.includes(extension)) {
    return 'IMAGES';
  }
  
  // Static assets
  if (CACHE_STRATEGIES.STATIC.includes(extension)) {
    return 'STATIC';
  }
  
  return 'HTML';
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Implement background sync logic here
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

