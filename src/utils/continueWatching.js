/**
 * Continue Watching — LocalStorage Module
 * Simple, reliable key-value store for guest users.
 */

const STORAGE_KEY = 'ott_continue_watching';
const MAX_ITEMS = 20;

// Custom event name so the same tab can listen for changes
export const CW_UPDATE_EVENT = 'cw_updated';

/** Dispatch a custom event so hooks in the same tab can react */
const notifyUpdate = () => {
    window.dispatchEvent(new Event(CW_UPDATE_EVENT));
};

/** Read all items, sorted newest-first */
export const getContinueWatching = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const items = JSON.parse(raw);
        if (!Array.isArray(items)) return [];
        return items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    } catch {
        return [];
    }
};

/** Save or update a single item */
export const saveContinueWatching = (item) => {
    if (!item?.id) return;

    const list = getContinueWatching();
    const idx = list.findIndex(i => i.id === item.id && i.mediaType === item.mediaType);

    const entry = { ...item, updatedAt: Date.now() };

    if (idx >= 0) {
        list[idx] = { ...list[idx], ...entry };
    } else {
        list.unshift(entry);
    }

    // Cap at MAX_ITEMS
    const trimmed = list.slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    notifyUpdate();
};

/** Remove a single item */
export const removeContinueWatching = (id, mediaType) => {
    const list = getContinueWatching();
    const filtered = list.filter(i => !(i.id === id && i.mediaType === mediaType));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    notifyUpdate();
};

/** Clear everything */
export const clearContinueWatching = () => {
    localStorage.removeItem(STORAGE_KEY);
    notifyUpdate();
};
