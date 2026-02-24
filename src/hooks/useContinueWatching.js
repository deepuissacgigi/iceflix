import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
    getContinueWatching,
    saveContinueWatching,
    removeContinueWatching,
    CW_UPDATE_EVENT,
} from '../utils/continueWatching';

const FINISHED_THRESHOLD = 0.90;

export const useContinueWatching = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Fetch ──────────────────────────────────────────────
    const fetchHistory = useCallback(async () => {
        let mergedHistory = getContinueWatching(); // Always get local as baseline

        if (user) {
            try {
                const { data, error } = await supabase
                    .from('watch_history')
                    .select('*')
                    .order('last_watched_at', { ascending: false });

                if (error) {
                    if (error.code !== 'PGRST205') console.error('CW fetch error:', error);
                } else if (data && data.length > 0) {
                    const dbHistory = data.map(item => ({
                        ...item,
                        id: item.media_id,
                        mediaType: item.media_type,
                        progress: item.watched,
                        duration: item.duration,
                        backdrop: item.backdrop_path,
                        poster: item.poster_path,
                        updatedAt: new Date(item.last_watched_at).getTime(),
                    }));

                    // Supabase entries take priority over localStorage if present
                    mergedHistory = dbHistory;
                }
            } catch (e) {
                console.error('CW fetch exception:', e);
            }
        }

        setHistory(mergedHistory);
        setLoading(false);
    }, [user]);

    // ── Subscribe ─────────────────────────────────────────
    useEffect(() => {
        fetchHistory();

        let channel;
        if (user) {
            // Supabase realtime
            channel = supabase
                .channel('cw_changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'watch_history', filter: `user_id=eq.${user.id}` },
                    () => fetchHistory()
                )
                .subscribe();
        }

        // Always listen to local events to handle fallback logic
        const onUpdate = () => fetchHistory();
        window.addEventListener(CW_UPDATE_EVENT, onUpdate);
        window.addEventListener('storage', onUpdate); // cross-tab

        return () => {
            if (channel) supabase.removeChannel(channel);
            window.removeEventListener(CW_UPDATE_EVENT, onUpdate);
            window.removeEventListener('storage', onUpdate);
        };
    }, [user, fetchHistory]);

    // ── Save ──────────────────────────────────────────────
    const saveProgress = useCallback(async (item, progress, duration) => {
        if (!item?.id || progress <= 0) return;

        // Auto-remove when finished
        const pct = duration > 0 ? progress / duration : 0;
        if (pct >= FINISHED_THRESHOLD) {
            await removeItem(item.id, item.mediaType || 'movie');
            return;
        }

        // ALWAYS save to local storage
        saveContinueWatching({ ...item, progress, duration });

        if (user) {
            try {
                const { error } = await supabase.from('watch_history').upsert({
                    user_id: user.id,
                    media_id: item.id,
                    media_type: item.mediaType || 'movie',
                    title: item.title || '',
                    poster_path: item.poster || item.poster_path || '',
                    backdrop_path: item.backdrop || item.backdrop_path || '',
                    duration,
                    watched: progress,
                    last_watched_at: new Date().toISOString(),
                }, { onConflict: 'user_id, media_id, media_type' });

                if (error && error.code !== 'PGRST205') {
                    console.error('CW save db error:', error);
                }
            } catch (e) {
                console.error('CW save exception:', e);
            }
        }
    }, [user]);

    // ── Remove ────────────────────────────────────────────
    const removeItem = useCallback(async (id, mediaType) => {
        // ALWAYS remove locally
        removeContinueWatching(id, mediaType);

        if (user) {
            try {
                const { error } = await supabase
                    .from('watch_history')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('media_id', id)
                    .eq('media_type', mediaType);

                if (error && error.code !== 'PGRST205') {
                    console.error('CW remove db error:', error);
                }
            } catch (e) {
                console.error('CW remove exception:', e);
            }
        }
    }, [user]);

    return {
        history,
        saveProgress,
        removeHistoryItem: removeItem,
        loading,
    };
};
