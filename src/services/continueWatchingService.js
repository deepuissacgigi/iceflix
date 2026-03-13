import {
    getContinueWatching,
    saveContinueWatching,
    removeContinueWatching
} from '../utils/continueWatching';

const FINISHED_THRESHOLD = 0.90; // 90% watched = finished

/**
 * Service to manage continue watching logic.
 */
export const ContinueWatchingService = {
    /**
     * Get the full list for UI display.
     */
    getList: () => {
        return getContinueWatching();
    },

    /**
     * Get the resume time (in seconds) for a specific item.
     * @param {number} id 
     * @param {string} mediaType 
     * @returns {number} Saved progress or 0
     */
    getResumeTime: (id, mediaType, season = null, episode = null) => {
        const items = getContinueWatching();
        const item = items.find(i => i.id === id && i.mediaType === mediaType);
        if (!item) return 0;

        // For TV shows, enforce exact season/episode match
        if (mediaType === 'tv') {
            if (item.season !== season || item.episode !== episode) {
                return 0; // It's a different episode, start from 0
            }
        }
        return item.progress;
    },

    /**
     * Save progress. Handles logic for marking as finished.
     * @param {Object} item 
     * @param {number} currentProgress (seconds)
     * @param {number} totalDuration (seconds)
     */
    saveProgress: (item, currentProgress, totalDuration) => {
        if (!item || !item.id) return;

        // Check if finished (movies only, preserve TV shows for active binging)
        if (totalDuration > 0 && item.mediaType === 'movie') {
            const percentage = currentProgress / totalDuration;
            if (percentage >= FINISHED_THRESHOLD) {
                removeContinueWatching(item.id, item.mediaType);
                return;
            }
        }

        // Save progress
        saveContinueWatching({
            ...item,
            progress: currentProgress,
            duration: totalDuration > 0 ? totalDuration : (item.duration || 0),
            updatedAt: Date.now()
        });
    },

    /**
     * Manuall remove an item.
     */
    removeItem: (id, mediaType) => {
        removeContinueWatching(id, mediaType);
    }
};
