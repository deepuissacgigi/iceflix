import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const useWatchHistory = () => {
    const [history, setHistory] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const fetchHistory = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('watch_history')
                .select('*')
                .order('last_watched_at', { ascending: false });

            if (error) throw error;

            // Map DB fields to frontend structure if needed
            // Our DB uses snake_case, frontend items usually use camelCase or direct properties
            // Let's standardise on the object structure used in ContinueWatchingCard
            const mapped = data.map(item => ({
                id: item.media_id,
                media_type: item.media_type,
                title: item.title,
                poster_path: item.poster_path,
                backdrop_path: item.backdrop_path,
                duration: item.duration,
                progress: item.watched,
                last_watched_at: item.last_watched_at
            }));

            setHistory(mapped);
        } catch (error) {
            console.error('Error fetching watch history:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchHistory();

        if (user) {
            const channel = supabase
                .channel('watch_history_changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'watch_history', filter: `user_id=eq.${user.id}` },
                    () => fetchHistory()
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, fetchHistory]);

    const addToHistory = useCallback(async (item, progress, duration) => {
        if (!user) return;

        const dbItem = {
            user_id: user.id,
            media_id: item.id,
            media_type: item.media_type || 'movie',
            title: item.title || item.name,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            duration: duration,
            watched: progress,
            last_watched_at: new Date().toISOString()
        };

        try {
            // Upsert: Insert or Update on conflict (user_id, media_id, media_type)
            const { error } = await supabase
                .from('watch_history')
                .upsert(dbItem, { onConflict: 'user_id, media_id, media_type' });

            if (error) throw error;
            // No need to manually fetch here, subscription will catch it
        } catch (error) {
            console.error('Error saving watch history:', error);
        }
    }, [user]);

    const removeFromHistory = useCallback(async (id, mediaType) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('watch_history')
                .delete()
                .eq('user_id', user.id)
                .eq('media_id', id)
                .eq('media_type', mediaType);

            if (error) throw error;
        } catch (error) {
            console.error('Error removing from watch history:', error);
        }
    }, [user]);

    return {
        history,
        loading,
        addToHistory,
        removeFromHistory,
        refreshHistory: fetchHistory
    };
};
