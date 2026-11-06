const VERSION = "v1";
const SHELL_CACHE = "gobinda-shell-" + VERSION;
const ASSET_CACHE = "gobinda-assets-" + VERSION;
const ROOT_KEY = new Request(new URL("/", self.location.origin).href);

self.addEventListener("install", (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((key) => key.startsWith("gobinda-") && key !== SHELL_CACHE && key !== ASSET_CACHE)
    .map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
function isCacheable(response) {
  const policy = (response.headers.get("cache-control") || "").toLowerCase();
  return response.status === 200 && response.type === "basic" && !policy.includes("no-store") && !policy.includes("private");
}
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate" && url.pathname === "/" && !url.searchParams.has("install")) {
    event.respondWith((async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(ROOT_KEY);
      const update = fetch(request).then(async (response) => {
        if (isCacheable(response) && (response.headers.get("content-type") || "").includes("text/html")) await cache.put(ROOT_KEY, response.clone());
        return response;
      });
      if (cached) { event.waitUntil(update.catch(() => {})); return cached; }
      try { return await update; } catch {
        return new Response("<!doctype html><html><meta name=viewport content='width=device-width,initial-scale=1'><title>Gobinda Jewellery</title><body><p>You are offline. Reconnect and reopen the store.</p></body></html>", {headers:{"content-type":"text/html; charset=utf-8"}});
      }
    })());
    return;
  }
  if (!["script", "style", "image", "font"].includes(request.destination) || url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;
  event.respondWith((async () => {
    const cache = await caches.open(ASSET_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (isCacheable(response)) event.waitUntil(cache.put(request, response.clone()));
    return response;
  })());
});
