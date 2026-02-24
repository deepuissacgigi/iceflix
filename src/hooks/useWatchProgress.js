import { useEffect, useRef, useCallback } from 'react';

/**
 * Tracks how long the player has been open and persists progress.
 * Now routes all saving through the provided `saveProgress` function
 * to guarantee UI consistency and unified DB/localStorage handling.
 */
export const useWatchProgress = (isOpen, mediaInfo, saveProgress) => {
    const progressRef = useRef(0);
    const trackingRef = useRef(null);
    const saveRef = useRef(null);
    const mediaRef = useRef(mediaInfo);

    // Keep mediaInfo ref fresh without triggering effects
    useEffect(() => {
        mediaRef.current = mediaInfo;
    }, [mediaInfo]);

    // ── Persist helper ──
    const persist = useCallback(() => {
        const info = mediaRef.current;
        if (!info?.id || progressRef.current <= 0 || !saveProgress) {
            return;
        }

        const entry = {
            id: info.id,
            title: info.title || '',
            poster: info.poster || '',
            backdrop: info.backdrop || '',
            mediaType: info.mediaType || 'movie',
            season: info.season,
            episode: info.episode,
        };

        // Pass directly to the saveProgress callback from useContinueWatching
        saveProgress(entry, progressRef.current, info.duration || 0);
    }, [saveProgress]);

    // ── Start / Stop tracking ─────────────────────────────
    useEffect(() => {
        if (!isOpen || !mediaInfo?.id) {
            // Player closed — final save and cleanup
            if (progressRef.current > 0) persist();
            clearInterval(trackingRef.current);
            clearInterval(saveRef.current);
            return;
        }

        // Player opened — reset
        progressRef.current = 0;

        // Tick every second
        trackingRef.current = setInterval(() => {
            progressRef.current += 1;
        }, 1000);

        // Persist every 5 seconds (fast enough for reliability)
        saveRef.current = setInterval(() => {
            persist();
        }, 5000);

        // Immediate save after 2 seconds so it shows up quickly
        const quickSave = setTimeout(() => persist(), 2000);

        return () => {
            clearTimeout(quickSave);
            clearInterval(trackingRef.current);
            clearInterval(saveRef.current);
            // Final persist on cleanup
            if (progressRef.current > 0) persist();
        };
    }, [isOpen, mediaInfo?.id, persist]);
};
