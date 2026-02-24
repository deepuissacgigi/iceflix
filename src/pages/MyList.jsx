import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Film, Tv, LayoutGrid, LogIn, Loader2 } from 'lucide-react';
import MovieCard from '../components/cards/MovieCard';
import useMyList from '../hooks/useMyList';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDocTitle from '../hooks/useDocTitle';

const MyList = () => {
    useDocTitle('My List');
    const { user, loading: authLoading } = useAuth();
    const { myList, removeFromMyList, loading: listLoading } = useMyList();
    const [filter, setFilter] = useState('all');
    const [filteredList, setFilteredList] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (filter === 'all') {
            setFilteredList(myList);
        } else {
            setFilteredList(myList.filter(item => item.media_type === filter));
        }
    }, [myList, filter]);

    // Wait for auth to resolve before showing anything
    if (authLoading) {
        return (
            <div className="mylist-page">
                <div className="empty-state">
                    <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    if (listLoading) {
        return (
            <div className="mylist-page">
                <div className="mylist-page__header">
                    <h1>My List</h1>
                </div>
                <div className="empty-state">
                    <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
                    <p>Loading your list...</p>
                </div>
            </div>
        );
    }

    if (myList.length === 0) {
        return (
            <div className="mylist-page">
                <div className="mylist-page__header">
                    <h1>My List <span>0 Items</span></h1>
                </div>
                <div className="empty-state">
                    <Bookmark size={64} />
                    <h2>Your list is empty</h2>
                    <p>Movies and TV shows you add to your list will appear here.</p>
                    <Button variant="primary" onClick={() => navigate('/')}>
                        Browse Content
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mylist-page">
            <div className="mylist-page__header">
                <h1>My List <span>{myList.length} Items</span></h1>

                <div className="filters">
                    <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                    >
                        <LayoutGrid size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                        All
                    </button>
                    <button
                        className={filter === 'movie' ? 'active' : ''}
                        onClick={() => setFilter('movie')}
                    >
                        <Film size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                        Movies
                    </button>
                    <button
                        className={filter === 'tv' ? 'active' : ''}
                        onClick={() => setFilter('tv')}
                    >
                        <Tv size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                        TV Shows
                    </button>
                </div>
            </div>

            <motion.div
                className="mylist-page__grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <AnimatePresence mode='popLayout'>
                    {filteredList.map(item => (
                        <motion.div
                            key={item.id}
                            variants={itemVariants}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MovieCard movie={item} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {filteredList.length === 0 && myList.length > 0 && (
                <div className="empty-state" style={{ height: '30vh' }}>
                    <p>No content found for this filter.</p>
                </div>
            )}
        </div>
    );
};

export default MyList;
