import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabase';
import {
    getContinueWatching,
    saveContinueWatching,
    removeContinueWatching,
    CW_UPDATE_EVENT,
} from '../utils/continueWatching';

const FINISHED_THRESHOLD = 0.90;

export const useContinueWatching = () => {
    const { user, loading: authLoading } = useAuth();
    const { addNotification } = useNotification();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Fetch ──────────────────────────────────────────────
    const fetchHistory = useCallback(async () => {
        // Don't fetch until auth has resolved
        if (authLoading) return;

        setLoading(true);

        if (user) {
            // LOGGED IN → fetch from Supabase EXCLUSIVELY to prevent guest data bleed
            try {
                const { data, error } = await supabase
                    .from('watch_history')
                    .select('*')
                    .order('last_watched_at', { ascending: false });

                if (error) {
                    if (error.code !== 'PGRST205') console.error('CW fetch error:', error);
                    setHistory([]);
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
                    setHistory(dbHistory);
                } else {
                    setHistory([]);
                }
            } catch (e) {
                console.error('CW fetch exception:', e);
                setHistory([]);
            }
        } else {
            // GUEST → use localStorage exclusively
            setHistory(getContinueWatching());
        }

        setLoading(false);
    }, [user, authLoading]);

    // ── Subscribe ─────────────────────────────────────────
    useEffect(() => {
        fetchHistory();

        let channel;
        if (user) {
            // Supabase realtime for logged-in users
            channel = supabase
                .channel('cw_changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'watch_history', filter: `user_id=eq.${user.id}` },
                    () => fetchHistory()
                )
                .subscribe();
        }

        // Always listen for local storage changes so VideoPlayerModal quick-saves apply INSTANTLY for guests
        const onLocalUpdate = () => {
            if (!user) {
                setHistory(getContinueWatching());
            }
        };
        window.addEventListener(CW_UPDATE_EVENT, onLocalUpdate);
        window.addEventListener('storage', onLocalUpdate);

        return () => {
            if (channel) supabase.removeChannel(channel);
            window.removeEventListener(CW_UPDATE_EVENT, onLocalUpdate);
            window.removeEventListener('storage', onLocalUpdate);
        };
    }, [user, fetchHistory]);

    // ── Save ──────────────────────────────────────────────
    const saveProgress = useCallback(async (item, progress, duration) => {
        if (!item?.id || progress <= 0) return;

        // Auto-remove when finished
        const pct = duration > 0 ? progress / duration : 0;
        if (pct >= FINISHED_THRESHOLD) {
            const videoKey = `notif_fin_${item.id}_${item.mediaType}_${item.season || 0}_${item.episode || 0}`;
            if (!sessionStorage.getItem(videoKey)) {
                let msg = `Finished watching ${item.title || 'a video'}`;
                if (item.mediaType === 'tv' && item.season && item.episode) {
                    msg = `Finished S${item.season} E${item.episode} of ${item.title}`;
                }
                
                addNotification(msg, 'success', {
                    title: item.title || 'Completed',
                    thumbnail: item.backdrop || item.poster ? `https://image.tmdb.org/t/p/w200${item.backdrop || item.poster}` : null,
                });
                
                sessionStorage.setItem(videoKey, 'true');
            }

            await removeItem(item.id, item.mediaType || 'movie');
            return;
        }

        if (user) {
            // Logged In: Only save to database (Supabase realtime will update the UI)
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
        } else {
            // Guest: Save to local storage
            saveContinueWatching({ ...item, progress, duration });
        }
    }, [user]);

    // ── Remove ────────────────────────────────────────────
    const removeItem = useCallback(async (id, mediaType, isManual = false, itemObj = null) => {
        if (isManual && itemObj) {
            const title = itemObj.title || itemObj.name || 'a video';
            addNotification(`Removed ${title} from Watch History`, 'info');
        }

        // Optimistically update the local state so the UI reacts instantly
        setHistory(prev => prev.filter(i => !(i.id === id && i.mediaType === mediaType)));

        if (user) {
            // Logged In: Only remove from database
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
        } else {
            // Guest: Only remove from local storage
            removeContinueWatching(id, mediaType);
        }
    }, [user]);

    return {
        history,
        saveProgress,
        removeHistoryItem: removeItem,
        loading,
    };
};
