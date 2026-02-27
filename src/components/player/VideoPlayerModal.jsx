import React, { useState, useEffect, useCallback } from 'react';
import { X, Minimize2, Maximize2, ShieldCheck, ShieldAlert, Settings, Activity } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { usePlayerControls } from '../../hooks/usePlayerControls';
import { useWatchProgress } from '../../hooks/useWatchProgress';
import { Spinner } from '../loaders/Loaders';

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

    // Player State
    const [currentServer, setCurrentServer] = useState(0);
    const [loading, setLoading] = useState(true);

    // Get Players based on Type
    const players = type === 'tv'
        ? getTVPlayers(id, season, episode)
        : getMoviePlayers(id);

    const current = players[currentServer];

    const [showSettings, setShowSettings] = useState(false);

    // Reset on open
    useEffect(() => {
        if (isOpen && id) {
            setLoading(true);
            setCurrentServer(0);

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
        }
    }, [isOpen, id, season, episode, title, type, backdrop, saveProgress, duration]);

    // Force loading spinner timeout
    useEffect(() => {
        let timer;
        if (loading) {
            timer = setTimeout(() => setLoading(false), 5000);
        }
        return () => clearTimeout(timer);
    }, [loading]);

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


                {/* Loading Spinner */}
                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner-container">
                            <Spinner size={isMinimized ? "sm" : "lg"} loading={loading} />
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
                        onLoad={() => setLoading(false)}
                        className={isMinimized ? 'pointer-disabled' : ''}
                    />
                </div>

                {/* Controls Overlay */}
                <div className={`player-controls ${showControls && !loading ? 'visible' : 'hidden'}`}>
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
                                                    onClick={() => setCurrentServer(i)}
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
