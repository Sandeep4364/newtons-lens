// Service Worker for Newton's Lens PWA
const CACHE_NAME = 'newtons-lens-v1';
const OFFLINE_CACHE = 'newtons-lens-offline-v1';
const ANALYSIS_CACHE = 'newtons-lens-analysis-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== OFFLINE_CACHE && 
              cacheName !== ANALYSIS_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests differently
  if (url.pathname.includes('/api/') || url.pathname.includes('/functions/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful analysis responses
          if (response.ok && url.pathname.includes('analyze')) {
            const responseClone = response.clone();
            caches.open(ANALYSIS_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached analysis or offline message
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Return offline analysis response
            return new Response(
              JSON.stringify({
                status: 'offline',
                message: 'You are offline. Using cached analysis or mock data.',
                offline: true
              }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Handle static assets with network-first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache the response for future offline use
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Try to serve from cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          
          // Return empty response for other requests
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Background sync for queued analysis requests
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-analysis') {
    event.waitUntil(syncQueuedAnalysis());
  }
});

async function syncQueuedAnalysis() {
  try {
    // Get queued analysis requests from IndexedDB
    const db = await openDatabase();
    const requests = await getAllQueuedRequests(db);
    
    // Process each queued request
    for (const req of requests) {
      try {
        await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: req.body
        });
        
        // Remove from queue on success
        await removeQueuedRequest(db, req.id);
      } catch (error) {
        console.error('[Service Worker] Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Helper functions for IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('newtons-lens-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('analysis-queue')) {
        db.createObjectStore('analysis-queue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getAllQueuedRequests(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['analysis-queue'], 'readonly');
    const store = transaction.objectStore('analysis-queue');
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removeQueuedRequest(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['analysis-queue'], 'readwrite');
    const store = transaction.objectStore('analysis-queue');
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New analysis available',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'newtons-lens-notification',
    requireInteraction: false
  };
  
  event.waitUntil(
    self.registration.showNotification('Newton\'s Lens', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
