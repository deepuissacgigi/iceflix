import React, { useState, useEffect, useCallback } from 'react';
import { X, Minimize2, Maximize2, Settings, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useWatchProgress } from '../../hooks/useWatchProgress';
import { useNotification } from '../../context/NotificationContext';

import { getMoviePlayers, getTVPlayers } from '../../utils/players';
import { getMovieDetails, getTVDetails } from '../../services/tmdb';

import { useContinueWatching } from '../../hooks/useContinueWatching';

// Duration for CSS exit animation (ms) — must match SCSS transition duration
const EXIT_DURATION = 500;

const VideoPlayerModal = () => {
    const { playerState, closePlayer, minimizePlayer, maximizePlayer } = useApp();
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
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
                        zIndex: 100,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <div style={{
                            background: '#1a1a1a',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            padding: '32px',
                            maxWidth: '400px',
                            width: '90%',
                            textAlign: 'center',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <div style={{
                                background: 'rgba(255, 173, 31, 0.15)',
                                color: '#ffad1f',
                                padding: '12px',
                                borderRadius: '50%'
                            }}>
                                <Activity size={32} />
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '1.25rem', margin: 0 }}>Ad Warning</h3>
                            <p style={{ color: '#a0a0a0', fontSize: '0.95rem', lineHeight: 1.5, margin: 0 }}>
                                Ads may appear from streaming providers. We strongly recommend using a reputable <strong>adblocker</strong> for an uninterrupted experience.
                            </p>
                            <button
                                style={{
                                    marginTop: '8px',
                                    background: '#ffad1f',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 24px',
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    width: '100%',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
