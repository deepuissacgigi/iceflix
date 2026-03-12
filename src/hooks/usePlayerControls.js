import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook to manage player controls visibility and keyboard shortcuts.
 * 
 * Controls behavior:
 * - Show controls immediately on ANY mouse movement or keyboard press
 * - Auto-hide after 15 seconds of complete inactivity
 * - Uses window-level event listeners so mouse movement is detected even
 *   when the cursor is over the iframe (which normally swallows events)
 */
const HIDE_DELAY = 15000; // 15 seconds

export const usePlayerControls = (isOpen, isMinimized, onClose, onMinimize, onMaximize) => {
    const [showControls, setShowControls] = useState(true);
    const controlsTimeout = useRef(null);

    const clearControlsTimeout = () => {
        if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
            controlsTimeout.current = null;
        }
    };

    // Start the auto-hide countdown
    const startAutoHide = useCallback(() => {
        clearControlsTimeout();
        controlsTimeout.current = setTimeout(() => {
            setShowControls(false);
        }, HIDE_DELAY);
    }, []);

    // Show controls and restart the hide timer
    const revealControls = useCallback(() => {
        setShowControls(true);
        startAutoHide();
    }, [startAutoHide]);

    // 1. Global mouse movement detection — works even when cursor is over the iframe
    //    because we detect when the mouse re-enters the modal area or moves anywhere
    useEffect(() => {
        if (!isOpen) return;

        let lastX = 0;
        let lastY = 0;

        const handleGlobalMouseMove = (e) => {
            // Only trigger if the mouse actually moved (avoid phantom events)
            if (Math.abs(e.clientX - lastX) > 2 || Math.abs(e.clientY - lastY) > 2) {
                lastX = e.clientX;
                lastY = e.clientY;
                revealControls();
            }
        };

        // Also detect when mouse leaves/enters the iframe (blur/focus trick)
        // When the iframe steals focus, we still want to show controls briefly
        const handleWindowBlur = () => {
            // iframe got focus — user clicked inside the video
            // Show controls briefly then start the hide timer
            revealControls();
        };

        window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
        window.addEventListener('blur', handleWindowBlur);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [isOpen, revealControls]);

    // 2. Keyboard Shortcuts + Activity Detection
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

    // 3. Direct mouse move handler (still passed to the modal for non-iframe areas)
    const handleMouseMove = useCallback(() => {
        revealControls();
    }, [revealControls]);

    // 4. Start auto-hide on mount when player is open
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
