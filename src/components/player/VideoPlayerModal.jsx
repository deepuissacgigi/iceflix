import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Minimize2, Maximize2, Settings, Activity, SkipForward, Play, List, Flame, Tv, PartyPopper } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useWatchProgress } from '../../hooks/useWatchProgress';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

import { getMoviePlayers, getTVPlayers } from '../../utils/players';
import { getMovieDetails, getTVDetails, getSeasonDetails, getSimilarTVShows } from '../../services/tmdb';
import ENDPOINTS from '../../services/endpoints';

import { useContinueWatching } from '../../hooks/useContinueWatching';

// Duration for CSS exit animation (ms) — must match SCSS transition duration
const EXIT_DURATION = 500;
// Countdown seconds for next-episode prompt
const NEXT_EP_COUNTDOWN = 10;
const BINGE_COUNTDOWN = 3;
// Skip intro visibility duration — REMOVED (can't seek in iframe)

const VideoPlayerModal = () => {
    const { playerState, closePlayer, minimizePlayer, maximizePlayer, playTV } = useApp();
    const { isOpen, isMinimized, id, type, season, episode, title, backdrop } = playerState;
    const navigate = useNavigate();

    const { showControls, handleMouseMove } = usePlayerControls(
        isOpen,
        isMinimized,
        closePlayer,
        minimizePlayer,
        maximizePlayer
    );

    const { saveProgress } = useContinueWatching();
    const { addNotification } = useNotification();

    // ── Animation lifecycle ──
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            setShouldRender(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsVisible(true);
                });
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen && shouldRender) {
            setIsClosing(true);
            setIsVisible(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsClosing(false);
            }, EXIT_DURATION);
            return () => clearTimeout(timer);
        }
    }, [isOpen, shouldRender]);

    // ── Fetch Duration ──
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (isOpen && id) {
            const fetchDuration = async () => {
                try {
                    let data;
                    if (type === 'movie') {
                        data = await getMovieDetails(id);
                        if (data.runtime) setDuration(data.runtime * 60);
                    } else {
                        data = await getTVDetails(id);
                        const runtime = data.episode_run_time?.[0] || 45;
                        setDuration(runtime * 60);
                    }
                } catch (e) {
                    console.error("Failed to fetch duration", e);
                    setDuration(0);
                }
            };
            fetchDuration();
        } else {
            setDuration(0);
        }
    }, [isOpen, id, type]);

    // ── Track Progress ──
    useWatchProgress(isOpen, {
        id, title, backdrop,
        mediaType: type, season, episode, duration,
    }, saveProgress);

    // ── Server State ──
    const [currentServer, setCurrentServer] = useState(() => {
        const saved = localStorage.getItem('preferredServer');
        return saved ? parseInt(saved, 10) : 0;
    });

    const switchServer = useCallback((index) => {
        setCurrentServer(index);
        localStorage.setItem('preferredServer', index.toString());
    }, []);

    const players = type === 'tv'
        ? getTVPlayers(id, season, episode)
        : getMoviePlayers(id);

    const current = players[currentServer];

    const [showSettings, setShowSettings] = useState(false);
    const [showAdAlert, setShowAdAlert] = useState(false);

    useEffect(() => {
        if (isOpen && id) {
            const dismissed = sessionStorage.getItem('adWarningDismissed');
            if (!dismissed) setShowAdAlert(true);
        }
    }, [isOpen, id]);

    // ── Reset on open + Activity Notification ──
    useEffect(() => {
        if (isOpen && id) {
            const saved = localStorage.getItem('preferredServer');
            setCurrentServer(saved ? parseInt(saved, 10) : 0);

            saveProgress({
                id, title: title || '', backdrop: backdrop || '',
                poster: '', mediaType: type || 'movie', season, episode,
            }, 1, duration || 0);

            const videoKey = `notif_fired_${id}_${type}_${season || 0}_${episode || 0}`;
            if (!sessionStorage.getItem(videoKey)) {
                let msg = `Started watching ${title || 'a video'}`;
                if (type === 'tv' && season && episode) {
                    msg = `Watching S${season} E${episode} of ${title}`;
                }
                addNotification(msg, 'play', {
                    title: title || 'Now Playing',
                    thumbnail: backdrop ? `https://image.tmdb.org/t/p/w200${backdrop}` : null,
                });
                sessionStorage.setItem(videoKey, 'true');
            }
        }
    }, [isOpen, id, season, episode, title, type, backdrop, saveProgress, duration]);

    // Close settings on outside click
    useEffect(() => {
        if (!showSettings) return;
        const handleClickOutside = () => setShowSettings(false);
        const timer = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showSettings]);

    // ═══════════════════════════════════════════════
    // AUTO-PLAY NEXT EPISODE LOGIC (TV only)
    // ═══════════════════════════════════════════════

    // Next episode info now includes thumbnail, description, episodesLeft
    const [nextEpisodeInfo, setNextEpisodeInfo] = useState(null);
    const [showNextPrompt, setShowNextPrompt] = useState(false);
    const [countdown, setCountdown] = useState(NEXT_EP_COUNTDOWN);
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
        const saved = localStorage.getItem('autoPlayNextEpisode');
        return saved !== null ? saved === 'true' : true;
    });

    // ── Feature 3: Binge Mode ──
    const [bingeMode, setBingeMode] = useState(() => {
        const saved = localStorage.getItem('bingeMode');
        return saved === 'true';
    });

    const toggleBingeMode = useCallback(() => {
        setBingeMode(prev => {
            const newVal = !prev;
            localStorage.setItem('bingeMode', String(newVal));
            return newVal;
        });
    }, []);

    const countdownRef = useRef(null);
    const watchTimerRef = useRef(null);
    const nextEpFetchedRef = useRef(null);

    const toggleAutoPlay = useCallback(() => {
        setAutoPlayEnabled(prev => {
            const newVal = !prev;
            localStorage.setItem('autoPlayNextEpisode', String(newVal));
            return newVal;
        });
    }, []);

    // ── Feature 6: Series/Season Completion ──
    const [seriesComplete, setSeriesComplete] = useState(false);
    const [seasonJustFinished, setSeasonJustFinished] = useState(null); // season number
    const [nextSeasonNumber, setNextSeasonNumber] = useState(null);

    // ── Feature 9: Similar Shows ──
    const [similarShows, setSimilarShows] = useState([]);

    // ── Feature 4: Episode Drawer ──
    const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
    const [currentSeasonEpisodes, setCurrentSeasonEpisodes] = useState([]);


    // Fetch next episode info + season data when a TV episode opens
    useEffect(() => {
        if (!isOpen || type !== 'tv' || !id || !season || !episode) {
            setNextEpisodeInfo(null);
            setShowNextPrompt(false);
            setSeriesComplete(false);
            setSeasonJustFinished(null);
            setNextSeasonNumber(null);
            setSimilarShows([]);
            setCurrentSeasonEpisodes([]);
            return;
        }

        const fetchKey = `${id}_${season}_${episode}`;
        if (nextEpFetchedRef.current === fetchKey) return;
        nextEpFetchedRef.current = fetchKey;

        const fetchNextEpisode = async () => {
            try {
                const seasonData = await getSeasonDetails(id, season);
                const episodes = seasonData.episodes || [];
                const totalEpisodesInSeason = episodes.length;

                // Store current season episodes for the drawer
                setCurrentSeasonEpisodes(episodes);

                if (episode < totalEpisodesInSeason) {
                    // Next episode in same season
                    const nextEp = episodes.find(ep => ep.episode_number === episode + 1);
                    setNextEpisodeInfo({
                        season: season,
                        episode: episode + 1,
                        name: nextEp?.name || `Episode ${episode + 1}`,
                        still_path: nextEp?.still_path || null,
                        overview: nextEp?.overview || '',
                        episodesLeft: totalEpisodesInSeason - episode,
                    });
                    setSeriesComplete(false);
                    setSeasonJustFinished(null);
                } else {
                    // Last episode of this season — check next season
                    const tvData = await getTVDetails(id);
                    const allSeasons = tvData.seasons?.filter(s => s.season_number > 0) || [];
                    const currentSeasonIdx = allSeasons.findIndex(s => s.season_number === season);

                    if (currentSeasonIdx >= 0 && currentSeasonIdx < allSeasons.length - 1) {
                        const nextSeason = allSeasons[currentSeasonIdx + 1];
                        const nextSeasonData = await getSeasonDetails(id, nextSeason.season_number);
                        const firstEp = nextSeasonData.episodes?.[0];
                        setNextEpisodeInfo({
                            season: nextSeason.season_number,
                            episode: 1,
                            name: firstEp?.name || `S${nextSeason.season_number} E1`,
                            still_path: firstEp?.still_path || null,
                            overview: firstEp?.overview || '',
                            episodesLeft: 0,
                        });
                        setSeasonJustFinished(season);
                        setNextSeasonNumber(nextSeason.season_number);
                        setSeriesComplete(false);
                    } else {
                        // Truly the last episode of the entire series
                        setNextEpisodeInfo(null);
                        setSeriesComplete(true);
                        setSeasonJustFinished(season);
                        setNextSeasonNumber(null);

                        // Fetch similar shows
                        try {
                            const similar = await getSimilarTVShows(id);
                            setSimilarShows((similar || []).slice(0, 3));
                        } catch { setSimilarShows([]); }
                    }
                }
            } catch (e) {
                console.error('Failed to fetch next episode info:', e);
                setNextEpisodeInfo(null);
            }
        };

        fetchNextEpisode();
    }, [isOpen, type, id, season, episode]);

    // Reset states when episode changes
    useEffect(() => {
        setShowNextPrompt(false);
        setCountdown(bingeMode ? BINGE_COUNTDOWN : NEXT_EP_COUNTDOWN);
        setShowEpisodeDrawer(false);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
    }, [id, season, episode]);


    // Watch timer — show "Next Episode" prompt after threshold
    useEffect(() => {
        if (!isOpen || type !== 'tv' || !nextEpisodeInfo || !autoPlayEnabled || isMinimized) return;

        const thresholdMs = duration > 0
            ? Math.min(Math.max(duration * 0.85 * 1000, 20 * 60 * 1000), 50 * 60 * 1000)
            : 25 * 60 * 1000;

        watchTimerRef.current = setTimeout(() => {
            setShowNextPrompt(true);
        }, thresholdMs);

        return () => {
            if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
        };
    }, [isOpen, type, nextEpisodeInfo, autoPlayEnabled, duration, isMinimized, id, season, episode]);

    // Countdown timer when prompt is visible
    useEffect(() => {
        if (!showNextPrompt) return;

        const countdownTime = bingeMode ? BINGE_COUNTDOWN : NEXT_EP_COUNTDOWN;
        setCountdown(countdownTime);
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    handlePlayNext();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [showNextPrompt, bingeMode]);

    // Play next episode
    const handlePlayNext = useCallback(() => {
        if (!nextEpisodeInfo) return;
        setShowNextPrompt(false);
        setCountdown(bingeMode ? BINGE_COUNTDOWN : NEXT_EP_COUNTDOWN);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
        nextEpFetchedRef.current = null;
        playTV(id, nextEpisodeInfo.season, nextEpisodeInfo.episode, title, backdrop);
    }, [nextEpisodeInfo, id, title, backdrop, playTV, bingeMode]);

    // Cancel next episode prompt
    const handleCancelNext = useCallback(() => {
        setShowNextPrompt(false);
        setCountdown(bingeMode ? BINGE_COUNTDOWN : NEXT_EP_COUNTDOWN);
        if (countdownRef.current) clearInterval(countdownRef.current);
    }, [bingeMode]);

    // ── Feature 8: N key shortcut ──
    useEffect(() => {
        if (!isOpen || type !== 'tv') return;

        const handleNKey = (e) => {
            if (e.key === 'n' || e.key === 'N') {
                if (nextEpisodeInfo) {
                    e.preventDefault();
                    handlePlayNext();
                }
            }
        };

        window.addEventListener('keydown', handleNKey);
        return () => window.removeEventListener('keydown', handleNKey);
    }, [isOpen, type, nextEpisodeInfo, handlePlayNext]);

    // Play a specific episode from the drawer
    const handlePlayEpisode = useCallback((epNumber) => {
        setShowEpisodeDrawer(false);
        nextEpFetchedRef.current = null;
        playTV(id, season, epNumber, title, backdrop);
    }, [id, season, title, backdrop, playTV]);

    // Navigate to a recommended show
    const handleGoToShow = useCallback((showId) => {
        closePlayer();
        navigate(`/tv/${showId}`);
    }, [closePlayer, navigate]);


    // Graceful close handler
    const handleClose = useCallback((e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        closePlayer();
    }, [closePlayer]);

    // Don't render at all if not needed
    if (!shouldRender || !id) return null;

    const activeCountdown = bingeMode ? BINGE_COUNTDOWN : NEXT_EP_COUNTDOWN;

    return (
        <>
            {/* Backdrop Overlay */}
            {!isMinimized && (
                <div
                    className={`player-backdrop ${isVisible && !isClosing ? 'player-backdrop--visible' : ''}`}
                    onClick={handleClose}
                />
            )}

            {/* Modal */}
            <div
                className={`video-player-modal ${isMinimized ? 'variant-minimized' : 'variant-maximized'} ${isVisible && !isClosing ? 'video-player-modal--visible' : ''}`}
                onMouseMove={handleMouseMove}
                onClick={() => isMinimized && maximizePlayer()}
            >

                {/* Ad Warning */}
                {showAdAlert && !isMinimized && (
                    <div className="player-ad-warning">
                        <div className="player-ad-warning__card">
                            <div className="player-ad-warning__icon-wrapper">
                                <Activity className="player-ad-warning__icon" size={32} />
                            </div>
                            <h3 className="player-ad-warning__title">Ad Warning</h3>
                            <p className="player-ad-warning__text">
                                Ads may appear from streaming providers. We strongly recommend using a reputable <strong>adblocker</strong> for an uninterrupted experience.
                            </p>
                            <button
                                className="player-ad-warning__btn"
                                onClick={() => {
                                    setShowAdAlert(false);
                                    sessionStorage.setItem('adWarningDismissed', 'true');
                                }}
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                )}

                {/* Video Iframe */}
                <div className="video-container">
                    <iframe
                        key={currentServer}
                        src={current?.url || ''}
                        title="Video Player"
                        width="100%"
                        height="100%"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="origin"
                        className={isMinimized ? 'pointer-disabled' : ''}
                    />
                </div>


                {/* ═══ Next Episode Overlay (Enhanced) ═══ */}
                {showNextPrompt && nextEpisodeInfo && !isMinimized && (
                    <div className="next-episode-overlay">
                        {/* Feature 1: Episode Thumbnail */}
                        {nextEpisodeInfo.still_path && (
                            <div className="next-episode-overlay__thumbnail">
                                <img
                                    src={`${ENDPOINTS.IMAGE_BASE_URL_W300}${nextEpisodeInfo.still_path}`}
                                    alt=""
                                />
                            </div>
                        )}
                        <div className="next-episode-overlay__body">
                            <div className="next-episode-overlay__content">
                                <div className="next-episode-overlay__countdown-ring">
                                    <svg viewBox="0 0 40 40" className="next-episode-overlay__svg">
                                        <circle cx="20" cy="20" r="18" className="next-episode-overlay__track" />
                                        <circle
                                            cx="20" cy="20" r="18"
                                            className="next-episode-overlay__progress"
                                            style={{
                                                strokeDasharray: `${2 * Math.PI * 18}`,
                                                strokeDashoffset: `${2 * Math.PI * 18 * (1 - countdown / activeCountdown)}`,
                                            }}
                                        />
                                    </svg>
                                    <span className="next-episode-overlay__seconds">{countdown}</span>
                                </div>
                                <div className="next-episode-overlay__info">
                                    <span className="next-episode-overlay__label">
                                        {seasonJustFinished ? `Season ${seasonJustFinished} Complete 🎉` : 'Next Episode'}
                                    </span>
                                    <span className="next-episode-overlay__episode-name">
                                        S{nextEpisodeInfo.season} E{nextEpisodeInfo.episode} · {nextEpisodeInfo.name}
                                    </span>
                                    {/* Feature 7: Episode Progress Counter */}
                                    {nextEpisodeInfo.episodesLeft > 0 && !seasonJustFinished && (
                                        <span className="next-episode-overlay__episodes-left">
                                            {nextEpisodeInfo.episodesLeft} episode{nextEpisodeInfo.episodesLeft !== 1 ? 's' : ''} left in Season {nextEpisodeInfo.season}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {/* Feature 2: Episode Description */}
                            {nextEpisodeInfo.overview && (
                                <p className="next-episode-overlay__description">
                                    {nextEpisodeInfo.overview.length > 120
                                        ? nextEpisodeInfo.overview.substring(0, 120) + '…'
                                        : nextEpisodeInfo.overview}
                                </p>
                            )}
                            <div className="next-episode-overlay__actions">
                                <button
                                    className="next-episode-overlay__play-btn"
                                    onClick={(e) => { e.stopPropagation(); handlePlayNext(); }}
                                >
                                    <Play size={14} fill="currentColor" />
                                    {seasonJustFinished ? `Start Season ${nextSeasonNumber}` : 'Play Now'}
                                </button>
                                <button
                                    className="next-episode-overlay__cancel-btn"
                                    onClick={(e) => { e.stopPropagation(); handleCancelNext(); }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ Feature 6 + 9: Series Complete Card ═══ */}
                {seriesComplete && !nextEpisodeInfo && !isMinimized && showNextPrompt && (
                    <div className="series-complete-card">
                        <div className="series-complete-card__header">
                            <PartyPopper size={28} />
                            <h3>Series Complete!</h3>
                        </div>
                        <p className="series-complete-card__text">
                            You've finished all {seasonJustFinished} season{seasonJustFinished !== 1 ? 's' : ''} of <strong>{title}</strong>. Great binge! 🎬
                        </p>
                        {/* Feature 9: Recommendations */}
                        {similarShows.length > 0 && (
                            <div className="series-complete-card__recs">
                                <span className="series-complete-card__recs-label">You might also like</span>
                                <div className="series-complete-card__recs-list">
                                    {similarShows.map(show => (
                                        <button
                                            key={show.id}
                                            className="series-complete-card__rec-item"
                                            onClick={(e) => { e.stopPropagation(); handleGoToShow(show.id); }}
                                        >
                                            {show.poster_path ? (
                                                <img
                                                    src={`${ENDPOINTS.IMAGE_BASE_URL_W300}${show.poster_path}`}
                                                    alt={show.name}
                                                />
                                            ) : (
                                                <div className="series-complete-card__rec-placeholder">
                                                    <Tv size={20} />
                                                </div>
                                            )}
                                            <span>{show.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button
                            className="series-complete-card__close-btn"
                            onClick={(e) => { e.stopPropagation(); handleClose(e); }}
                        >
                            Close Player
                        </button>
                    </div>
                )}

                {/* ═══ Feature 4: Episode Drawer ═══ */}
                {showEpisodeDrawer && type === 'tv' && !isMinimized && (
                    <div className="episode-drawer" onClick={(e) => e.stopPropagation()}>
                        <div className="episode-drawer__header">
                            <h4>Season {season}</h4>
                            <button onClick={() => setShowEpisodeDrawer(false)} className="episode-drawer__close">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="episode-drawer__list">
                            {currentSeasonEpisodes.map(ep => (
                                <button
                                    key={ep.episode_number}
                                    className={`episode-drawer__item ${ep.episode_number === episode ? 'active' : ''}`}
                                    onClick={() => handlePlayEpisode(ep.episode_number)}
                                >
                                    <span className="episode-drawer__item-number">
                                        {ep.episode_number}
                                    </span>
                                    <div className="episode-drawer__item-info">
                                        <span className="episode-drawer__item-name">{ep.name || `Episode ${ep.episode_number}`}</span>
                                        {ep.runtime && (
                                            <span className="episode-drawer__item-runtime">{ep.runtime}m</span>
                                        )}
                                    </div>
                                    {ep.episode_number === episode && (
                                        <span className="episode-drawer__item-playing">Now Playing</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Controls Overlay */}
                <div className={`player-controls ${showControls ? 'visible' : 'hidden'}`}>
                    {/* Left Controls */}
                    <div className="controls-left">
                        <button
                            className="control-btn"
                            onClick={(e) => {
                                if (e && e.preventDefault) e.preventDefault();
                                if (e && e.stopPropagation) e.stopPropagation();
                                closePlayer();
                            }}
                            title="Close Player"
                        >
                            <X size={20} />
                        </button>

                        {/* Server Indicator */}
                        <div className="server-status">
                            <Activity size={16} color="#4dff88" />
                            <span className="server-name">{current?.name}</span>
                        </div>

                        {/* Feature 3: Binge Mode Indicator */}
                        {type === 'tv' && bingeMode && (
                            <div className="binge-indicator" title="Binge Mode Active">
                                <Flame size={16} />
                            </div>
                        )}

                        {/* Next Episode Button */}
                        {type === 'tv' && nextEpisodeInfo && !showNextPrompt && (
                            <button
                                className="control-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlayNext();
                                }}
                                title={`Next: S${nextEpisodeInfo.season} E${nextEpisodeInfo.episode} (N)`}
                            >
                                <SkipForward size={20} />
                            </button>
                        )}

                        {/* Feature 4: Episode List Button */}
                        {type === 'tv' && currentSeasonEpisodes.length > 0 && (
                            <button
                                className="control-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowEpisodeDrawer(prev => !prev);
                                }}
                                title="Episode List"
                            >
                                <List size={20} />
                            </button>
                        )}
                    </div>

                    {/* Right Controls */}
                    <div className="controls-right">
                        {/* Episode info badge (TV only) */}
                        {type === 'tv' && season && episode && (
                            <div className="episode-badge">
                                S{season} · E{episode}
                            </div>
                        )}

                        {/* Settings Toggle */}
                        <div className="settings-wrapper">
                            <button
                                className={`control-btn ${showSettings ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                            >
                                <Settings size={20} />
                            </button>

                            {/* Settings Menu */}
                            {showSettings && (
                                <div
                                    className="settings-menu settings-menu--visible"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="menu-section">
                                        <h4>Server</h4>
                                        <div className="server-list">
                                            {players.map((p, i) => (
                                                <button
                                                    key={i}
                                                    className={`server-btn ${i === currentServer ? 'active' : ''}`}
                                                    onClick={() => switchServer(i)}
                                                >
                                                    {p.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Auto-Play Toggle (TV only) */}
                                    {type === 'tv' && (
                                        <div className="menu-section">
                                            <h4>Playback</h4>
                                            <button
                                                className={`autoplay-toggle ${autoPlayEnabled ? 'active' : ''}`}
                                                onClick={toggleAutoPlay}
                                            >
                                                <span className="autoplay-toggle__track">
                                                    <span className="autoplay-toggle__thumb" />
                                                </span>
                                                <span>Auto-Play Next</span>
                                            </button>
                                            {/* Feature 3: Binge Mode Toggle */}
                                            <button
                                                className={`autoplay-toggle ${bingeMode ? 'active' : ''}`}
                                                onClick={toggleBingeMode}
                                            >
                                                <span className="autoplay-toggle__track">
                                                    <span className="autoplay-toggle__thumb" />
                                                </span>
                                                <span><Flame size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />Binge Mode</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            className="control-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                isMinimized ? maximizePlayer() : minimizePlayer();
                            }}
                            title={isMinimized ? "Maximize" : "Minimize"}
                        >
                            {isMinimized ? <Maximize2 size={20} /> : <Minimize2 size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VideoPlayerModal;
