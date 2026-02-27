import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Film, Tv, LayoutGrid, Loader2, Trash2, Search, SlidersHorizontal } from 'lucide-react';
import MyListCard from '../components/cards/MyListCard';
import useMyList from '../hooks/useMyList';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocTitle from '../hooks/useDocTitle';

const FILTERS = [
    { key: 'all', label: 'All', icon: LayoutGrid },
    { key: 'movie', label: 'Movies', icon: Film },
    { key: 'tv', label: 'TV Shows', icon: Tv },
];

const MyList = () => {
    useDocTitle('My List');
    const { user, loading: authLoading } = useAuth();
    const { myList, removeFromMyList, loading: listLoading } = useMyList();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('added'); // 'added' | 'name' | 'year'
    const navigate = useNavigate();

    const filteredList = useMemo(() => {
        let result = [...myList];

        // Apply filter
        if (filter !== 'all') {
            result = result.filter(item => item.media_type === filter);
        }

        // Apply search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                (item.title || item.name || '').toLowerCase().includes(q)
            );
        }

        // Apply sort
        if (sortBy === 'name') {
            result.sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
        } else if (sortBy === 'year') {
            result.sort((a, b) => {
                const yearA = parseInt((a.release_date || a.first_air_date || '0').substring(0, 4));
                const yearB = parseInt((b.release_date || b.first_air_date || '0').substring(0, 4));
                return yearB - yearA;
            });
        }
        // 'added' = default order from the hook

        return result;
    }, [myList, filter, searchQuery, sortBy]);

    // Get counts for each filter
    const counts = useMemo(() => ({
        all: myList.length,
        movie: myList.filter(i => i.media_type === 'movie').length,
        tv: myList.filter(i => i.media_type === 'tv').length,
    }), [myList]);

    // ── Loading state ──
    if (authLoading || listLoading) {
        return (
            <div className="mylist-page">
                <div className="mylist-page__loading">
                    <div className="mylist-page__loading-spinner">
                        <Loader2 size={40} className="animate-spin" />
                    </div>
                    <p>Loading your collection...</p>
                </div>
            </div>
        );
    }

    // ── Empty state ──
    if (myList.length === 0) {
        return (
            <div className="mylist-page">
                <div className="mylist-page__empty">
                    <motion.div
                        className="mylist-page__empty-icon"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Bookmark size={56} />
                    </motion.div>
                    <motion.h2
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                    >
                        Your watchlist is empty
                    </motion.h2>
                    <motion.p
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                    >
                        Save movies and TV shows to build your personal collection.
                    </motion.p>
                    <motion.div
                        initial={{ y: 15, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                    >
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Explore Content
                        </Button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="mylist-page">
            {/* ── Hero Header ── */}
            <motion.div
                className="mylist-page__hero"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="mylist-page__hero-content">
                    <h1 className="mylist-page__title">
                        My List
                    </h1>
                    <p className="mylist-page__subtitle">
                        {myList.length} {myList.length === 1 ? 'title' : 'titles'} saved
                    </p>
                </div>
            </motion.div>

            {/* ── Toolbar ── */}
            <motion.div
                className="mylist-page__toolbar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
            >
                {/* Filter Chips */}
                <div className="mylist-page__filters">
                    {FILTERS.map(f => {
                        const Icon = f.icon;
                        const isActive = filter === f.key;
                        return (
                            <button
                                key={f.key}
                                className={`mylist-page__filter-chip ${isActive ? 'active' : ''}`}
                                onClick={() => setFilter(f.key)}
                            >
                                <Icon size={15} />
                                <span>{f.label}</span>
                                <span className="mylist-page__filter-count">{counts[f.key]}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Search + Sort */}
                <div className="mylist-page__actions">
                    <div className="mylist-page__search">
                        <Search size={16} className="mylist-page__search-icon" />
                        <input
                            type="text"
                            placeholder="Search your list..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="mylist-page__search-input"
                        />
                    </div>

                    <select
                        className="mylist-page__sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="added">Date Added</option>
                        <option value="name">Name A–Z</option>
                        <option value="year">Year (Newest)</option>
                    </select>
                </div>
            </motion.div>

            {/* ── Grid ── */}
            <motion.div
                className="mylist-page__grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <AnimatePresence mode='popLayout'>
                    {filteredList.map((item, index) => (
                        <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92 }}
                            transition={{
                                duration: 0.35,
                                delay: index * 0.03,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                        >
                            <MyListCard movie={item} onRemove={removeFromMyList} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* ── No results for current filter ── */}
            {filteredList.length === 0 && myList.length > 0 && (
                <motion.div
                    className="mylist-page__no-results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Search size={32} />
                    <p>No titles match your search or filter.</p>
                </motion.div>
            )}
        </div>
    );
};

export default MyList;
