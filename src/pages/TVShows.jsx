import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/ui/Hero';
import Row from '../components/layout/Row';
import MovieCard from '../components/cards/MovieCard';
import {
    getTvShows,
    getTopRatedTV,
    getAiringTodayTV,
    getOnTheAirTV,
    getTVShowsByGenre,
    getTrendingTV,
    getDiscoverTV
} from '../services/tmdb';
import { HomeSkeleton } from '../components/loaders/Loaders';
import { Star, ChevronLeft, ChevronRight, Play, Loader2 } from 'lucide-react';
import ENDPOINTS from '../services/endpoints';

const GENRES = [
    { id: 'all', label: 'All' },
    { id: 10759, label: 'Action & Adventure' },
    { id: 16, label: 'Animation' },
    { id: 35, label: 'Comedy' },
    { id: 80, label: 'Crime' },
    { id: 99, label: 'Documentary' },
    { id: 18, label: 'Drama' },
    { id: 10751, label: 'Family' },
    { id: 10762, label: 'Kids' },
    { id: 9648, label: 'Mystery' },
    { id: 10763, label: 'News' },
    { id: 10764, label: 'Reality' },
    { id: 10765, label: 'Sci-Fi & Fantasy' },
    { id: 10766, label: 'Soap' },
    { id: 10767, label: 'Talk' },
    { id: 10768, label: 'War & Politics' },
    { id: 37, label: 'Western' }
];

const TVShows = () => {
    const [loading, setLoading] = useState(true);
    const [activeGenre, setActiveGenre] = useState('all');

    // Data for "All" view
    const [trending, setTrending] = useState([]);
    const [rows, setRows] = useState({
        popular: [],
        topRated: [],
        airingToday: [],
        onTheAir: [],
        action: [],
        animation: [],
        comedy: [],
        crime: [],
        documentary: [],
        drama: [],
        family: [],
        kids: [],
        mystery: [],
        news: [],
        reality: [],
        scifi: [],
        soap: [],
        talk: [],
        war: [],
        western: [],
    });

    // Data for "Genre" grid view
    const [genreShows, setGenreShows] = useState([]);
    const [isFetchingGenre, setIsFetchingGenre] = useState(false);

    const top10Ref = useRef(null);
    const navigate = useNavigate();

    // Initial Fetch (All)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await Promise.all([
                    getTrendingTV(),          // 0
                    getTvShows(),             // 1
                    getTopRatedTV(),          // 2
                    getAiringTodayTV(),       // 3
                    getOnTheAirTV(),          // 4
                    getTVShowsByGenre(10759), // 5 Action
                    getTVShowsByGenre(16),    // 6 Animation
                    getTVShowsByGenre(35),    // 7 Comedy
                    getTVShowsByGenre(80),    // 8 Crime
                    getTVShowsByGenre(99),    // 9 Documentary
                    getTVShowsByGenre(18),    // 10 Drama
                    getTVShowsByGenre(10751), // 11 Family
                    getTVShowsByGenre(10762), // 12 Kids
                    getTVShowsByGenre(9648),  // 13 Mystery
                    getTVShowsByGenre(10763), // 14 News
                    getTVShowsByGenre(10764), // 15 Reality
                    getTVShowsByGenre(10765), // 16 Sci-Fi
                    getTVShowsByGenre(10766), // 17 Soap
                    getTVShowsByGenre(10767), // 18 Talk
                    getTVShowsByGenre(10768), // 19 War
                    getTVShowsByGenre(37),    // 20 Western
                ]);

                setTrending(results[0].filter(s => s.poster_path).slice(0, 10));
                setRows({
                    popular: results[1],
                    topRated: results[2],
                    airingToday: results[3],
                    onTheAir: results[4],
                    action: results[5],
                    animation: results[6],
                    comedy: results[7],
                    crime: results[8],
                    documentary: results[9],
                    drama: results[10],
                    family: results[11],
                    kids: results[12],
                    mystery: results[13],
                    news: results[14],
                    reality: results[15],
                    scifi: results[16],
                    soap: results[17],
                    talk: results[18],
                    war: results[19],
                    western: results[20],
                });
            } catch (error) {
                console.error('Error fetching TV shows:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Fetch Genre Grid Data
    useEffect(() => {
        if (activeGenre === 'all') {
            setGenreShows([]);
            return;
        }

        const fetchGenreGrid = async () => {
            setIsFetchingGenre(true);
            try {
                const [page1, page2] = await Promise.all([
                    getDiscoverTV(activeGenre, 1),
                    getDiscoverTV(activeGenre, 2)
                ]);
                const combined = [...page1, ...page2];
                const unique = Array.from(new Map(combined.map(s => [s.id, s])).values());
                setGenreShows(unique);
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

    const allRows = [
        { key: 'popular', title: 'Popular Series', items: rows.popular },
        { key: 'topRated', title: 'Top Rated Series', items: rows.topRated },
        { key: 'onTheAir', title: 'On The Air', items: rows.onTheAir },
        { key: 'airingToday', title: 'Airing Today', items: rows.airingToday },
        { key: 'action', title: 'Action & Adventure', items: rows.action },
        { key: 'animation', title: 'Animated Worlds', items: rows.animation },
        { key: 'comedy', title: 'Comedy Gold', items: rows.comedy },
        { key: 'crime', title: 'Crime & Mystery', items: rows.crime },
        { key: 'drama', title: 'Dramatic Masterpieces', items: rows.drama },
        { key: 'scifi', title: 'Sci-Fi & Fantasy', items: rows.scifi },
        { key: 'mystery', title: 'Whodunnit Mysteries', items: rows.mystery },
        { key: 'documentary', title: 'True Stories', items: rows.documentary },
        { key: 'reality', title: 'Reality TV', items: rows.reality },
        { key: 'family', title: 'Family Time', items: rows.family },
        { key: 'kids', title: 'Kids & Cartoons', items: rows.kids },
        { key: 'news', title: 'Global News', items: rows.news },
        { key: 'soap', title: 'Soap Operas', items: rows.soap },
        { key: 'talk', title: 'Talk Shows', items: rows.talk },
        { key: 'war', title: 'War & Politics', items: rows.war },
        { key: 'western', title: 'Western Classics', items: rows.western },
    ];

    return (
        <div className="home-page">
            <Hero contentType="tv" />
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
                                        Trending Series Today
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
                                    {trending.map((show, i) => (
                                        <div
                                            key={show.id}
                                            className="top10-card"
                                            style={{ '--card-index': i }}
                                            onClick={() => navigate(`/tv/${show.id}`)}
                                        >
                                            <span className="top10-card__rank" data-stroke={i + 1}>{i + 1}</span>
                                            <div className="top10-card__poster">
                                                <img
                                                    src={`${ENDPOINTS.IMAGE_BASE_URL_W500}${show.poster_path}`}
                                                    alt={show.name}
                                                />
                                                <div className="top10-card__bottom">
                                                    <span className="top10-card__name">{show.name || show.title}</span>
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
                                {genreShows.map((show) => (
                                    <MovieCard key={show.id} movie={show} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TVShows;
