const CACHE = 'wedding-v2';
const STATIC = [
  './', './index.html', './styles.css', './script.js', './manifest.webmanifest',
  './images/cover.jpg', './images/couple-main.jpg', './images/gallery-01.jpg',
  './images/gallery-02.jpg', './images/gallery-03.jpg', './images/gallery-04.jpg'
];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC))));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))));
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname.endsWith('/config.js')) return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  })));
});
