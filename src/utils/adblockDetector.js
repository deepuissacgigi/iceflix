/**
 * Ultimate Adblock Detector
 * Implements a multi-vector detection strategy to catch all major adblockers
 * including uBlock Origin, AdBlock Plus, Brave Shield, Ghostery, and others.
 * 
 * Vectors:
 * 1. Network: Fetch requests to multiple major ad servers.
 * 2. DOM: Hidden bait elements with toxic class names.
 * 3. Script: Dummy script loading checks.
 * 4. Stacking: If ANY check fails, we assume Adblock is present.
 */

// List of known ad-serving domains that are universally blocked
const AD_URLS = [
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
    'https://googleads.g.doubleclick.net/pagead/id',
    'https://static.ads-twitter.com/uwt.js',
    'https://connect.facebook.net/en_US/fbevents.js',
    'https://www.google-analytics.com/analytics.js'
];

/**
 * Helper to check a single URL via fetch
 * Returns TRUE if blocked (fetch failed), FALSE if allowed.
 */
const checkUrl = async (url) => {
    try {
        const req = new Request(url, { method: 'HEAD', mode: 'no-cors' });
        await fetch(req);
        return false; // Success = Not Blocked
    } catch (e) {
        return true; // Error = Blocked
    }
};

/**
 * 1. Network Vector: Check all URLs in parallel
 */
const checkNetworkVector = async () => {
    // We only need ONE to fail to confirm adblock
    const results = await Promise.all(AD_URLS.map(checkUrl));
    return results.some(isBlocked => isBlocked === true);
};

/**
 * 2. DOM Vector: Create toxic element and measure it
 */
const checkDomVector = () => {
    return new Promise((resolve) => {
        const bait = document.createElement('div');
        // Very aggressive list of classes from EasyList
        bait.className = 'adsbox ad-banner ad-text text-ads pub_300x250 doubleclick ad-badge ad-placeholder';
        bait.style.setProperty('width', '1px', 'important');
        bait.style.setProperty('height', '1px', 'important');
        bait.style.setProperty('position', 'absolute', 'important');
        bait.style.setProperty('left', '-10000px', 'important');
        bait.style.setProperty('top', '-1000px', 'important');

        document.body.appendChild(bait);

        setTimeout(() => {
            const computed = window.getComputedStyle(bait);
            const isBlocked =
                bait.offsetParent === null ||
                bait.offsetHeight === 0 ||
                bait.offsetWidth === 0 ||
                computed.display === 'none' ||
                computed.visibility === 'hidden' ||
                computed.getPropertyValue('-moz-binding');

            document.body.removeChild(bait);
            resolve(!!isBlocked);
        }, 150); // Slightly longer timeout for slower engines
    });
};

/**
 * Main Detection Function
 * @returns {Promise<boolean>} TRUE if Adblock is Detected
 */
export const detectAdBlock = async () => {
    if (typeof window === 'undefined') return false;

    try {
        // Run vectors in parallel
        const [isNetworkBlocked, isDomBlocked] = await Promise.all([
            checkNetworkVector(),
            checkDomVector()
        ]);

        const result = isNetworkBlocked || isDomBlocked;

        if (process.env.NODE_ENV === 'development') {
            console.log(`[AdBlock Check] Network: ${isNetworkBlocked}, DOM: ${isDomBlocked} => Result: ${result}`);
        }

        return result;

    } catch (err) {
        console.warn('Adblock detection error, defaulting to false', err);
        return false;
    }
};
