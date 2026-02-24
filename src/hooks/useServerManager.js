import { useState, useEffect, useCallback } from 'react';

const SERVERS = [
    { id: 'vidsrc', name: 'VidSrc', priority: 1 },
    { id: 'vidlink', name: 'VidLink', priority: 2 },
    { id: 'superembed', name: 'SuperEmbed', priority: 3 },
];

/**
 * Custom hook to manage video player servers.
 * Handles persistence, selection, and auto-switching logic.
 */
export const useServerManager = (initialServer = 'vidsrc') => {
    // 1. Initialize state from localStorage or default
    const [currentServer, setCurrentServer] = useState(() => {
        try {
            const saved = localStorage.getItem('streamflix_server');
            return saved && SERVERS.some(s => s.id === saved) ? saved : initialServer;
        } catch (error) {
            return initialServer;
        }
    });

    const [isAutoSwitching, setIsAutoSwitching] = useState(false);

    // 2. Persist selection
    useEffect(() => {
        localStorage.setItem('streamflix_server', currentServer);
    }, [currentServer]);

    // 3. Manual Switch
    const switchServer = useCallback((serverId) => {
        if (SERVERS.some(s => s.id === serverId)) {
            setCurrentServer(serverId);
            setIsAutoSwitching(false); // Reset auto-switch flag on manual change
        }
    }, []);

    // 4. Auto-Switch to next server (Simulated Logic)
    const nextServer = useCallback(() => {
        setIsAutoSwitching(true);
        const currentIndex = SERVERS.findIndex(s => s.id === currentServer);
        const nextIndex = (currentIndex + 1) % SERVERS.length;
        setCurrentServer(SERVERS[nextIndex].id);
    }, [currentServer]);

    return {
        currentServer,
        serverList: SERVERS,
        switchServer,
        nextServer,
        isAutoSwitching
    };
};
