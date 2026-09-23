const CACHE = 'onebox-v320';
const APP_SHELL = ['./', 'index.html', 'style.css?v=2.18.301', 'app.js?v=2.18.301', 'calendar-data.js?v=2.18.301', 'manifest.webmanifest', 'manifest.webmanifest?v=2.18.301', 'favicon.ico', 'favicon-v299.ico', 'favicon-v299.svg', 'favicon-v299.png', 'favicon-v299-512.png', 'favicon-v297.svg', 'favicon-v297.png', 'favicon-v297-512.png', 'favicon-v297.ico', 'favicon-v297-120x120.png', 'favicon-v297-152x152.png', 'favicon-v297-167x167.png', 'favicon-v297.png', 'favicon-v297-180x180.png', 'favicon-v297-192.png', 'favicon-v297-precomposed.png', 'favicon.ico', 'favicon-v297.svg', 'favicon-v297.png', 'favicon-v297-512.png', 'favicon-v297.ico', 'apple-touch-icon-v297-120x120.png', 'apple-touch-icon-v297-152x152.png', 'apple-touch-icon-v297-167x167.png', 'apple-touch-icon-v297.png', 'apple-touch-icon-v297-192.png', 'apple-touch-icon-precomposed-v297.png', 'favicon-v295.ico', 'favicon-v294.ico', 'favicon-v294.png', 'favicon-v293.ico', 'favicon-v292.ico', 'favicon-v292.png', 'favicon-v291.png', 'favicon-v291-64.png', 'apple-touch-icon.png', 'apple-touch-icon-safari-black.png', 'apple-touch-icon-dark.png', 'apple-touch-icon-precomposed.png', 'apple-touch-icon-v297-120x120.png', 'apple-touch-icon-v297-152x152.png', 'apple-touch-icon-v297-167x167.png', 'apple-touch-icon-v297.png', 'apple-touch-icon-v297-192.png', 'apple-touch-icon-precomposed-v297.png', 'apple-touch-icon-v295-120x120.png', 'apple-touch-icon-v295-152x152.png', 'apple-touch-icon-v295-167x167.png', 'apple-touch-icon-v295.png', 'apple-touch-icon-v295-180x180.png', 'apple-touch-icon-v295-192.png', 'apple-touch-icon-precomposed-v295.png', 'apple-touch-icon-v294-120x120.png', 'apple-touch-icon-v294-152x152.png', 'apple-touch-icon-v294-167x167.png', 'apple-touch-icon-v294-180x180.png', 'apple-touch-icon-v294-192.png', 'apple-touch-icon-precomposed-v294.png', 'apple-touch-icon-v292-120x120.png', 'apple-touch-icon-v292-152x152.png', 'apple-touch-icon-v292-167x167.png', 'apple-touch-icon-v292-180x180.png', 'apple-touch-icon-v292-192.png', 'apple-touch-icon-precomposed-v292.png', 'apple-touch-icon-v291-120x120.png', 'apple-touch-icon-v291-152x152.png', 'apple-touch-icon-v291-167x167.png', 'apple-touch-icon-v291-180x180.png', 'apple-touch-icon-v291-192.png', 'apple-touch-icon-precomposed-v291.png', 'apple-touch-icon-120x120.png', 'apple-touch-icon-152x152.png', 'apple-touch-icon-167x167.png', 'apple-touch-icon-180x180.png', 'apple-touch-icon-black-192.png', 'apple-touch-icon-precomposed.png', 'icons/share-icon-1024.png', 'icons/mascot-fox-full-reactions.png', 'icons/mascot-fox-full-reactions.png?v=2.18.301', 'icons/mascot-fox-full.png', 'icons/mascot-fox-full.png?v=2.18.301', 'icons/icon.svg', 'icons/icon.svg?v=2.18.301', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-dark-180.png', 'icons/icon-dark-192.png', 'icons/icon-dark-512.png', 'icons/icon-safari-black-192.png', 'icons/icon-safari-black-192.png?v=2.18.301', 'icons/icon-safari-black-512.png', 'icons/icon-safari-black-512.png?v=2.18.301', 'icons/icon-safari-black-1024.png', 'icons/icon-safari-black-1024.png?v=2.18.301', 'icons/favicon-safari-black-180.png', 'icons/favicon-safari-black-180.png?v=2.18.301', 'icons/favicon-safari-black-64.png', 'icons/favicon-safari-black-64.png?v=2.18.301', 'icons/favicon-light-180.png', 'icons/favicon-light-180.png?v=2.18.301', 'icons/favicon-dark-180.png', 'icons/favicon-dark-180.png?v=2.18.301', 'icons/favicon-light-64.png', 'icons/favicon-light-64.png?v=2.18.301', 'icons/favicon-dark-64.png', 'icons/favicon-dark-64.png?v=2.18.301', 'apple-touch-icon-safari-black.png', 'apple-touch-icon-safari-black.png?v=2.18.301', 'apple-touch-icon-dark.png', 'apple-touch-icon-dark.png?v=2.18.301', 'icons/apple-touch-icon.png', 'icons/apple-touch-icon.png?v=2.18.301', 'icons/apple-touch-icon-dark.png', 'icons/apple-touch-icon-dark.png?v=2.18.301', 'icons/bell.svg', 'icons/bell-192.png', 'icons/weibo.png', 'icons/guancha.png?v=2.18.301', 'icons/ithome.svg', 'icons/ithome.svg?v=2.18.301', 'icons/bilibili.ico', 'icons/bilibili.ico?v=2.18.301', 'icons/bilibili.svg', 'icons/bilibili.svg?v=2.18.301', 'icons/hupu.ico', 'icons/hupu.ico?v=2.18.301'];
const CORE_APP_SHELL = APP_SHELL.slice(0, 6);
const OPTIONAL_APP_SHELL = APP_SHELL.slice(6);
const OPEN_METEO = /(^|\.)open-meteo\.com$/;
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE)
    .then((cache) => cache.addAll(CORE_APP_SHELL)
      .then(() => Promise.all(OPTIONAL_APP_SHELL.map((asset) => cache.add(asset).catch(() => null)))))
    .then(() => undefined));
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
