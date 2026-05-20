// PWA service-worker stub. Phase 1 ships the manifest + install hook; Phase 2
// adds offline caching once CNA visit-log UI is in place.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {
  // No-op for now. Network is source of truth until offline strategy lands.
});
