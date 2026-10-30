// Offline básico: a casca do app vem do cache e se atualiza por trás; dados futuros da API passam direto.
const CACHE = 'brnz-app-v1';
const SHELL = /*__PRECACHE__*/ ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('brnz-app-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin || url.pathname.includes('/api/')) return;

  if (request.mode === 'navigate') {
    e.respondWith(fetch(request).then(async (response) => { if (response.ok) { const cache = await caches.open(CACHE); await cache.put('./index.html', response.clone()); } return response; }).catch(() => caches.match('./index.html')));
    return;
  }

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const hit = await cache.match(request);
      const fresh = fetch(request).then((res) => {
        if (res.ok) cache.put(request, res.clone());
        return res;
      }).catch(() => hit);
      if (hit) { e.waitUntil(fresh.then(() => {})); return hit; }
      return (await fresh) || new Response('Recurso indisponível offline', { status: 503 });
    }),
  );
});
