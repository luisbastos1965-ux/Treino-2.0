const CACHE_NAME = 'gym-tracker-v5'; // Avançamos para a v5 para forçar a limpeza
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
    './assets/img/icon.png',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', event => {
    self.skipWaiting(); // Força o Service Worker novo a assumir o controlo instantaneamente
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // Apaga as caches antigas (v1, v2, v3, v4)
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
});

