const CACHE = 'onebox-v206';
const APP_SHELL = ['./', 'index.html', 'style.css?v=2.18.176', 'app.js?v=2.18.176', 'calendar-data.js?v=2.18.176', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon.svg?v=2.18.176', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-dark-180.png', 'icons/icon-dark-192.png', 'icons/icon-dark-512.png', 'icons/favicon-light-64.png', 'icons/favicon-light-64.png?v=2.18.176', 'icons/favicon-dark-64.png', 'icons/favicon-dark-64.png?v=2.18.176', 'apple-touch-icon.png', 'apple-touch-icon.png?v=2.18.176', 'apple-touch-icon-dark.png', 'apple-touch-icon-dark.png?v=2.18.176', 'icons/apple-touch-icon.png', 'icons/apple-touch-icon.png?v=2.18.176', 'icons/apple-touch-icon-dark.png', 'icons/apple-touch-icon-dark.png?v=2.18.176', 'icons/bell.svg', 'icons/bell-192.png', 'icons/weibo.png', 'icons/guancha.png?v=2.18.176', 'icons/ithome.svg', 'icons/ithome.svg?v=2.18.176', 'icons/bilibili.ico', 'icons/bilibili.ico?v=2.18.176', 'icons/hupu.ico', 'icons/hupu.ico?v=2.18.176'];
const CORE_APP_SHELL = APP_SHELL.slice(0, 6);
const OPTIONAL_APP_SHELL = APP_SHELL.slice(6);
const OPEN_METEO = /(^|\.)open-meteo\.com$/;
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE)
    .then((cache) => cache.addAll(CORE_APP_SHELL)
      .then(() => Promise.all(OPTIONAL_APP_SHELL.map((asset) => cache.add(asset).catch(() => null)))))
    .then(() => self.skipWaiting()));
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
  const isAppShellRequest = event.request.mode === 'navigate'
    || url.pathname.endsWith('/index.html')
    || url.pathname.endsWith('/app.js')
    || url.pathname.endsWith('/style.css')
    || url.pathname.endsWith('/calendar-data.js');
  if (isAppShellRequest) {
    event.respondWith(fetch(event.request, { cache: 'no-store' })
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./'))));
    return;
  }
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
