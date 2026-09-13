const CACHE = 'onebox-v18';
const APP_SHELL = ['./', 'index.html', 'style.css?v=2.9.5', 'app.js?v=2.9.5', 'calendar-data.js?v=2.9.5', 'manifest.webmanifest', 'icons/icon.svg', 'icons/bell.svg'];
const OPEN_METEO = /(^|\.)open-meteo\.com$/;
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
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
