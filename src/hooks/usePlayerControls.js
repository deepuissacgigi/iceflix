import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to manage player controls visibility and keyboard shortcuts.
 */
export const usePlayerControls = (isOpen, isMinimized, onClose, onMinimize, onMaximize) => {
    const [showControls, setShowControls] = useState(false);
    const controlsTimeout = useRef(null);

    const clearControlsTimeout = () => {
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
            controlsTimeout.current = null;
        }
    };

    // 1. Keyboard Shortcuts
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
            if (e.key === 'm' || e.key === 'M') {
                e.preventDefault();
                isMinimized ? onMaximize() : onMinimize();
            }
            if (e.code === 'Space') {
                // Ideally, we'd toggle play/pause here, but cannot control iframe directly.
                // We'll leave it as a TODO or implement a custom overlay play/pause logic.
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isMinimized, onClose, onMinimize, onMaximize]);

    // 2. Mouse Visibility Logic
    const handleMouseEnter = useCallback(() => {
        setShowControls(true);
        clearControlsTimeout();
    }, []);

    const handleMouseLeave = useCallback(() => {
        // If maximized, controls shouldn't instantly vanish when mouse leaves window bounds
        if (isMinimized) {
            setShowControls(false);
            clearControlsTimeout();
        }
    }, [isMinimized]);

    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        clearControlsTimeout();

        // Only set the auto-hide timeout if the player is maximized (fullscreen)
        if (!isMinimized) {
            controlsTimeout.current = setTimeout(() => {
                setShowControls(false);
            }, 3000); // Hide after 3 seconds of inactivity
        } else {
            // If windowed, moving mouse inside should always show controls 
            // without a timeout forcing them to hide.
            setShowControls(true);
        }
    }, [isMinimized]);

    // Clean up timeout on unmount or when modal closes
    useEffect(() => {
        if (!isOpen) {
            clearControlsTimeout();
        }
        return clearControlsTimeout;
    }, [isOpen]);

    return {
        showControls,
        handleMouseMove,
        handleMouseEnter,
        handleMouseLeave
    };
};
