const CACHE_NAME = 'event-reminder-v1';

const OFFLINE_PAGE = '/assets/pwa/offline.html';


// Resources to cache
const CACHED_RESOURCES = [
    // Pages
    '/',
    '/events',
    '/events/list',
    '/get_events',
    '/offline/status',
    '/manifest.json',
    '/login',
    OFFLINE_PAGE,
    
    // CSS Files
    '/assets/plugins/fontawesome-free/css/all.min.css',
    '/assets/dist/css/adminlte.min.css',
    '/assets/plugins/jquery-confirm-v3.3.4/css/jquery-confirm.css',
    '/assets/css/common.css',
    '/assets/plugins/icheck-bootstrap/icheck-bootstrap.min.css',
    '/assets/plugins/fullcalendar/main.css',
    '/assets/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css',
    '/assets/plugins/ekko-lightbox/ekko-lightbox.css',
    '/assets/plugins/overlayScrollbars/css/OverlayScrollbars.min.css',

    // JavaScript Files
    '/assets/js/offline/indexedDB.js',
    '/assets/js/offline/offline-manager.js',
    '/assets/plugins/jquery/jquery.min.js',
    '/assets/plugins/bootstrap/js/bootstrap.bundle.min.js',
    '/assets/plugins/jquery-ui/jquery-ui.min.js',
    '/assets/plugins/jquery-confirm-v3.3.4/js/jquery-confirm.js',
    '/assets/dist/js/adminlte.min.js',
    '/assets/js/common.js',
    '/assets/js/event_lists.js',
    '/assets/plugins/moment/moment.min.js',
    '/assets/plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js',
    '/assets/plugins/fullcalendar/main.js',
    '/assets/js/calendar_events.js',
    '/assets/plugins/ekko-lightbox/ekko-lightbox.min.js',
    '/assets/plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js',
    '/assets/plugins/filterizr/jquery.filterizr.min.js',

    // Images and Icons
    '/favicon.ico',
    // Add your PWA icons here
    '/assets/pwa/icons/icon-72x72.png',
    '/assets/pwa/icons/icon-96x96.png',
    '/assets/pwa/icons/icon-128x128.png',
    '/assets/pwa/icons/icon-144x144.png',
    '/assets/pwa/icons/icon-152x152.png',
    '/assets/pwa/icons/icon-192x192.png',
    '/assets/pwa/icons/icon-384x384.png',
    '/assets/pwa/icons/icon-512x512.png',

    // Add your PWA splash screens here
    '/assets/pwa/icons/splash-640x1136.png',
    '/assets/pwa/icons/splash-750x1334.png',
    '/assets/pwa/icons/splash-1242x2208.png',
    '/assets/pwa/icons/splash-1125x2436.png',
    '/assets/pwa/icons/splash-828x1792.png',
    '/assets/pwa/icons/splash-1242x2688.png',
    '/assets/pwa/icons/splash-1536x2048.png',
    '/assets/pwa/icons/splash-1668x2224.png',
    '/assets/pwa/icons/splash-2048x2732.png',

];

// Add this function at the top after your constants
async function checkResource(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`Checking ${url}: ${response.status}`);
        return response.ok;
    } catch (error) {
        console.error(`Failed to check ${url}:`, error);
        return false;
    }
}

// Then replace your install event with this
self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            try {
                // First check all resources
                console.log('Checking resources...');
                for (const url of CACHED_RESOURCES) {
                    const exists = await checkResource(url);
                    console.log(`${url}: ${exists ? '✅ Exists' : '❌ Not Found'}`);
                }

                const cache = await caches.open(CACHE_NAME);
                
                // Cache files individually
                await Promise.all(
                    CACHED_RESOURCES.map(url => 
                        cache.add(url)
                            .then(() => console.log('✅ Cached:', url))
                            .catch(error => {
                                console.error('❌ Failed to cache:', url, error);
                                return Promise.resolve(); // Continue with other files
                            })
                    )
                );

                console.log('Caching complete');
                return self.skipWaiting();
            } catch (error) {
                console.error('Installation failed:', error);
            }
        })()
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all clients
            self.clients.claim()
        ])
    );
});

// Also modify the fetch event handler to better handle HTML responses
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
      return;
  }

  // Handle API and dynamic routes
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/event/') ||
      event.request.url.includes('/events/') ||
      event.request.url.includes('/get_events')) {
      
      event.respondWith(
          fetch(event.request)
              .then((response) => {
                  if (response.redirected && response.url.includes('/login')) {
                      throw new Error('Auth required');
                  }
                  
                  if (response.status === 200) {
                      const responseClone = response.clone();
                      caches.open(CACHE_NAME).then((cache) => {
                          cache.put(event.request, responseClone);
                      });
                  }
                  return response;
              })
              .catch((error) => {
                  console.log('Fetch failed:', error);
                  
                  return caches.match(event.request).then((response) => {
                      if (response) {
                          return response;
                      }
                      
                      if (error.message === 'Auth required') {
                          return caches.match('/login');
                      }
                      
                      if (event.request.mode === 'navigate') {
                          return caches.match(OFFLINE_PAGE);
                      }
                      
                      if (event.request.headers.get('Accept')?.includes('application/json')) {
                          return new Response(
                              JSON.stringify({
                                  error: 'offline',
                                  message: 'No cached data available'
                              }),
                              {
                                  headers: { 'Content-Type': 'application/json' }
                              }
                          );
                      }
                      
                      return new Response('Offline', {
                          status: 503,
                          statusText: 'Service Unavailable'
                      });
                  });
              })
      );
      return;
  }

  // Handle page requests and static assets
  event.respondWith(
      caches.match(event.request)
          .then(cachedResponse => {
              if (cachedResponse) {
                  return cachedResponse;
              }
              return fetch(event.request)
                  .then(response => {
                      if (response.status === 200) {
                          const responseClone = response.clone();
                          caches.open(CACHE_NAME).then((cache) => {
                              cache.put(event.request, responseClone);
                          });
                      }
                      return response;
                  })
                  .catch(() => {
                      if (event.request.mode === 'navigate') {
                          return caches.match(OFFLINE_PAGE);
                      }
                      return new Response('Offline', {
                          status: 503,
                          statusText: 'Service Unavailable'
                      });
                  });
          })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-events') {
        event.waitUntil(syncEvents());
    }
});

// Handle push notifications
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/images/icons/icon-72x72.png',
            badge: '/images/icons/icon-72x72.png',
            data: {
                url: data.url
            }
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

async function syncEvents() {
    try {
        const response = await fetch('/offline/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Sync failed');
        }

        return response;
    } catch (error) {
        console.error('Background sync failed:', error);
        throw error;
    }
}