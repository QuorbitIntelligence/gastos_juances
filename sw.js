/* Gastos Juances v2.1.3 · service worker: instalación, sin conexión, notificaciones y actualizaciones */
const CACHE = 'gastos-juances-2.1.3';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'favicon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => null))))); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) { d = { notification: { title: 'Gastos Juances', body: e.data ? e.data.text() : '' } }; }
  const nn = d.notification || {}, dd = d.data || {};
  const title = nn.title || dd.title || 'Gastos Juances', body = nn.body || dd.body || '';
  const count = parseInt(dd.count || '0', 10);
  e.waitUntil(Promise.all([
    self.registration.showNotification(title, { body, icon: 'icon-192.png', badge: 'favicon-32.png', tag: 'gj-alerta', renotify: true, data: { url: dd.url || './' } }),
    (self.navigator && self.navigator.setAppBadge && count) ? self.navigator.setAppBadge(count).catch(() => {}) : Promise.resolve()
  ]));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) { if ('focus' in w) return w.focus(); }
    return clients.openWindow('./');
  }));
});
