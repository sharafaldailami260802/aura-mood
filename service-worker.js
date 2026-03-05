/* Aura Mood Analytics - PWA Service Worker
   Offline-first, background sync for backups, update notifications */

const CACHE_VERSION = 3;
const CACHE_NAME = 'aura-v' + CACHE_VERSION;
const OFFLINE_URL = './index.html';

const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js',
  'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.min.js',
  'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js',
  'https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js',
  'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.min.js',
  'https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css',
  'https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@300;400;600&family=DM+Sans:wght@400;500;700&display=swap'
];

// Install: cache app shell and CDN assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll([OFFLINE_URL].concat(CDN_ASSETS)).catch(function () {
        return cache.add(OFFLINE_URL);
      });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// Activate: take control, remove old caches, notify clients for update UI
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME && k.startsWith('aura-'); }).map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    }).then(function () {
      return self.clients.matchAll();
    }).then(function (clients) {
      clients.forEach(function (client) {
        client.postMessage({ type: 'AURA_SW_UPDATED' });
      });
    })
  );
});

// Fetch: main document = network-first (always fresh when online). Assets = cache-first, then network.
self.addEventListener('fetch', function (event) {
  var url = event.request.url;
  var sameOrigin = url.startsWith(self.location.origin);
  var isCdn = CDN_ASSETS.some(function (u) { return url.startsWith(u.split('?')[0]); });
  var isNavigate = event.request.mode === 'navigate';

  if (event.request.method !== 'GET') return;

  if (isNavigate) {
    // Always try network first for the page – no need for Cmd+Shift+R to see updates
    event.respondWith(
      fetch(event.request).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var clone = res.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clone); });
        }
        return res;
      }).catch(function () {
        return caches.match(OFFLINE_URL) || caches.match(event.request);
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached && (sameOrigin || isCdn)) return cached;
      return fetch(event.request).then(function (res) {
        if (!res || res.status !== 200 || res.type !== 'basic') return res;
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, clone);
        });
        return res;
      }).catch(function () {
        return null;
      });
    })
  );
});

// Background sync: for backup queue (app can register with tag 'aura-backup')
self.addEventListener('sync', function (event) {
  if (event.tag === 'aura-backup') {
    event.waitUntil(notifyBackupSync());
  }
});

function notifyBackupSync() {
  return self.clients.matchAll().then(function (clients) {
    clients.forEach(function (client) {
      client.postMessage({ type: 'AURA_BACKUP_SYNC' });
    });
  });
}

// Optional: push for local notifications
self.addEventListener('push', function (event) {
  var data = event.data ? event.data.json() : {};
  var title = data.title || 'Aura';
  var opts = { body: data.body || '', icon: data.icon || '/icon-192.png', badge: '/icon-192.png' };
  event.waitUntil(
    self.registration.showNotification(title, opts)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll().then(function (clients) {
      if (clients.length) clients[0].focus(); else self.clients.openWindow('/');
    })
  );
});

// Let the page request skipWaiting when showing "Update available"
self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
