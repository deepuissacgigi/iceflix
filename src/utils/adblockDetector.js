/**
 * ═══════════════════════════════════════════════════════════
 *  PROFESSIONAL ADBLOCK DETECTION ENGINE v2.0
 *  5-Vector Bait System for Maximum Catch Rate
 * ═══════════════════════════════════════════════════════════
 *
 * Detection Vectors:
 *  1. NETWORK BAIT    — Fetch requests to universal ad-serving domains
 *  2. DOM BAIT        — Hidden elements with EasyList/uBlock cosmetic filter class names
 *  3. SCRIPT BAIT     — Dynamic <script> insertion with ad-script filenames
 *  4. IFRAME BAIT     — Create an iframe with ad-related src attribute
 *  5. CSS BAIT        — Check if the browser injects cosmetic filter stylesheets
 *
 * Philosophy:
 *  - ANY single vector returning TRUE = adblock detected
 *  - All vectors run in parallel for speed (~200ms total)
 *  - Bait elements are cleaned up immediately after measurement
 *  - SSR-safe: returns false on server
 *
 * @returns {Promise<boolean>} TRUE if an adblocker is detected
 */

// ─── Universal ad-serving domains blocked by EasyList, uBlock, AdGuard ───
const AD_ENDPOINTS = [
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
    'https://googleads.g.doubleclick.net/pagead/id',
    'https://static.ads-twitter.com/uwt.js',
    'https://connect.facebook.net/en_US/fbevents.js',
    'https://www.google-analytics.com/analytics.js',
    'https://cdn.taboola.com/libtrc/loader.js',
    'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
];

// ─── Toxic class/ID names from EasyList & uBlock cosmetic filters ───
const BAIT_CLASSES = [
    'adsbox', 'ad-banner', 'ad-text', 'ad-wrapper', 'ad-slot',
    'text-ad', 'text-ads', 'textAd', 'text_ad', 'text_ads',
    'pub_300x250', 'pub_300x250m', 'pub_728x90',
    'doubleclick', 'ad-badge', 'ad-placeholder', 'ad-unit',
    'google-ad', 'google_ad', 'adsense', 'adsbygoogle',
    'sponsored-content', 'ad-container', 'ad-area',
];

const BAIT_IDS = [
    'ad-banner', 'ad_banner', 'google_ads', 'adbanner',
    'ad-container', 'AdArea', 'ad-box', 'adunit',
];

// ───────────────────────────────────────
//  VECTOR 1: NETWORK BAIT
//  Attempts HEAD requests to known ad domains.
//  If the request is blocked → adblocker present.
// ───────────────────────────────────────
const networkBait = async () => {
    const check = async (url) => {
        try {
            await fetch(new Request(url, { method: 'HEAD', mode: 'no-cors' }));
            return false; // succeeded = not blocked
        } catch {
            return true;  // failed = blocked
        }
    };

    const results = await Promise.all(AD_ENDPOINTS.map(check));
    return results.some(blocked => blocked);
};

// ───────────────────────────────────────
//  VECTOR 2: DOM BAIT
//  Creates a hidden element with ad-related classes.
//  If the element is hidden/removed by the adblocker → detected.
// ───────────────────────────────────────
const domBait = () => {
    return new Promise((resolve) => {
        const el = document.createElement('div');
        el.className = BAIT_CLASSES.join(' ');
        el.id = BAIT_IDS[Math.floor(Math.random() * BAIT_IDS.length)];

        // Give it real dimensions — adblockers hide or collapse these
        el.style.cssText = `
            width: 1px !important;
            height: 1px !important;
            position: absolute !important;
            left: -12000px !important;
            top: -12000px !important;
            pointer-events: none !important;
        `;

        // Add an inner element too — some blockers only hide children
        const inner = document.createElement('ins');
        inner.className = 'adsbygoogle';
        inner.style.cssText = 'display: block; width: 1px; height: 1px;';
        el.appendChild(inner);

        document.body.appendChild(el);

        // Wait for cosmetic filters to kick in
        setTimeout(() => {
            const cs = window.getComputedStyle(el);
            const innerCs = window.getComputedStyle(inner);

            const blocked =
                el.offsetParent === null ||
                el.offsetHeight === 0 ||
                el.offsetWidth === 0 ||
                cs.display === 'none' ||
                cs.visibility === 'hidden' ||
                cs.opacity === '0' ||
                inner.offsetHeight === 0 ||
                innerCs.display === 'none';

            try { document.body.removeChild(el); } catch { /* already removed */ }
            resolve(!!blocked);
        }, 120);
    });
};

