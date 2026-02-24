/**
 * Adblock Storage Utilities
 * Handles localStorage operations for adblock status and warning history.
 * Safe for SSR and resilient to storage errors.
 */

const KEYS = {
    ADBLOCK_ENABLED: 'adblock_enabled',
    WARNING_SEEN: 'ads_warning_seen'
};

/**
 * Checks if running in a browser environment
 */
const isBrowser = () => typeof window !== 'undefined' && window.localStorage;

/**
 * Persist adblock detection result
 * @param {boolean} isEnabled 
 */
export const setAdblockDetected = (isEnabled) => {
    if (!isBrowser()) return;
    try {
        localStorage.setItem(KEYS.ADBLOCK_ENABLED, JSON.stringify(isEnabled));
    } catch (e) {
        console.warn('Adblock Storage Error:', e);
    }
};

/**
 * Get persisted adblock status
 * @returns {boolean|null} null if not yet checked
 */
export const getAdblockDetected = () => {
    if (!isBrowser()) return null;
    try {
        const item = localStorage.getItem(KEYS.ADBLOCK_ENABLED);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        return null;
    }
};

/**
 * Mark the ads warning as seen by the user
 */
export const setAdsWarningSeen = () => {
    if (!isBrowser()) return;
    try {
        localStorage.setItem(KEYS.WARNING_SEEN, 'true');
    } catch (e) {
        console.warn('Adblock Storage Error:', e);
    }
};

/**
 * Check if user has already seen and acknowledged the warning
 * @returns {boolean}
 */
export const getAdsWarningSeen = () => {
    if (!isBrowser()) return false;
    try {
        return localStorage.getItem(KEYS.WARNING_SEEN) === 'true';
    } catch (e) {
        return false;
    }
};
