import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Play, Plus, Check, Star, ChevronDown, ChevronUp, Users, Clock, Calendar, Film, Tv, Globe } from 'lucide-react';
import {
    getMovieDetails, getMovieCredits, getSimilarMovies,
    getTVDetails, getTVCredits, getSimilarTVShows,
    getMovieImages, getTVImages, getSeasonDetails
} from '../services/tmdb';
import ENDPOINTS from '../services/endpoints';
import Button from '../components/ui/Button';
import MovieCard from '../components/cards/MovieCard';
import Row from '../components/layout/Row';
import { DetailsSkeleton } from '../components/loaders/Loaders';
import { useApp } from '../context/AppContext';
import useMyList from '../hooks/useMyList';
import StarRating from '../components/ui/StarRating';
import UserScoreMeter from '../components/ui/UserScoreMeter';
import PopularityMeter from '../components/ui/PopularityMeter';
import useDocTitle from '../hooks/useDocTitle';
import { useNotification } from '../context/NotificationContext';
import { useContinueWatching } from '../hooks/useContinueWatching';
import ProgressiveHeroImage from '../components/ui/ProgressiveHeroImage';

const MovieDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const isTV = location.pathname.includes('/tv/');

    const [item, setItem] = useState(null);
    useDocTitle(item ? (item.title || item.name) : 'Loading...');
    const [credits, setCredits] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [currentBgIndex, setCurrentBgIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showCast, setShowCast] = useState(false);
    const [images, setImages] = useState(null);

    // TV Season & Episode State
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [selectedEpisode, setSelectedEpisode] = useState(1);
    const [isEpisodeMenuOpen, setIsEpisodeMenuOpen] = useState(false);
    const [isSeasonMenuOpen, setIsSeasonMenuOpen] = useState(false);
    const [episodes, setEpisodes] = useState([]);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);

    const { addNotification } = useNotification();
    const { playMovie, playTV } = useApp();
    const { isInMyList, toggleMyList } = useMyList();

    // ── Data Fetching ──
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            window.scrollTo(0, 0);
            try {
                if (isTV) {
                    const [tvData, creditsData] = await Promise.all([
                        getTVDetails(id), getTVCredits(id)
                    ]);
                    setItem(tvData);
                    setCredits(creditsData);
                    Promise.all([
                        getSimilarTVShows(id).catch(() => []),
                        getTVImages(id).catch(() => null)
                    ]).then(([similarData, imagesData]) => {
                        const famousSimilar = similarData.filter(
                            show => show.vote_count >= 500 && show.poster_path
                        );
                        setSimilar(famousSimilar);
                        setImages(imagesData);
                    });
                } else {
                    const [movieData, creditsData] = await Promise.all([
                        getMovieDetails(id), getMovieCredits(id)
                    ]);
                    setItem(movieData);
                    setCredits(creditsData);
                    Promise.all([
                        getSimilarMovies(id).catch(() => []),
                        getMovieImages(id).catch(() => null)
                    ]).then(([similarData, imagesData]) => {
                        const famousSimilar = similarData.filter(
                            movie => movie.vote_count >= 500 && movie.poster_path
                        );
                        setSimilar(famousSimilar);
                        setImages(imagesData);
                    });
                }
            } catch (error) {
                console.error('Error details:', error);
                setItem(null);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id, isTV]);

    // Auto-rotate hero backgrounds
    useEffect(() => {
        if (!images?.backdrops?.length && !item?.backdrop_path) return;
        const interval = setInterval(() => {
            setCurrentBgIndex(prev => {
                const backdrops = images?.backdrops?.slice(0, 10).map(i => i.file_path) || [];
                const allImages = [...new Set([item.backdrop_path, ...backdrops].filter(Boolean))];
                if (allImages.length <= 1) return 0;
                return (prev + 1) % allImages.length;
            });
        }, 60000);
        return () => clearInterval(interval);
    }, [item, images]);

    const { history } = useContinueWatching();
    const hasInitializedRef = React.useRef(false);

    // ── TV Playback Memory Initialization ──
    // When the item finishes loading, check if it exists in history
    useEffect(() => {
        if (!isTV || !item?.id || !history || hasInitializedRef.current) return;

        const pastWatch = history.find(h => h.id === item.id && h.mediaType === 'tv');
        if (pastWatch && pastWatch.season && pastWatch.episode) {
            setSelectedSeason(pastWatch.season);
            // We do NOT set episode here yet, because the episode list for that season hasn't loaded
            // We set it inside the fetchEpisodes block below to ensure it exists
        }
        hasInitializedRef.current = true;
    }, [isTV, item?.id, history]);

    // Fetch episodes for TV shows
    useEffect(() => {
        if (!isTV || !id || !item) return;
        const fetchEpisodes = async () => {
            setLoadingEpisodes(true);
            try {
                const seasonData = await getSeasonDetails(id, selectedSeason);
                setEpisodes(seasonData.episodes || []);

                // If we are auto-resuming from history, pick the exact episode.
                // Otherwise, default to episode 1 of the selected season.
                const pastWatch = history.find(h => h.id === item.id && h.mediaType === 'tv');
                if (pastWatch && pastWatch.season === selectedSeason && pastWatch.episode) {
                    setSelectedEpisode(pastWatch.episode);
                } else {
                    setSelectedEpisode(1);
                }
            } catch (error) {
                console.error('Error fetching episodes:', error);
                setEpisodes([]);
            } finally {
                setLoadingEpisodes(false);
            }
        };
        fetchEpisodes();
    }, [isTV, id, selectedSeason, item, history]);

    if (!item) return <DetailsSkeleton />;

    // ── Normalize Data ──
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    const runtime = item.runtime || (item.episode_run_time ? item.episode_run_time[0] : 0);
    const duration = runtime > 0 ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : 'N/A';
    const director = credits?.crew?.find(c => c.job === 'Director');
    const mediaType = isTV ? 'tv' : 'movie';
    const inList = isInMyList(item.id, mediaType);
    const handleListToggle = () => {
        toggleMyList({
            ...item,
            media_type: mediaType,
        });
    };

    // Backdrop rotation
    const backdrops = images?.backdrops?.slice(0, 10).map(i => i.file_path) || [];
    const uniqueBackgroundImages = [...new Set([item.backdrop_path, ...backdrops].filter(Boolean))];
    const safeIndex = currentBgIndex % (uniqueBackgroundImages.length || 1);
    const currentBackdropUrl = `${ENDPOINTS.IMAGE_BASE_URL}${uniqueBackgroundImages[safeIndex]}`;

    // Current episode for display
    const currentEp = episodes.find(e => e.episode_number === selectedEpisode) || episodes[0];

    return (
        <div className="detail">
            {/* ═══════════ 1. CINEMATIC HERO ═══════════ */}
            <section className="detail__hero">
                <div className="detail__backdrop-wrap">
                    <ProgressiveHeroImage
                        key={safeIndex}
                        path={uniqueBackgroundImages[safeIndex]}
                        alt={title}
                    />
                </div>
                <div className="detail__hero-overlay" />

                {/* Backdrop Dots */}
                {uniqueBackgroundImages.length > 1 && (
                    <div className="detail__backdrop-dots">
                        {uniqueBackgroundImages.map((_, i) => (
                            <button
                                key={i}
                                className={`detail__backdrop-dot ${i === safeIndex ? 'detail__backdrop-dot--active' : ''}`}
                                onClick={() => setCurrentBgIndex(i)}
                                aria-label={`Backdrop ${i + 1}`}
                            />
                        ))}
                    </div>
                )}

                <div className="detail__hero-content">
                    {/* Type Badge */}
                    <div className="detail__type-badge">
                        {isTV ? <Tv size={14} /> : <Film size={14} />}
                        {isTV ? 'TV Series' : 'Movie'}
                    </div>

                    {/* Title */}
                    <h1 className="detail__title">{title}</h1>

                    {/* ═══ METADATA ROW (PRESERVED) ═══ */}
                    <div className="detail__meta-row">
                        <StarRating score={item.vote_average} />
                        <span className="detail__meta-dot" />
                        <UserScoreMeter score={item.vote_average} />
                        <span className="detail__meta-dot" />
                        <PopularityMeter score={item.popularity} />
                        <span className="detail__meta-dot" />
                        <span className="detail__meta-year">
                            <Calendar size={14} /> {year}
                        </span>
                        <span className="detail__meta-dot" />
                        <span className="detail__badge">HD</span>
                        <span className="detail__badge">{item.adult ? '18+' : '13+'}</span>
                        <span className="detail__meta-dot" />
                        <span className="detail__meta-duration">
                            <Clock size={14} /> {isTV ? (item.number_of_seasons + ' Season' + (item.number_of_seasons > 1 ? 's' : '')) : duration}
                        </span>
                    </div>

                    {/* Tagline */}
                    {item.tagline && (
                        <p className="detail__tagline">"{item.tagline}"</p>
                    )}

                    {/* Genres */}
                    {item.genres && item.genres.length > 0 && (
                        <div className="detail__genres">
                            {item.genres.map(g => (
                                <span key={g.id} className="detail__genre-tag">{g.name}</span>
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="detail__actions">
                        <Button
                            icon={Play}
                            onClick={() => isTV
                                ? playTV(item.id, selectedSeason, selectedEpisode, title, currentBackdropUrl)
                                : playMovie(item.id, title, currentBackdropUrl)
                            }
                        >
                            Play Now
                        </Button>
                        <button className="detail__action-btn" onClick={handleListToggle}>
                            {inList ? <Check size={20} /> : <Plus size={20} />}
                            {inList ? 'In My List' : 'My List'}
                        </button>

                        {/* TV: Season & Episode Selectors */}
                        {isTV && (
                            <div className="detail__selectors-group">
                                <div className="detail__select-wrap">
                                    {isSeasonMenuOpen && (
                                        <div className="detail__episode-backdrop" onClick={() => setIsSeasonMenuOpen(false)} />
                                    )}
                                    <button
                                        className={`detail__select-trigger ${isSeasonMenuOpen ? 'detail__select-trigger--active' : ''}`}
                                        onClick={() => setIsSeasonMenuOpen(!isSeasonMenuOpen)}
                                    >
                                        <span className="detail__select-text">Season {selectedSeason}</span>
                                        <ChevronDown size={16} className={`detail__select-icon ${isSeasonMenuOpen ? 'detail__select-icon--open' : ''}`} />
                                    </button>

                                    {isSeasonMenuOpen && (
                                        <div className="detail__select-dropdown">
                                            {Array.from({ length: item.number_of_seasons || 1 }, (_, i) => i + 1).map(s => (
                                                <div
                                                    key={s}
                                                    className={`detail__select-item ${selectedSeason === s ? 'detail__select-item--active' : ''}`}
                                                    onClick={() => {
                                                        setSelectedSeason(s);
                                                        setIsSeasonMenuOpen(false);
                                                    }}
                                                >
                                                    Season {s}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="detail__episode-wrap">
                                    {isEpisodeMenuOpen && (
                                        <div className="detail__episode-backdrop" onClick={() => setIsEpisodeMenuOpen(false)} />
                                    )}
                                    <button
                                        className={`detail__episode-trigger ${isEpisodeMenuOpen ? 'detail__episode-trigger--active' : ''}`}
                                        onClick={() => !loadingEpisodes && episodes.length > 0 && setIsEpisodeMenuOpen(!isEpisodeMenuOpen)}
                                        disabled={loadingEpisodes}
                                    >
                                        <span className="detail__episode-text">
                                            {loadingEpisodes ? 'Loading...'
                                                : episodes.length === 0 ? 'No Episodes'
                                                    : currentEp ? `Ep ${currentEp.episode_number}: ${currentEp.name}` : 'Select Episode'}
                                        </span>
                                        <ChevronDown size={16} className={`detail__episode-chevron ${isEpisodeMenuOpen ? 'detail__episode-chevron--open' : ''}`} />
                                    </button>

                                    {isEpisodeMenuOpen && !loadingEpisodes && episodes.length > 0 && (
                                        <div className="detail__episode-dropdown">
                                            {episodes.map((ep) => (
                                                <div
                                                    key={ep.id}
                                                    className={`detail__episode-item ${selectedEpisode === ep.episode_number ? 'detail__episode-item--active' : ''}`}
                                                    onClick={() => { setSelectedEpisode(ep.episode_number); setIsEpisodeMenuOpen(false); }}
                                                >
                                                    <div className="detail__episode-thumb">
                                                        {ep.still_path ? (
                                                            <img src={`${ENDPOINTS.IMAGE_BASE_URL_W500}${ep.still_path}`} alt={`Ep ${ep.episode_number}`} />
                                                        ) : (
                                                            <div className="detail__episode-no-img"><Film size={20} /></div>
                                                        )}
                                                    </div>
                                                    <div className="detail__episode-info">
                                                        <div className="detail__episode-name">
                                                            {ep.episode_number}. {ep.name}
                                                        </div>
                                                        <div className="detail__episode-meta">
                                                            <span>{ep.air_date ? new Date(ep.air_date).toLocaleDateString() : 'N/A'}</span>
                                                            <span className="detail__episode-meta-dot" />
                                                            <span>{ep.runtime ? `${ep.runtime}m` : 'N/A'}</span>
                                                            {ep.vote_average > 0 && (
                                                                <>
                                                                    <span className="detail__episode-meta-dot" />
                                                                    <span className="detail__episode-rating">
                                                                        <Star size={11} fill="currentColor" /> {ep.vote_average.toFixed(1)}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════════ 2. CONTENT SECTION ═══════════ */}
            <section className="detail__content">
                <div className="detail__content-inner">
                    {/* ── Two-Column Layout ── */}
                    <div className="detail__grid">
                        {/* Left: Poster Sidebar (Desktop) */}
                        <aside className="detail__sidebar">
                            {item.poster_path && (
                                <div className="detail__poster-card">
                                    <img
                                        src={`${ENDPOINTS.IMAGE_BASE_URL_W500}${item.poster_path}`}
                                        alt={title}
                                    />
                                    <div className="detail__poster-glow" />
                                </div>
                            )}
                        </aside>

                        {/* Right: Synopsis + Cast */}
                        <div className="detail__main">
                            <h3 className="detail__section-title">Synopsis</h3>
                            <p className="detail__synopsis">{item.overview}</p>

                            {/* Metadata Pills */}
                            <div className="detail__info-grid">
                                {!isTV && director && (
                                    <div className="detail__info-item">
                                        <span className="detail__info-label">Director</span>
                                        <span className="detail__info-value">{director.name}</span>
                                    </div>
                                )}
                                {isTV && item.created_by?.length > 0 && (
                                    <div className="detail__info-item">
                                        <span className="detail__info-label">Creator</span>
                                        <span className="detail__info-value">{item.created_by.map(c => c.name).join(', ')}</span>
                                    </div>
                                )}
                                {isTV && item.networks?.length > 0 && (
                                    <div className="detail__info-item">
                                        <span className="detail__info-label">Network</span>
                                        <span className="detail__info-value">{item.networks.map(n => n.name).join(', ')}</span>
                                    </div>
                                )}
                                {!isTV && item.production_companies?.length > 0 && (
                                    <div className="detail__info-item">
                                        <span className="detail__info-label">Studio</span>
                                        <span className="detail__info-value">{item.production_companies.slice(0, 2).map(c => c.name).join(', ')}</span>
                                    </div>
                                )}
                                {item.spoken_languages?.length > 0 && (
                                    <div className="detail__info-item">
                                        <span className="detail__info-label">Language</span>
                                        <span className="detail__info-value">
                                            <Globe size={13} /> {item.spoken_languages[0]?.english_name || 'English'}
                                        </span>
                                    </div>
                                )}
                                {item.status && (
                                    <div className="detail__info-item">
                                        <span className="detail__info-label">Status</span>
                                        <span className="detail__info-value">{item.status}</span>
                                    </div>
                                )}
                                {item.budget > 0 && (
                                    <div className="detail__info-item">
                                        <span className="detail__info-label">Budget</span>
                                        <span className="detail__info-value">${(item.budget / 1_000_000).toFixed(0)}M</span>
                                    </div>
                                )}
                                {item.revenue > 0 && (
                                    <div className="detail__info-item">
                                        <span className="detail__info-label">Revenue</span>
                                        <span className="detail__info-value">${(item.revenue / 1_000_000).toFixed(0)}M</span>
                                    </div>
                                )}
                            </div>

                            {/* Cast Toggle */}
                            <button
                                className="detail__cast-toggle"
                                onClick={() => setShowCast(!showCast)}
                            >
                                <Users size={18} />
                                {showCast ? 'Hide Cast & Crew' : 'View Full Cast & Crew'}
                                {showCast ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>

                            {/* Expandable Cast Section */}
                            <div className={`detail__cast-section ${showCast ? 'detail__cast-section--visible' : ''}`}>
                                {credits?.cast && credits.cast.length > 0 && (
                                    <>
                                        <h3 className="detail__section-title">Top Cast</h3>
                                        <div className="detail__cast-grid">
                                            {credits.cast.slice(0, 12).map(person => (
                                                <div key={person.id} className="detail__cast-card">
                                                    <div className="detail__cast-img">
                                                        {person.profile_path ? (
                                                            <img
                                                                src={`${ENDPOINTS.IMAGE_BASE_URL_W500}${person.profile_path}`}
                                                                alt={person.name}
                                                            />
                                                        ) : (
                                                            <div className="detail__cast-placeholder"><Users size={28} /></div>
                                                        )}
                                                    </div>
                                                    <div className="detail__cast-info">
                                                        <h4>{person.name}</h4>
                                                        <p>{person.character}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {credits?.crew && credits.crew.length > 0 && (
                                    <>
                                        <h3 className="detail__section-title detail__section-title--crew">Behind the Scenes</h3>
                                        <div className="detail__crew-grid">
                                            {credits.crew.slice(0, 8).map(person => (
                                                <div key={person.credit_id} className="detail__crew-card">
                                                    <span className="detail__crew-name">{person.name}</span>
                                                    <span className="detail__crew-job">{person.job}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── More Like This ── */}
                    {similar.length > 0 && (
                        <div className="detail__similar-row-override">
                            <Row title="More Like This" items={similar} />
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default MovieDetails;
