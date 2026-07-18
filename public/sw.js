/**
 * Service worker de PrépaPilote — couche hors-ligne, sans dépendance.
 *
 * Stratégies :
 *  - Navigations (pages HTML) : réseau d'abord, puis cache, puis page « /hors-ligne ».
 *    Les visiteurs en ligne ont donc toujours la version fraîche ; les pages déjà
 *    ouvertes restent lisibles sans connexion.
 *  - Ressources statiques (_next/static, images, icônes, polices) : cache d'abord.
 *  - Viviers de quiz JSON (…/pool) : cache d'abord avec rafraîchissement en tâche
 *    de fond, pour rejouer un entraînement hors connexion après une première visite.
 *
 * Rien de sensible n'est mis en cache : requêtes non-GET, autres origines,
 * routes Supabase/auth et l'espace authentifié (/progression, /compte) sont
 * toujours servis par le réseau.
 */

const VERSION = "v1";
const STATIC_CACHE = `pp-static-${VERSION}`;
const PAGES_CACHE = `pp-pages-${VERSION}`;
const OFFLINE_URL = "/hors-ligne";

const PRECACHE = [OFFLINE_URL, "/icon-192.png", "/logo-mark.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
      .catch(() => undefined)
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([STATIC_CACHE, PAGES_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/** Ne jamais mettre en cache l'espace authentifié ni l'auth. */
function isPrivate(url) {
  return (
    url.pathname.startsWith("/progression") ||
    url.pathname.startsWith("/compte") ||
    url.pathname.startsWith("/connexion") ||
    url.pathname.startsWith("/inscription") ||
    url.pathname.includes("/auth")
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/images/") ||
    /\.(?:png|jpg|jpeg|svg|webp|avif|ico|woff2?)$/.test(url.pathname)
  );
}

function isPool(url) {
  return url.pathname.endsWith("/pool");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (isPrivate(url)) return;

  // Navigations : réseau d'abord, repli cache puis page hors-ligne.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || (await caches.match(OFFLINE_URL));
        })
    );
    return;
  }

  // Viviers de quiz : cache d'abord, rafraîchi en arrière-plan.
  if (isPool(url)) {
    event.respondWith(
      caches.open(PAGES_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Ressources statiques : cache d'abord.
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
  }
});
