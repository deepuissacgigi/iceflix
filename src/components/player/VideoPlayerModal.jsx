import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Minimize2, Maximize2, Settings, Activity, SkipForward, Play } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useWatchProgress } from '../../hooks/useWatchProgress';
import { useNotification } from '../../context/NotificationContext';

import { getMoviePlayers, getTVPlayers } from '../../utils/players';
import { getMovieDetails, getTVDetails, getSeasonDetails } from '../../services/tmdb';

import { useContinueWatching } from '../../hooks/useContinueWatching';

// Duration for CSS exit animation (ms) — must match SCSS transition duration
const EXIT_DURATION = 500;
// Countdown seconds for next-episode prompt
const NEXT_EP_COUNTDOWN = 10;

const VideoPlayerModal = () => {
    const { playerState, closePlayer, minimizePlayer, maximizePlayer, playTV } = useApp();
    const { isOpen, isMinimized, id, type, season, episode, title, backdrop } = playerState;

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
    // shouldRender keeps the DOM alive during exit animation
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // OPEN: mount DOM → wait 1 frame → trigger CSS enter
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

    // CLOSE: trigger CSS exit → wait for animation → unmount DOM
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

    // Fetch Duration for Progress Tracking
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

    // Track Progress
    useWatchProgress(isOpen, {
        id,
        title,
        backdrop,
        mediaType: type,
        season,
        episode,
        duration,
    }, saveProgress);

    // Player State — remember last used server
    const [currentServer, setCurrentServer] = useState(() => {
        const saved = localStorage.getItem('preferredServer');
        return saved ? parseInt(saved, 10) : 0;
    });

    const switchServer = useCallback((index) => {
        setCurrentServer(index);
        localStorage.setItem('preferredServer', index.toString());
    }, []);

    // Get Players based on Type
    const players = type === 'tv'
        ? getTVPlayers(id, season, episode)
        : getMoviePlayers(id);

    const current = players[currentServer];

    const [showSettings, setShowSettings] = useState(false);
    const [showAdAlert, setShowAdAlert] = useState(false);

    // Show ad warning alert once per session
    useEffect(() => {
        if (isOpen && id) {
            const dismissed = sessionStorage.getItem('adWarningDismissed');
            if (!dismissed) {
                setShowAdAlert(true);
            }
        }
    }, [isOpen, id]);

    // Reset on open and Trigger Activity Notification
    useEffect(() => {
        if (isOpen && id) {
            // Restore last used server from localStorage
            const saved = localStorage.getItem('preferredServer');
            setCurrentServer(saved ? parseInt(saved, 10) : 0);

            // Direct save to Continue Watching via unified hook
            saveProgress({
                id,
                title: title || '',
                backdrop: backdrop || '',
                poster: '',
                mediaType: type || 'movie',
                season,
                episode,
            }, 1, duration || 0);

            // Record Activity Notification (with a quick dedupe using sessionStorage)
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

                // Prevent spamming the exact same notification if the user minimizes/maximizes rapidly
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

    const [nextEpisodeInfo, setNextEpisodeInfo] = useState(null); // { season, episode, name }
    const [showNextPrompt, setShowNextPrompt] = useState(false);
    const [countdown, setCountdown] = useState(NEXT_EP_COUNTDOWN);
    const [autoPlayEnabled, setAutoPlayEnabled] = useState(() => {
        const saved = localStorage.getItem('autoPlayNextEpisode');
        return saved !== null ? saved === 'true' : true; // default ON
    });
    const countdownRef = useRef(null);
    const watchTimerRef = useRef(null);
    const nextEpFetchedRef = useRef(null); // track what we've fetched for

    // Persist auto-play preference
    const toggleAutoPlay = useCallback(() => {
        setAutoPlayEnabled(prev => {
            const newVal = !prev;
            localStorage.setItem('autoPlayNextEpisode', String(newVal));
            return newVal;
        });
    }, []);

    // Fetch next episode info when a TV episode opens
    useEffect(() => {
        if (!isOpen || type !== 'tv' || !id || !season || !episode) {
            setNextEpisodeInfo(null);
            setShowNextPrompt(false);
            return;
        }

        const fetchKey = `${id}_${season}_${episode}`;
        if (nextEpFetchedRef.current === fetchKey) return; // already fetched
        nextEpFetchedRef.current = fetchKey;

        const fetchNextEpisode = async () => {
            try {
                // Fetch current season details
                const seasonData = await getSeasonDetails(id, season);
                const totalEpisodesInSeason = seasonData.episodes?.length || 0;

                if (episode < totalEpisodesInSeason) {
                    // Next episode in the same season
                    const nextEp = seasonData.episodes?.find(ep => ep.episode_number === episode + 1);
                    setNextEpisodeInfo({
                        season: season,
                        episode: episode + 1,
                        name: nextEp?.name || `Episode ${episode + 1}`,
                    });
                } else {
                    // Check if there's a next season
                    const tvData = await getTVDetails(id);
                    const allSeasons = tvData.seasons?.filter(s => s.season_number > 0) || [];
                    const currentSeasonIdx = allSeasons.findIndex(s => s.season_number === season);

                    if (currentSeasonIdx >= 0 && currentSeasonIdx < allSeasons.length - 1) {
                        const nextSeason = allSeasons[currentSeasonIdx + 1];
                        // Fetch first episode of the next season
                        const nextSeasonData = await getSeasonDetails(id, nextSeason.season_number);
                        const firstEp = nextSeasonData.episodes?.[0];
                        setNextEpisodeInfo({
                            season: nextSeason.season_number,
                            episode: 1,
                            name: firstEp?.name || `S${nextSeason.season_number} E1`,
                        });
                    } else {
                        // This is the last episode of the last season
                        setNextEpisodeInfo(null);
                    }
                }
            } catch (e) {
                console.error('Failed to fetch next episode info:', e);
                setNextEpisodeInfo(null);
            }
        };

        fetchNextEpisode();
    }, [isOpen, type, id, season, episode]);

    // Reset next-episode prompt state when episode changes
    useEffect(() => {
        setShowNextPrompt(false);
        setCountdown(NEXT_EP_COUNTDOWN);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
    }, [id, season, episode]);

    // Start the watch timer — show "Next Episode" prompt after a threshold
    useEffect(() => {
        if (!isOpen || type !== 'tv' || !nextEpisodeInfo || !autoPlayEnabled || isMinimized) return;

        // Calculate threshold: 85% of estimated duration or minimum 20 minutes, max 50 minutes
        const thresholdMs = duration > 0
            ? Math.min(Math.max(duration * 0.85 * 1000, 20 * 60 * 1000), 50 * 60 * 1000)
            : 25 * 60 * 1000; // default 25 min if no duration known

        watchTimerRef.current = setTimeout(() => {
            setShowNextPrompt(true);
        }, thresholdMs);

        return () => {
            if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
        };
    }, [isOpen, type, nextEpisodeInfo, autoPlayEnabled, duration, isMinimized, id, season, episode]);

    // Countdown timer when the prompt is visible
    useEffect(() => {
        if (!showNextPrompt) return;

        setCountdown(NEXT_EP_COUNTDOWN);
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    // Auto-play next episode
                    handlePlayNext();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [showNextPrompt]);

    // Play next episode
    const handlePlayNext = useCallback(() => {
        if (!nextEpisodeInfo) return;
        setShowNextPrompt(false);
        setCountdown(NEXT_EP_COUNTDOWN);
        if (countdownRef.current) clearInterval(countdownRef.current);
        if (watchTimerRef.current) clearTimeout(watchTimerRef.current);
        nextEpFetchedRef.current = null; // reset so it fetches the NEXT next episode

        playTV(id, nextEpisodeInfo.season, nextEpisodeInfo.episode, title, backdrop);
    }, [nextEpisodeInfo, id, title, backdrop, playTV]);

    // Cancel next episode prompt
    const handleCancelNext = useCallback(() => {
        setShowNextPrompt(false);
        setCountdown(NEXT_EP_COUNTDOWN);
        if (countdownRef.current) clearInterval(countdownRef.current);
    }, []);

    // Graceful close handler — triggers animation before actual close
    const handleClose = useCallback((e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        closePlayer();
    }, [closePlayer]);

    // Don't render at all if not needed
    if (!shouldRender || !id) return null;

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

                {/* In-Player Alert Box */}
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

                {/* ═══ Next Episode Overlay ═══ */}
                {showNextPrompt && nextEpisodeInfo && !isMinimized && (
                    <div className="next-episode-overlay">
                        <div className="next-episode-overlay__content">
                            <div className="next-episode-overlay__countdown-ring">
                                <svg viewBox="0 0 40 40" className="next-episode-overlay__svg">
                                    <circle cx="20" cy="20" r="18" className="next-episode-overlay__track" />
                                    <circle
                                        cx="20" cy="20" r="18"
                                        className="next-episode-overlay__progress"
                                        style={{
                                            strokeDasharray: `${2 * Math.PI * 18}`,
                                            strokeDashoffset: `${2 * Math.PI * 18 * (1 - countdown / NEXT_EP_COUNTDOWN)}`,
                                        }}
                                    />
                                </svg>
                                <span className="next-episode-overlay__seconds">{countdown}</span>
                            </div>
                            <div className="next-episode-overlay__info">
                                <span className="next-episode-overlay__label">Next Episode</span>
                                <span className="next-episode-overlay__episode-name">
                                    S{nextEpisodeInfo.season} E{nextEpisodeInfo.episode} · {nextEpisodeInfo.name}
                                </span>
                            </div>
                        </div>
                        <div className="next-episode-overlay__actions">
                            <button
                                className="next-episode-overlay__play-btn"
                                onClick={(e) => { e.stopPropagation(); handlePlayNext(); }}
                            >
                                <Play size={14} fill="currentColor" />
                                Play Now
                            </button>
                            <button
                                className="next-episode-overlay__cancel-btn"
                                onClick={(e) => { e.stopPropagation(); handleCancelNext(); }}
                            >
                                Cancel
                            </button>
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

                        {/* Next Episode Button (manual trigger for TV only) */}
                        {type === 'tv' && nextEpisodeInfo && !showNextPrompt && (
                            <button
                                className="control-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePlayNext();
                                }}
                                title={`Next: S${nextEpisodeInfo.season} E${nextEpisodeInfo.episode}`}
                            >
                                <SkipForward size={20} />
                            </button>
                        )}
                    </div>

                    {/* Right Controls */}
                    <div className="controls-right">
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
                                            <h4>Auto-Play</h4>
                                            <button
                                                className={`autoplay-toggle ${autoPlayEnabled ? 'active' : ''}`}
                                                onClick={toggleAutoPlay}
                                            >
                                                <span className="autoplay-toggle__track">
                                                    <span className="autoplay-toggle__thumb" />
                                                </span>
                                                <span>Next Episode</span>
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
