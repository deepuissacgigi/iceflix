import React, { useState, useEffect, useRef } from 'react';
import ENDPOINTS from '../../services/endpoints';

/**
 * ProgressiveHeroImage — Blur-up loading for cinematic hero backdrops.
 *
 * Strategy:
 *  1. Instantly render a tiny W300 placeholder (blurred via CSS)
 *  2. In background, preload the full-res image:
 *       • Desktop (≥768px): TMDB `original` quality (~4K)
 *       • Mobile (<768px):  TMDB `w1280` (saves bandwidth)
 *  3. Once loaded, crossfade from blur → sharp with a smooth transition
 */
const ProgressiveHeroImage = ({ path, alt = '', className = '', style = {} }) => {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef(null);

    // Low-res placeholder — loads almost instantly (~5-15KB)
    const lowRes = `${ENDPOINTS.IMAGE_BASE_URL_W300}${path}`;

    // High-res — adaptive based on screen width
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const highRes = isMobile
        ? `${ENDPOINTS.IMAGE_BASE_URL}${path}`           // w1280 on mobile
        : `${ENDPOINTS.IMAGE_BASE_URL_ORIGINAL}${path}`;  // 4K on desktop+

    useEffect(() => {
        if (!path) return;
        setLoaded(false);

        const img = new Image();
        img.src = highRes;
        img.onload = () => setLoaded(true);

        return () => { img.onload = null; };
    }, [path, highRes]);

    return (
        <>
            {/* Low-res blurred placeholder — always visible initially */}
            <img
                src={lowRes}
                alt={alt}
                className={className}
                style={{
                    ...style,
                    filter: loaded ? 'none' : 'blur(20px) brightness(0.8)',
                    transform: loaded ? 'scale(1)' : 'scale(1.1)',
                    transition: 'filter 0.8s ease-out, transform 0.8s ease-out, opacity 0.8s ease-out',
                    opacity: loaded ? 0 : 1,
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
                loading="eager"
            />
            {/* High-res final image — fades in when ready */}
            <img
                ref={imgRef}
                src={loaded ? highRes : undefined}
                alt={alt}
                className={className}
                style={{
                    ...style,
                    opacity: loaded ? 1 : 0,
                    transition: 'opacity 0.8s ease-out',
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
                loading="eager"
            />
        </>
    );
};

export default ProgressiveHeroImage;
