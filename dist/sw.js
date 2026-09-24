const CACHE = 'onebox-v344';
const APP_SHELL = [
  './',
  'index.html',
  'style.css?v=2.18.325',
  'app.js?v=2.18.325',
  'calendar-data.js?v=2.18.325',
  'manifest.webmanifest',
  'manifest.webmanifest?v=2.18.325',
  'favicon-v317.ico?v=2.18.325',
  'apple-touch-icon.png',
  'apple-touch-icon-precomposed.png',
  'apple-touch-icon.png?v=2.18.325',
  'icons/onebox-brand-v317-16.png?v=2.18.325',
  'icons/onebox-brand-v317-32.png?v=2.18.325',
  'icons/onebox-brand-v317-48.png?v=2.18.325',
  'icons/onebox-brand-v317-64.png?v=2.18.325',
  'icons/onebox-brand-v317-128.png?v=2.18.325',
  'icons/onebox-brand-v317-120.png?v=2.18.325',
  'icons/onebox-brand-v317-152.png?v=2.18.325',
  'icons/onebox-brand-v317-167.png?v=2.18.325',
  'icons/onebox-brand-v317-180.png?v=2.18.325',
  'icons/onebox-brand-v317-192.png?v=2.18.325',
  'icons/onebox-brand-v317-256.png?v=2.18.325',
  'icons/onebox-brand-v317-512.png?v=2.18.325',
  'icons/onebox-brand-v317-1024.png?v=2.18.325',
  'icons/mascot-fox-full-reactions.png',
  'icons/mascot-fox-full-reactions.png?v=2.18.311',
  'icons/mascot-fox-full.png',
  'icons/mascot-fox-full.png?v=2.18.311',
  'icons/bell.svg',
  'icons/bell-192.png',
  'icons/weibo.png',
  'icons/guancha.png?v=2.18.311',
  'icons/ithome.svg',
  'icons/ithome.svg?v=2.18.311',
  'icons/bilibili.ico',
  'icons/bilibili.ico?v=2.18.311',
  'icons/bilibili.svg',
  'icons/bilibili.svg?v=2.18.311',
  'icons/hupu.ico',
  'icons/hupu.ico?v=2.18.311',
];
const CORE_APP_SHELL = APP_SHELL.slice(0, 7);
const OPTIONAL_APP_SHELL = APP_SHELL.slice(7);
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
