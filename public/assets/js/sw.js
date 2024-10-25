const CACHE_NAME = 'event-reminder-v1';

const OFFLINE_PAGE = '/assets/pwa/offline.html';


// Resources to cache
const CACHED_RESOURCES = [
    '/',
    '/events',
    '/events/list',
    OFFLINE_PAGE,
    '/assets/js/offline/indexedDB.js',
    '/assets/js/offline/offline-manager.js',
    '/assets/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css',
    '/assets/plugins/ekko-lightbox/ekko-lightbox.css',
    '/assets/plugins/overlayScrollbars/css/OverlayScrollbars.min.css',
    '/assets/js/event_lists.js',
    '/assets/plugins/moment/moment.min.js',
    '/assets/plugins/tempusdominus-bootstrap-4/js/tempusdominus-bootstrap-4.min.js'
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

// Fetch Event Handler
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Handle API requests
    if (event.request.url.includes('/api/') || 
        event.request.url.includes('/event/') ||
        event.request.url.includes('/events/')) {
        
        if (event.request.method === 'GET') {
            event.respondWith(
                fetch(event.request)
                    .then((response) => {
                        // Cache the response if it's valid
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return cached response if available
                        return caches.match(event.request).then((response) => {
                            if (response) {
                                return response;
                            }
                            // If no cached response, return offline data
                            return new Response(
                                JSON.stringify({
                                    error: 'offline',
                                    message: 'No cached data available'
                                }),
                                {
                                    headers: { 'Content-Type': 'application/json' }
                                }
                            );
                        });
                    })
            );
        } else {
            // For non-GET requests, try to make the request
            event.respondWith(
                fetch(event.request)
                    .catch(() => {
                        // If offline, return a response indicating offline status
                        return new Response(
                            JSON.stringify({
                                error: 'offline',
                                message: 'Action queued for sync'
                            }),
                            {
                                headers: { 'Content-Type': 'application/json' }
                            }
                        );
                    })
            );
        }
        return;
    }

    // Handle page requests
    event.respondWith(
        fetch(event.request)
            .catch(() => {
                return caches.match(event.request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }
                        // If the request is for a page, return the offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_PAGE);
                        }
                        // For other resources, return an empty response
                        return new Response('', {
                            status: 408,
                            statusText: 'Request timeout'
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