import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/ui/Hero';
import Row from '../components/layout/Row';
import MovieCard from '../components/cards/MovieCard';
import {
    getPopularMovies,
    getTopRatedMovies,
    getUpcomingMovies,
    getNowPlayingMovies,
    getMoviesByGenre,
    getTrendingMovies,
    getDiscoverMovies
} from '../services/tmdb';
import { HomeSkeleton } from '../components/loaders/Loaders';
import { Star, ChevronLeft, ChevronRight, Play, Loader2 } from 'lucide-react';
import ENDPOINTS from '../services/endpoints';

const GENRES = [
    { id: 'all', label: 'All' },
    { id: 28, label: 'Action' },
    { id: 12, label: 'Adventure' },
    { id: 16, label: 'Animation' },
    { id: 35, label: 'Comedy' },
    { id: 80, label: 'Crime' },
    { id: 99, label: 'Documentary' },
    { id: 18, label: 'Drama' },
    { id: 10751, label: 'Family' },
    { id: 14, label: 'Fantasy' },
    { id: 36, label: 'History' },
    { id: 27, label: 'Horror' },
    { id: 10402, label: 'Music' },
    { id: 9648, label: 'Mystery' },
    { id: 10749, label: 'Romance' },
    { id: 878, label: 'Sci-Fi' },
    { id: 10770, label: 'TV Movie' },
    { id: 53, label: 'Thriller' },
    { id: 10752, label: 'War' },
    { id: 37, label: 'Western' }
];

