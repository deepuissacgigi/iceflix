/**
 * Advanced Multi-Layer Cache (L1: Memory, L2: LocalStorage)
 * Implements Stale-While-Revalidate (SWR) pattern for instant perceived loading.
 */

const memoryCache = new Map();
const DEFAULT_TTL = 1000 * 60 * 60 * 6; // 6 hours
const CACHE_PREFIX = 'iceflix_cache_';

// Track in-flight requests to prevent duplicate network calls
const activeFetches = new Map();

/**
 * Retrieves the raw cache entry from L1 or L2 without TTL validation.
 * Used for Stale-While-Revalidate logic.
 */
const getCacheEntry = (key) => {
    // 1. Check L1 Memory (Instant)
    let entry = memoryCache.get(key);

    // 2. Check L2 LocalStorage (Fast Disk)
    if (!entry) {
        try {
            const raw = localStorage.getItem(CACHE_PREFIX + key);
            if (raw) {
                entry = JSON.parse(raw);
                memoryCache.set(key, entry); // Hydrate L1
            }
        } catch (e) {
            // Ignore parse errors or privacy-mode restrictions
        }
    }
    return entry || null;
};

/**
 * Persists data to both L1 and L2 caches.
 */
export const setCache = (key, data, ttl = DEFAULT_TTL) => {
    const entry = { data, timestamp: Date.now(), ttl };
    memoryCache.set(key, entry);

    // Limit localStorage payload size to avoid QuotaExceededError
    try {
        const payload = JSON.stringify(entry);
        if (payload.length < 1000000) { // Max ~1MB per entry
            localStorage.setItem(CACHE_PREFIX + key, payload);
        }
    } catch (e) {
        // Silently handle quota limits by relying on L1 map
    }
};

/**
 * Legacy getter wrapper for immediate UI checks that require strict TTL.
 * @returns {*|null} Cached data or null if expired/missing
 */
export const getCached = (key) => {
    const entry = getCacheEntry(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) return null; // Expired
    return entry.data;
};

/**
 * Enterprise Stale-While-Revalidate (SWR) Fetcher.
 * 1. Returns fresh cache instantly.
 * 2. Returns stale cache instantly while fetching fresh data silently in background.
 * 3. Blocks only if no cache exists.
 * 4. Deduplicates simultaneous requests.
 * 
 * @param {string} key - Unique cache identifier
 * @param {Function} fetcher - Async function yielding network data
 * @param {number} ttl - Time to live in ms
 * @returns {Promise<*>}
 */
export const cachedFetch = async (key, fetcher, ttl = DEFAULT_TTL) => {
    const entry = getCacheEntry(key);
    const isStale = !entry || (Date.now() - entry.timestamp > entry.ttl);

    // 1. Perfectly fresh: Return immediately, no network call.
    if (!isStale) {
        return entry.data;
    }

    // 2. Deduplicate in-flight requests
    if (activeFetches.has(key)) {
        if (entry) return entry.data; // Return stale immediately to avoid blocking
        return await activeFetches.get(key); // Wait if absolutely nothing is cached
    }

    // 3. Initiate background fetch
    const fetchPromise = (async () => {
        try {
            const data = await fetcher();
            setCache(key, data, ttl);
            return data;
        } catch (error) {
            console.error(`SWR Fetch Error [${key}]:`, error);
            if (entry) return entry.data; // Network failed, fallback entirely to stale cache
            throw error;
        } finally {
            activeFetches.delete(key);
        }
    })();

    activeFetches.set(key, fetchPromise);

    // 4. Stale-While-Revalidate magic: Return immediately to UI!
    if (entry) {
        return entry.data;
    }

    // 5. First-time load: Block and wait for network
    return await fetchPromise;
};
