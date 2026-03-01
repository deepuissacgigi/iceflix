import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Plus, Check } from 'lucide-react';
import Button from '../ui/Button';
import { useApp } from '../../context/AppContext';
import StarRating from '../ui/StarRating';
import UserScoreMeter from '../ui/UserScoreMeter';
import PopularityMeter from '../ui/PopularityMeter';
import ENDPOINTS from '../../services/endpoints';
import ProgressiveHeroImage from '../ui/ProgressiveHeroImage';
import { getTrending, getTrendingMovies, getTrendingTV } from '../../services/tmdb';
import useMyList from '../../hooks/useMyList';

const Hero = ({ contentType = 'all' }) => {
    const [movies, setMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const { playMovie, playTV } = useApp();
    const { isInMyList, toggleMyList } = useMyList();

    // Derived state for current movie
    const currentMovie = movies[currentIndex];
    const inList = currentMovie ? isInMyList(currentMovie.id, currentMovie.media_type) : false;

    useEffect(() => {
        setShowInfo(false);
    }, [currentIndex]);

    useEffect(() => {
        const fetchHeroMovies = async () => {
            try {
                let trending = [];
                if (contentType === 'movie') {
                    const data = await getTrendingMovies();
                    trending = data.map(m => ({ ...m, media_type: 'movie' }));
                } else if (contentType === 'tv') {
                    const data = await getTrendingTV();
                    trending = data.map(t => ({ ...t, media_type: 'tv' }));
                } else {
                    const mixedData = await getTrending();
                    // getTrending already returns a mix of 'movie' and 'tv' with media_type attached
                    trending = mixedData;
                }

                // Filter out anime (Animation genre from Japan)
                const nonAnime = trending.filter(item => {
                    const hasAnimationGenre = item.genre_ids?.includes(16);
                    const isJapanese = item.origin_country?.includes('JP') ||
                        item.original_language === 'ja';
                    return !(hasAnimationGenre && isJapanese);
                });

                // Take top 5 non-anime movies for the slider
                setMovies(nonAnime.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch hero movies', error);
            }
        };

        fetchHeroMovies();
    }, [contentType]);

    // Auto-Play Timer
    useEffect(() => {
        if (movies.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
        }, 300000); // 5 Minutes Rotation

        return () => clearInterval(interval);
    }, [movies]);

    if (movies.length === 0) return <div className="hero skeleton"></div>;

    const movie = movies[currentIndex];
    const releaseDate = movie?.release_date || movie?.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

    return (
        <div className="hero">
            <AnimatePresence initial={false}>
                <motion.div
                    key={`${movie.id}-${movie.media_type || 'item'}`}
                    className="hero__slide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    style={{ position: 'absolute', inset: 0 }}
                >
                    {/* Background Image - Progressive 4K */}
                    <div className="hero__bg">
                        <ProgressiveHeroImage
                            path={movie.backdrop_path}
                            alt={movie.title || movie.name}
                        />
                        <div className="overlay-gradient" />
                    </div>

                    {/* Content */}
                    <div className="hero__content">
                        <motion.h1
                            className="hero__title"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            {movie.title || movie.name}
                        </motion.h1>

                        {/* Meta Data Reveal */}
                        <AnimatePresence>
                            {showInfo && (
                                <motion.div
                                    className="hero__meta"
                                    initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                                    animate={{ height: 'auto', opacity: 1, marginBottom: '2rem' }}
                                    exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                                >
                                    <StarRating score={movie.vote_average || 0} />
                                    <div className="divider"></div>
                                    <UserScoreMeter score={movie.vote_average || 0} />
                                    <div className="divider"></div>
                                    <PopularityMeter score={movie.popularity} />
                                    <div className="divider"></div>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{year}</span>
                                    <div className="divider"></div>
                                    <span className="badge">HD</span>
                                    <span className="badge">{movie.adult ? '18+' : '13+'}</span>
                                    <div className="divider"></div>
                                    <span style={{ textTransform: 'uppercase' }}>{movie.original_language}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="hero__trending"
                        >
                            <span>Trending Now</span>
                            <div className="line" />
                        </motion.div>

                        <motion.p
                            className="hero__desc"
                            initial={{ opacity: 1 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        >
                            {movie.overview}
                        </motion.p>

                        <motion.div
                            className="hero__actions"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                        >
                            <Button
                                variant="primary"
                                icon={Play}
                                onClick={() => {
                                    if (movie.media_type === 'tv') {
                                        playTV(movie.id, 1, 1, movie.name, movie.backdrop_path);
                                    } else {
                                        playMovie(movie.id, movie.title, movie.backdrop_path);
                                    }
                                }}
                            >
                                Play Now
                            </Button>

                            <Button
                                variant="secondary"
                                icon={isInMyList(movie.id, movie.media_type) ? Check : Plus}
                                onClick={() => toggleMyList(movie)}
                            >
                                {isInMyList(movie.id, movie.media_type) ? 'Added' : 'My List'}
                            </Button>

                            <Button
                                variant="secondary"
                                icon={Info}
                                onClick={() => setShowInfo(!showInfo)}
                            >
                                {showInfo ? 'Less Info' : 'More Info'}
                            </Button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Optional: Indicators */}
            <div className="hero__indicators">
                {movies.map((_, index) => (
                    <div
                        key={index}
                        className={`indicator ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Hero;
