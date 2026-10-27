/* ============================================================
   Del TIC al TAC — modo sin conexión (service worker)
   Guarda una copia del OVA en el navegador después de la primera
   visita. Con conexión siempre se pide la versión más reciente;
   sin conexión se usa la copia guardada.
   Las peticiones ignoran la copia temporal del navegador (que
   GitHub Pages deja vigente hasta 10 minutos), para que cada
   actualización del sitio se vea apenas se publica.
   ============================================================ */
const CACHE_NAME = "ova-tic-tac-v5";
const PRECACHE_URLS = ["./", "index.html", "css/styles.css", "js/app.js"];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Archivos propios: primero la red (para recibir actualizaciones), luego la copia guardada.
  // "no-cache" le pregunta al servidor si hay versión nueva; si no la hay, la respuesta es mínima.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request, { cache: "no-cache" })
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request, { ignoreSearch: true }).then((cached) =>
            cached || (request.mode === "navigate" ? caches.match("index.html") : Response.error())
          )
        )
    );
    return;
  }

  // Tipografías: primero la copia guardada; si no existe, se descarga y se guarda.
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
      )
    );
  }
});
