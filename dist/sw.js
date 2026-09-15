const CACHE = 'onebox-v76';
const APP_SHELL = ['./', 'index.html', 'style.css?v=2.18.30.1', 'app.js?v=2.18.30.1', 'calendar-data.js?v=2.18.30.1', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-dark-180.png', 'icons/icon-dark-192.png', 'icons/icon-dark-512.png', 'icons/bell.svg', 'icons/bell-192.png'];
const OPEN_METEO = /(^|\.)open-meteo\.com$/;
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});
self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data?.json() || {}; } catch { payload = { body: event.data?.text() || 'OneBox' }; }
  event.waitUntil(self.registration.showNotification(payload.title || 'OneBox', {
    body: payload.body || payload.text || 'OneBox 有新的消息',
    tag: payload.tag || 'onebox-push-' + Date.now(),
    icon: 'icons/bell-192.png',
    badge: 'icons/bell-192.png',
    renotify: true,
    data: payload.data || {},
  }));
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.endsWith('/sw.js')) return;
  if (OPEN_METEO.test(url.hostname)) {
    event.respondWith(fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request)));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => { const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response; }).catch(() => caches.match('./'))));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const target = windows.find((client) => 'focus' in client);
    return target ? target.focus() : clients.openWindow('./');
  }));
});
