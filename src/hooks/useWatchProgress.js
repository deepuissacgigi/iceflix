import { useEffect, useRef, useCallback } from 'react';
import { saveContinueWatching } from '../utils/continueWatching';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

/**
 * Tracks how long the player has been open and persists progress.
 * Writes DIRECTLY to localStorage / Supabase — no circular hook deps.
 */
export const useWatchProgress = (isOpen, mediaInfo) => {
    const progressRef = useRef(0);
    const trackingRef = useRef(null);
    const saveRef = useRef(null);
    const mediaRef = useRef(mediaInfo);
    const { user } = useAuth();

    // Keep mediaInfo ref fresh without triggering effects
    useEffect(() => {
        mediaRef.current = mediaInfo;
    }, [mediaInfo]);

    // ── Persist helper (no hook state — writes directly) ──
    const persist = useCallback(() => {
        const info = mediaRef.current;
        if (!info?.id || progressRef.current <= 0) {
            console.log('[WP] persist skipped — no id or progress=0');
            return;
        }
        console.log('[WP] PERSISTING:', { id: info.id, progress: progressRef.current, user: !!user });

        const entry = {
            id: info.id,
            title: info.title || '',
            poster: info.poster || '',
            backdrop: info.backdrop || '',
            mediaType: info.mediaType || 'movie',
            season: info.season,
            episode: info.episode,
            progress: progressRef.current,
            duration: info.duration || 0,
        };

        if (user) {
            // DB save — fire-and-forget
            supabase.from('watch_history').upsert({
                user_id: user.id,
                media_id: entry.id,
                media_type: entry.mediaType,
                title: entry.title,
                poster_path: entry.poster,
                backdrop_path: entry.backdrop,
                duration: entry.duration,
                watched: entry.progress,
                last_watched_at: new Date().toISOString(),
            }, { onConflict: 'user_id, media_id, media_type' }).then(({ error }) => {
                if (error) console.error('WatchProgress DB save error:', error);
            });
        } else {
            // Guest — localStorage (fires CW_UPDATE_EVENT automatically)
            saveContinueWatching(entry);
        }
    }, [user]);

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
    }, [isOpen, mediaInfo?.id]); // Only re-run when player opens/closes or media changes
};
