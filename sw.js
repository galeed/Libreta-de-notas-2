/* ==========================================================================
   SERVICE WORKER - LIBRETA DE NOTAS (Estrategia Cache-First)
   ========================================================================== */

const CACHE_NAME = 'libreta-de-notas-v1';

// Archivos estáticos de la app que se guardan en la caché del navegador
const ARCHIVOS_A_GUARDAR = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// 1. Instalación: Guarda los recursos clave en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Libreta de notas: Archivos guardados en caché correctamente.');
      return cache.addAll(ARCHIVOS_A_GUARDAR);
    })
  );
  self.skipWaiting();
});

// 2. Activación: Elimina cachés antiguas si cambias el número de versión (ej. 'v2')
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Libreta de notas: Eliminando caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Intercepción Fetch (Cache-First): Sirve archivos desde caché si no hay internet
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Devuelve la copia en caché al instante si existe
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está guardado, lo busca en la red y guarda una copia
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
