/**
 * Simple in-memory cache for TMDB API responses.
 * Entries expire after `ttl` ms (default: 5 minutes).
 * This prevents redundant API calls when users navigate back and forth.
 */

const cache = new Map();
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get a cached value by key.
 * @param {string} key
 * @returns {*|null} Cached data or null if expired/missing
 */
export const getCached = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > entry.ttl) {
        cache.delete(key);
        return null;
    }
    return entry.data;
};

/**
 * Set a cache entry.
 * @param {string} key
 * @param {*} data
 * @param {number} ttl - Time to live in ms
 */
export const setCache = (key, data, ttl = DEFAULT_TTL) => {
    cache.set(key, { data, timestamp: Date.now(), ttl });
};

/**
 * Wrapper: fetch from cache first, else call `fetcher()`, then cache the result.
 * @param {string} key - Unique cache key
 * @param {Function} fetcher - Async function that returns data
 * @param {number} ttl - Time to live in ms
 * @returns {Promise<*>}
 */
export const cachedFetch = async (key, fetcher, ttl = DEFAULT_TTL) => {
    const cached = getCached(key);
    if (cached !== null) return cached;

    const data = await fetcher();
    setCache(key, data, ttl);
    return data;
};
