import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to manage player controls visibility and keyboard shortcuts.
 * 
 * Controls behavior:
 * - Show controls immediately on ANY mouse movement or keyboard press
 * - Auto-hide after 20 seconds of complete inactivity
 * - Always apply the same logic regardless of minimized/maximized state
 */
export const usePlayerControls = (isOpen, isMinimized, onClose, onMinimize, onMaximize) => {
    const [showControls, setShowControls] = useState(true);
    const controlsTimeout = useRef(null);

    const clearControlsTimeout = () => {
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
            controlsTimeout.current = null;
        }
    };

    // Start the auto-hide countdown (20 seconds)
    const startAutoHide = useCallback(() => {
        clearControlsTimeout();
        controlsTimeout.current = setTimeout(() => {
            setShowControls(false);
        }, 20000); // 20 seconds
    }, []);

    // Show controls and restart the hide timer
    const revealControls = useCallback(() => {
        setShowControls(true);
        startAutoHide();
    }, [startAutoHide]);

    // 1. Keyboard Shortcuts + Activity Detection
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            // Always reveal controls on any key press
            revealControls();

            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
            if (e.key === 'm' || e.key === 'M') {
                e.preventDefault();
                isMinimized ? onMaximize() : onMinimize();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isMinimized, onClose, onMinimize, onMaximize, revealControls]);

    // 2. Mouse Move Handler
    const handleMouseMove = useCallback(() => {
        revealControls();
    }, [revealControls]);

    // 3. Start auto-hide on mount when player is open
    useEffect(() => {
        if (isOpen) {
            setShowControls(true);
            startAutoHide();
        }
    }, [isOpen, startAutoHide]);

    // Clean up timeout on unmount or when modal closes
    useEffect(() => {
        if (!isOpen) {
            clearControlsTimeout();
            setShowControls(true); // Reset for next open
        }
        return clearControlsTimeout;
    }, [isOpen]);

    return {
        showControls,
        handleMouseMove
    };
};
