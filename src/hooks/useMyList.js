import { useState, useEffect, useCallback } from 'react';
import { getMyList, addItem, removeItem, MyListEvents, normalizeItem } from '../utils/myList';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useNotification } from '../context/NotificationContext';

/**
 * Hook to manage My List state and interactions.
 * Fully supports guests via localStorage and users via Supabase.
 */
const useMyList = () => {
    const [list, setList] = useState([]);
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const { addNotification } = useNotification();

    // Fetch List
    const fetchList = useCallback(async () => {
        // Don't fetch until auth has resolved
        if (authLoading) return;

        setLoading(true);

        if (!user) {
            setList(getMyList());
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('my_list')
                .select('*')
                .order('added_at', { ascending: false });

            if (error) throw error;

            const mapped = data.map(item => ({
                ...item,
                id: item.media_id,
                addedAt: new Date(item.added_at).getTime()
            }));
            setList(mapped);
        } catch (e) {
            console.error("Supabase MyList Fetch Error:", e);
            setList([]);
        } finally {
            setLoading(false);
        }
    }, [user, authLoading]);

    // Initial Fetch & Subscription
    useEffect(() => {
        fetchList();

        if (user) {
            // Realtime subscription for Supabase
            const channel = supabase
                .channel('my_list_changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'my_list', filter: `user_id=eq.${user.id}` },
                    () => fetchList()
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        } else {
            // LocalStorage events
            const handleUpdate = () => setList(getMyList());
            window.addEventListener(MyListEvents.UPDATE, handleUpdate);
            // Also listen to raw storage events for cross-tab sync
            window.addEventListener('storage', handleUpdate);
            return () => {
                window.removeEventListener(MyListEvents.UPDATE, handleUpdate);
                window.removeEventListener('storage', handleUpdate);
            };
        }
    }, [user, fetchList]);

    const add = useCallback(async (item) => {
        if (!user) {
            addItem(item);
            return;
        }

        const normalized = normalizeItem(item);
        const dbItem = {
            user_id: user.id,
            media_id: normalized.id,
            media_type: normalized.media_type,
            title: normalized.title,
            poster_path: normalized.poster_path,
            backdrop_path: normalized.backdrop_path,
            vote_average: normalized.vote_average
        };

        try {
            const { error } = await supabase.from('my_list').insert(dbItem);
            if (error) {
                // Ignore duplicate key error silently
                if (error.code !== '23505') throw error;
            } else {
                addNotification(`Added to My List`, 'add', {
                    thumbnail: normalized.poster_path ? `https://image.tmdb.org/t/p/w92${normalized.poster_path}` : null,
                    title: normalized.title,
                    subtitle: normalized.media_type === 'tv' ? 'TV Show' : 'Movie',
                });
            }
            fetchList();
        } catch (e) {
            console.error("Supabase Add Error:", e);
        }
    }, [user, fetchList, addNotification]);

    const remove = useCallback(async (id, mediaType) => {
        if (!user) {
            removeItem(id, mediaType);
            return;
        }

        try {
            let query = supabase.from('my_list').delete().eq('user_id', user.id).eq('media_id', id);
            if (mediaType) {
                query = query.eq('media_type', mediaType);
            }
            const { error } = await query;
            if (!error) {
                addNotification('Removed from My List', 'remove', {
                    subtitle: mediaType === 'tv' ? 'TV Show' : 'Movie',
                });
            }
            fetchList();
        } catch (e) {
            console.error("Supabase Remove Error:", e);
        }
    }, [user, fetchList, addNotification]);

    const checkIsAdded = useCallback((id, mediaType) => {
        return list.some(i => i.id === id && (!mediaType || i.media_type === mediaType));
    }, [list]);

    const toggle = useCallback((item) => {
        const exists = checkIsAdded(item.id, item.media_type);
        if (exists) {
            remove(item.id, item.media_type);
        } else {
            add(item);
        }
        return !exists;
    }, [checkIsAdded, remove, add]);

    return {
        myList: list,
        addToMyList: add,
        removeFromMyList: remove,
        isInMyList: checkIsAdded,
        toggleMyList: toggle,
        loading
    };
};

export default useMyList;
