/**
 * My List Storage Utility
 * A robust wrapper around localStorage to manage the user's personal list.
 * 
 * Data Structure:
 * Array<{
 *    id: number,
 *    media_type: 'movie' | 'tv',
 *    title: string,   // or name
 *    poster_path: string,
 *    backdrop_path: string,
 *    vote_average: number,
 *    addedAt: number
 * }>
 */

const STORAGE_KEY = 'ott_my_list_v2'; // Versioned key to avoid conflicts with bad data
const MAX_ITEMS = 100;

export const MyListEvents = {
    UPDATE: 'mylist:update'
};

const dispatchUpdate = () => {
    window.dispatchEvent(new Event(MyListEvents.UPDATE));
};

/**
 * Get the full list from storage
 */
export const getMyList = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const data = JSON.parse(raw);
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error('MyList Read Error:', e);
        return [];
    }
};

/**
 * Normalize Item Data
 */
export const normalizeItem = (item) => {
    return {
        id: item.id,
        media_type: item.media_type || 'movie',
        title: item.title || item.name || '',
        poster_path: item.poster_path || '',
        backdrop_path: item.backdrop_path || '',
        vote_average: item.vote_average || 0,
        overview: item.overview || '',
        addedAt: Date.now()
    };
};

/**
 * Add an item to the list
 */
export const addItem = (item) => {
    try {
        if (!item?.id) return;

        const list = getMyList();

        // Check for duplicate (id alone isn't enough if movie/tv IDs clash, but TMDB IDs do clash between types)
        // Ideally check both ID and Type, but safe to check both.
        if (list.some(i => i.id === item.id && i.media_type === item.media_type)) {
            return; // Already exists
        }

        // Normalize Item Data
        const normalized = normalizeItem(item);

        const updatedList = [normalized, ...list].slice(0, MAX_ITEMS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
        dispatchUpdate();
    } catch (e) {
        console.error('MyList Add Error:', e);
    }
};

/**
 * Remove an item from the list
 */
export const removeItem = (id, mediaType) => {
    try {
        const list = getMyList();
        // If mediaType is provided, be strict. If not, loose (but risky).
        // UI should always provide mediaType.
        const updatedList = list.filter(i => {
            if (mediaType && i.media_type !== mediaType) return true; // Keep others
            return i.id !== id;
        });

        if (list.length !== updatedList.length) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
            dispatchUpdate();
        }
    } catch (e) {
        console.error('MyList Remove Error:', e);
    }
};

/**
 * Check existence
 */
export const isInList = (id, mediaType) => {
    try {
        const list = getMyList();
        return list.some(i => i.id === id && (!mediaType || i.media_type === mediaType));
    } catch (e) {
        return false;
    }
};

/**
 * Clear all (Debug/admin)
 */
export const clearList = () => {
    localStorage.removeItem(STORAGE_KEY);
    dispatchUpdate();
};
