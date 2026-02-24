/**
 * Professional AdBlocker Detection
 * Uses a multi-layered approach to detect ad blockers with high accuracy.
 * 
 * Layer 1: Network Request Bait (catches uBlock Origin, AdBlock Plus)
 * Layer 2: DOM Element Bait (catches cosmetic filters)
 * 
 * @returns {Promise<boolean>} Resolves to true if ad blocker is detected, false otherwise.
 */
export const detectAdBlocker = async () => {
    // 1. Network Layer Check
    // Attempt to fetch known ad scripts. Blockers will typically block these requests.
    const checkNetwork = async () => {
        const adUrls = [
            'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
            'https://googleads.g.doubleclick.net/pagead/id',
            'https://static.ads-twitter.com/uwt.js'
        ];

        for (const url of adUrls) {
            try {
                const request = new Request(url, {
                    method: 'GET',
                    mode: 'no-cors'
                });

                await fetch(request);
                // If successful (even opaque), it wasn't blocked.
            } catch (error) {
                // Network error = Blocked
                console.log('AdBlock Check: Network request failed', url, error);
                return true;
            }
        }
        // If all requests succeeded, likely no blocker
        return false;
    };

    // 2. DOM Layer Check
    // Create a bait element with classes that are universally blocked by cosmetic filters.
    const checkDOM = () => {
        return new Promise((resolve) => {
            const bait = document.createElement('div');

            // "Honey Pot" classes that strict filters target
            bait.className = 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links ad-banner adsbox doubleclick';

            // Inline styles to ensure it's not hidden by default CSS
            bait.setAttribute('style', 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;');

            document.body.appendChild(bait);

            // Small delay to allow the blocker to modify the DOM
            setTimeout(() => {
                const computed = window.getComputedStyle(bait);

                const isBlocked =
                    bait.offsetParent === null ||
                    bait.offsetHeight === 0 ||
                    bait.offsetWidth === 0 ||
                    computed.display === 'none' ||
                    computed.visibility === 'hidden' ||
                    computed.getPropertyValue('-moz-binding'); // Firefox specific

                document.body.removeChild(bait);
                resolve(!!isBlocked);
            }, 100);
        });
    };

    // Run checks in parallel
    const [networkBlocked, domBlocked] = await Promise.all([
        checkNetwork(),
        checkDOM()
    ]);

    console.log(`AdBlock Detection Result - Network: ${networkBlocked}, DOM: ${domBlocked}`);

    // Logic: If EITHER method detects a block, report as BLOCKED (true).
    return networkBlocked || domBlocked;
};
