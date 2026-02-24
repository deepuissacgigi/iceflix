import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('history');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('history', JSON.stringify(history));
    }, [history]);

    const addToHistory = (movie) => {
        setHistory((prev) => {
            const filtered = prev.filter((item) => item.id !== movie.id);
            return [movie, ...filtered];
        });
    };

    // --- Global Video Player State ---
    const [playerState, setPlayerState] = useState({
        isOpen: false,
        isMinimized: false,
        id: null,
        type: 'movie',
        season: null,
        episode: null
    });

    const playMovie = (id, title, backdrop) => {
        setPlayerState({ isOpen: true, isMinimized: false, id, type: 'movie', season: null, episode: null, title, backdrop });
    };

    const playTV = (id, season, episode, title, backdrop) => {
        setPlayerState({ isOpen: true, isMinimized: false, id, type: 'tv', season, episode, title, backdrop });
    };

    const closePlayer = () => {
        setPlayerState((prev) => ({ ...prev, isOpen: false }));
    };

    const minimizePlayer = () => {
        setPlayerState((prev) => ({ ...prev, isMinimized: true }));
    };

    const maximizePlayer = () => {
        setPlayerState((prev) => ({ ...prev, isMinimized: false }));
    };

    return (
        <AppContext.Provider
            value={{
                history,
                addToHistory,
                playerState,
                playMovie,
                playTV,
                closePlayer,
                minimizePlayer,
                maximizePlayer,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
