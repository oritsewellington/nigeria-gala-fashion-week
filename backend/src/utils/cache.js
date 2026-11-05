// Tiny in-memory cache with a TTL. Many requests at once share ONE database query.
const store = new Map();

/** cached('key', 10000, () => loadFromDb()) -> value (cached for 10 seconds). Failures are never cached. */
function cached(key, ttlMs, loader) {
  const hit = store.get(key);
  const now = Date.now();
  if (hit && hit.expires > now) return hit.promise;
  const promise = Promise.resolve()
    .then(loader)
    .catch((err) => {
      if (store.get(key)?.promise === promise) store.delete(key);
      throw err;
    });
  store.set(key, { promise, expires: now + ttlMs });
  return promise;
}

/** bust('contestants:') removes every cached key starting with that text. bust() clears everything. */
function bust(prefix = "") {
  for (const key of store.keys()) if (key.startsWith(prefix)) store.delete(key);
}

module.exports = { cached, bust };
