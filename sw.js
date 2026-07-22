const CACHE_NAME = 'gym-tracker-v3';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/base.css',
    './css/layout.css',
    './css/views.css',
    './js/db.js',
    './js/logic.js',
    './js/ui.js',
    './js/beastMode.js',
    './js/main.js',
    './manifest.json',
    './assets/img/icon.jpg'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

// Limpar caches antigas (Garante que a nova estrutura de pastas é assumida)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Intercetar pedidos para funcionar Offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});