// ───────────────────────────────────────
//  VECTOR 3: SCRIPT BAIT
//  Dynamically creates a <script> tag with
//  ad-related filename. If onerror fires → blocked.
// ───────────────────────────────────────
const scriptBait = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        // This URL pattern is universally blocked by all filter lists
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.async = true;
        script.type = 'text/javascript';

        let settled = false;
        const settle = (result) => {
            if (settled) return;
            settled = true;
            try { document.head.removeChild(script); } catch { /* cleanup */ }
            resolve(result);
        };

        script.onerror = () => settle(true);   // Blocked
        script.onload = () => settle(false);    // Not blocked

        // Timeout fallback — if neither fires, assume not blocked
        setTimeout(() => settle(false), 2000);

        document.head.appendChild(script);
    });
};

// ───────────────────────────────────────
//  VECTOR 4: IFRAME BAIT
//  Creates a tiny iframe with an ad-like src.
//  If it's blocked or has 0 dimensions → detected.
// ───────────────────────────────────────
const iframeBait = () => {
    return new Promise((resolve) => {
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `
            width: 1px !important;
            height: 1px !important;
            position: absolute !important;
            left: -12000px !important;
            top: -12000px !important;
            opacity: 0 !important;
            pointer-events: none !important;
        `;
        iframe.src = 'about:blank';
        iframe.className = 'adsbox ad-frame';
        iframe.id = 'ad-iframe-test';
        iframe.setAttribute('data-ad-slot', '1234567890');
        iframe.setAttribute('aria-hidden', 'true');

        document.body.appendChild(iframe);

        setTimeout(() => {
            const cs = window.getComputedStyle(iframe);
            const blocked =
                iframe.offsetHeight === 0 ||
                iframe.offsetWidth === 0 ||
                cs.display === 'none' ||
                cs.visibility === 'hidden' ||
                !document.body.contains(iframe); // removed by blocker

            try { document.body.removeChild(iframe); } catch { /* already removed */ }
            resolve(!!blocked);
        }, 120);
    });
};

// ───────────────────────────────────────
//  VECTOR 5: CSS / VARIABLE BAIT
//  Some adblockers inject stylesheets that set
//  CSS variables or override rules on ad classes.
//  We check if our bait element's computed style
//  has been mutated beyond our original rules.
// ───────────────────────────────────────
const cssBait = () => {
    return new Promise((resolve) => {
        const el = document.createElement('div');
        el.className = 'ad-banner ad_container google-ad';
        el.style.cssText = `
            position: absolute !important;
            left: -12000px !important;
            top: -12000px !important;
            width: 300px !important;
            height: 250px !important;
            background: rgb(255, 0, 0) !important;
            overflow: hidden !important;
            pointer-events: none !important;
        `;

        document.body.appendChild(el);

        setTimeout(() => {
            const cs = window.getComputedStyle(el);
            const w = parseInt(cs.width, 10);
            const h = parseInt(cs.height, 10);

            // If an adblocker injected cosmetic rules, dimensions or display will change
            const blocked =
                w !== 300 ||
                h !== 250 ||
                cs.display === 'none' ||
                cs.visibility === 'hidden' ||
                cs.opacity === '0' ||
                el.offsetHeight === 0;

            try { document.body.removeChild(el); } catch { /* cleanup */ }
            resolve(!!blocked);
        }, 120);
    });
};

// ═══════════════════════════════════════
//  MAIN EXPORT — Run All Vectors
// ═══════════════════════════════════════

export const detectAdBlock = async () => {
    if (typeof window === 'undefined') return false;

    try {
        const [net, dom, script, iframe, css] = await Promise.all([
            networkBait(),
            domBait(),
            scriptBait(),
            iframeBait(),
            cssBait(),
        ]);

        const detected = net || dom || script || iframe || css;

        console.log(
            `%c[AdBlock Engine]%c Network: ${net} | DOM: ${dom} | Script: ${script} | iFrame: ${iframe} | CSS: ${css} → ${detected ? '🛡️ ADBLOCKER DETECTED' : '⚠️ NO ADBLOCKER FOUND'}`,
            'color: #8f00ff; font-weight: bold;',
            detected ? 'color: #34d399;' : 'color: #f59e0b;'
        );

        return detected;
    } catch (err) {
        console.warn('[AdBlock Engine] Detection failed, defaulting to false', err);
        return false;
    }
};
