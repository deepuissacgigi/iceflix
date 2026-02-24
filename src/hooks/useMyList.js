import { useState, useEffect, useCallback } from 'react';
import { getMyList, addItem, removeItem, isInList, MyListEvents, normalizeItem } from '../utils/myList';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

/**
 * Hook to manage My List state and interactions.
 * supports both LocalStorage (Guest) and Supabase (Auth).
 */
const useMyList = () => {
    const [list, setList] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // Fetch List
    const fetchList = useCallback(async () => {
        if (user) {
            try {
                const { data, error } = await supabase
                    .from('my_list')
                    .select('*')
                    .order('added_at', { ascending: false });

                if (error) throw error;

                // Map DB columns to Frontend structure if needed, or ensuring consistency
                // DB has 'media_id', 'added_at'. Frontend expects 'id', 'addedAt' logic sometimes, 
                // but our utils use 'id'. 
                // The DB schema I proposed used `media_id` for the TMDB ID and `id` for primary key.
                // We need to map `media_id` -> `id` for frontend compatibility.
                const mapped = data.map(item => ({
                    ...item,
                    id: item.media_id, // Map DB TMDB ID back to 'id'
                    addedAt: new Date(item.added_at).getTime()
                }));
                setList(mapped);
            } catch (e) {
                console.error("Supabase Fetch Error:", e);
            }
        } else {
            setList(getMyList());
        }
        setLoading(false);
    }, [user]);

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
            return () => window.removeEventListener(MyListEvents.UPDATE, handleUpdate);
        }
    }, [user, fetchList]);

    const add = useCallback(async (item) => {
        if (user) {
            const normalized = normalizeItem(item);
            // Prepare for DB
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
                    // Ignore duplicate key error silently (already in list)
                    if (error.code !== '23505') throw error;
                }
                fetchList(); // Optimistic update possible, but fetch is safer
            } catch (e) {
                console.error("Supabase Add Error:", e);
            }
        } else {
            addItem(item);
        }
    }, [user, fetchList]);

    const remove = useCallback(async (id, mediaType) => {
        if (user) {
            try {
                // Determine delete filter. DB has user_id, media_id, media_type.
                let query = supabase.from('my_list').delete().eq('user_id', user.id).eq('media_id', id);
                if (mediaType) {
                    query = query.eq('media_type', mediaType);
                }
                await query;
                fetchList();
            } catch (e) {
                console.error("Supabase Remove Error:", e);
            }
        } else {
            removeItem(id, mediaType);
        }
    }, [user, fetchList]);

    const checkIsAdded = useCallback((id, mediaType) => {
        // For local, we check the state 'list' which is kept in sync.
        // For Supabase, 'list' is also kept in sync via fetch/subscription.
        // So we can just check 'list'.
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