const Movies = () => {
    const [loading, setLoading] = useState(true);
    const [activeGenre, setActiveGenre] = useState('all');

    // Data for "All" view
    const [trending, setTrending] = useState([]);
    const [rows, setRows] = useState({
        popular: [],
        topRated: [],
        upcoming: [],
        nowPlaying: [],
        action: [],
        adventure: [],
        animation: [],
        comedy: [],
        crime: [],
        documentary: [],
        drama: [],
        family: [],
        fantasy: [],
        history: [],
        horror: [],
        music: [],
        mystery: [],
        romance: [],
        scifi: [],
        tvMovie: [],
        thriller: [],
        war: [],
        western: [],
    });

    // Data for "Genre" grid view
    const [genreMovies, setGenreMovies] = useState([]);
    const [isFetchingGenre, setIsFetchingGenre] = useState(false);

    const top10Ref = useRef(null);
    const navigate = useNavigate();

    // Initial Fetch (All)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await Promise.all([
                    getTrendingMovies(),       // 0
                    getPopularMovies(),        // 1
                    getTopRatedMovies(),       // 2
                    getUpcomingMovies(),       // 3
                    getNowPlayingMovies(),     // 4
                    getMoviesByGenre(28),      // 5 Action
                    getMoviesByGenre(12),      // 6 Adventure
                    getMoviesByGenre(16),      // 7 Animation
                    getMoviesByGenre(35),      // 8 Comedy
                    getMoviesByGenre(80),      // 9 Crime
                    getMoviesByGenre(99),      // 10 Doc
                    getMoviesByGenre(18),      // 11 Drama
                    getMoviesByGenre(10751),   // 12 Family
                    getMoviesByGenre(14),      // 13 Fantasy
                    getMoviesByGenre(36),      // 14 History
                    getMoviesByGenre(27),      // 15 Horror
                    getMoviesByGenre(10402),   // 16 Music
                    getMoviesByGenre(9648),    // 17 Mystery
                    getMoviesByGenre(10749),   // 18 Romance
                    getMoviesByGenre(878),     // 19 SciFi
                    getMoviesByGenre(10770),   // 20 TV Movie
                    getMoviesByGenre(53),      // 21 Thriller
                    getMoviesByGenre(10752),   // 22 War
                    getMoviesByGenre(37),      // 23 Western
                ]);

                setTrending(results[0].filter(m => m.poster_path).slice(0, 10));
                setRows({
                    popular: results[1],
                    topRated: results[2],
                    upcoming: results[3],
                    nowPlaying: results[4],
                    action: results[5],
                    adventure: results[6],
                    animation: results[7],
                    comedy: results[8],
                    crime: results[9],
                    documentary: results[10],
                    drama: results[11],
                    family: results[12],
                    fantasy: results[13],
                    history: results[14],
                    horror: results[15],
                    music: results[16],
                    mystery: results[17],
                    romance: results[18],
                    scifi: results[19],
                    tvMovie: results[20],
                    thriller: results[21],
                    war: results[22],
                    western: results[23],
                });
            } catch (error) {
                console.error('Error fetching movies:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch Genre Grid Data when filter changes
    useEffect(() => {
        if (activeGenre === 'all') {
            setGenreMovies([]);
            return;
        }

        const fetchGenreGrid = async () => {
            setIsFetchingGenre(true);
            try {
                // Fetch 2 pages for a nice grid
                const [page1, page2] = await Promise.all([
                    getDiscoverMovies(activeGenre, 1),
                    getDiscoverMovies(activeGenre, 2)
                ]);
                const combined = [...page1, ...page2];
                // Unique by ID
                const unique = Array.from(new Map(combined.map(m => [m.id, m])).values());
                setGenreMovies(unique);
            } catch (error) {
                console.error('Error fetching genre grid:', error);
            } finally {
                setIsFetchingGenre(false);
            }
        };

        fetchGenreGrid();
    }, [activeGenre]);

    const scrollTop10 = (dir) => {
        if (top10Ref.current) {
            const { scrollLeft, clientWidth } = top10Ref.current;
            const to = dir === 'left' ? scrollLeft - clientWidth * 0.7 : scrollLeft + clientWidth * 0.7;
            top10Ref.current.scrollTo({ left: to, behavior: 'smooth' });
        }
    };

    if (loading) return <HomeSkeleton />;

    // Row config for "All" view
    const allRows = [
        { key: 'nowPlaying', title: 'Now Playing in Theaters', items: rows.nowPlaying },
        { key: 'popular', title: 'Blockbuster Hits', items: rows.popular },
        { key: 'topRated', title: 'Critically Acclaimed', items: rows.topRated },
        { key: 'upcoming', title: 'Coming Soon', items: rows.upcoming },
        { key: 'action', title: 'Action Packed', items: rows.action },
        { key: 'adventure', title: 'Epic Adventures', items: rows.adventure },
        { key: 'animation', title: 'Animated Worlds', items: rows.animation },
        { key: 'comedy', title: 'Comedy Gold', items: rows.comedy },
        { key: 'crime', title: 'Crime & Mob', items: rows.crime },
        { key: 'drama', title: 'Dramatic Masterpieces', items: rows.drama },
        { key: 'family', title: 'Family Movie Night', items: rows.family },
        { key: 'fantasy', title: 'Magical Fantasy', items: rows.fantasy },
        { key: 'history', title: 'Based on History', items: rows.history },
        { key: 'horror', title: 'Horror & Gore', items: rows.horror },
        { key: 'music', title: 'Musicals & Concerts', items: rows.music },
        { key: 'mystery', title: 'Whodunnit Mysteries', items: rows.mystery },
        { key: 'romance', title: 'Romantic Getaways', items: rows.romance },
        { key: 'scifi', title: 'Sci-Fi Spectacles', items: rows.scifi },
        { key: 'thriller', title: 'Edge of Your Seat', items: rows.thriller },
        { key: 'tvMovie', title: 'Made for TV', items: rows.tvMovie },
        { key: 'war', title: 'War Epics', items: rows.war },
        { key: 'western', title: 'Western Classics', items: rows.western },
        { key: 'documentary', title: 'True Stories', items: rows.documentary },
    ];

    return (
        <div className="home-page">
            <Hero contentType="movie" />
            <div className="home-page__rows">
                {/* ═══ Genre Filter Chips ═══ */}
                <div className="genre-chips">
                    {GENRES.map((genre) => (
                        <button
                            key={genre.id}
                            className={`genre-chips__chip ${activeGenre === genre.id ? 'genre-chips__chip--active' : ''}`}
                            onClick={() => setActiveGenre(genre.id)}
                        >
                            {genre.label}
                        </button>
                    ))}
                </div>

                {/* ════════════ ALL VIEW ════════════ */}
                {activeGenre === 'all' && (
                    <>
                        {/* Top 10 Section */}
                        {trending.length > 0 && (
                            <div className="top10-section">
                                <div className="top10-section__header">
                                    <h2 className="top10-section__title">
                                        <span className="top10-section__badge">TOP 10</span>
                                        Trending Movies Today
                                    </h2>
                                    <div className="top10-section__arrows">
                                        <button onClick={() => scrollTop10('left')} aria-label="Scroll left">
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button onClick={() => scrollTop10('right')} aria-label="Scroll right">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="top10-section__track" ref={top10Ref}>
                                    {trending.map((movie, i) => (
                                        <div
                                            key={movie.id}
                                            className="top10-card"
                                            style={{ '--card-index': i }}
                                            onClick={() => navigate(`/movie/${movie.id}`)}
                                        >
                                            <span className="top10-card__rank" data-stroke={i + 1}>{i + 1}</span>
                                            <div className="top10-card__poster">
                                                <img
                                                    src={`${ENDPOINTS.IMAGE_BASE_URL_W500}${movie.poster_path}`}
                                                    alt={movie.title}
                                                />
                                                <div className="top10-card__bottom">
                                                    <span className="top10-card__name">{movie.title || movie.name}</span>
                                                </div>
                                                <div className="top10-card__overlay">
                                                    <div className="top10-card__play">
                                                        <Play size={22} fill="white" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Standard Rows */}
                        {allRows.map((row) => (
                            <Row key={row.key} title={row.title} items={row.items} />
                        ))}
                    </>
                )}

                {/* ════════════ GENRE GRID VIEW ════════════ */}
                {activeGenre !== 'all' && (
                    <div className="min-h-[50vh]">
                        {isFetchingGenre ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 size={40} className="animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="genre-grid">
                                {genreMovies.map((movie) => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Movies;
