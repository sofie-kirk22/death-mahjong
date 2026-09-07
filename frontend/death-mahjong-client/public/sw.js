const CACHE_NAME = "death-mahjong-static-v1";
const STATIC_ASSET_PATTERN = /\/(icons|images|sounds)\//;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

// Only cache static, versioned-by-content assets (icons/images/sounds).
// Game state and API calls always hit the network so players never see stale data.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET" || !STATIC_ASSET_PATTERN.test(new URL(request.url).pathname)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }

      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
  );
});
