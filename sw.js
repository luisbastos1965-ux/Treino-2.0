const CACHE_NAME = 'gym-tracker-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

// Intercetar pedidos para funcionar Offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});
