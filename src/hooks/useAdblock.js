import { useState, useEffect } from 'react';
import { detectAdBlock } from '../utils/adblockDetector';
import {
    getAdblockDetected,
    setAdblockDetected,
    getAdsWarningSeen
} from '../utils/adblockStorage';

/**
 * Hook to check Adblock status and control warning visibility.
 * Runs once on mount (client-side only).
 */
export const useAdblock = () => {
    const [loading, setLoading] = useState(true);
    const [adblockEnabled, setAdblockEnabled] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        let mounted = true;

        const checkStatus = async () => {
            setLoading(true);

            try {
                // 1. Check if we already have a cached result in session/storage
                // For this implementation, we re-check to be safe, but you could skip if recently checked.
                const isBlocked = await detectAdBlock();

                if (!mounted) return;

                setAdblockEnabled(isBlocked);
                setAdblockDetected(isBlocked); // Cache result

                // 2. Logic to determine if we should show the warning
                if (isBlocked) {
                    // Adblock is ENABLED -> User is safe from ads -> NO warning
                    setShowWarning(false);
                } else {
                    // Adblock is DISABLED -> User sees ads -> Check if we warned them already
                    const hasSeen = getAdsWarningSeen();
                    if (!hasSeen) {
                        setShowWarning(true);
                    } else {
                        setShowWarning(false);
                    }
                }

            } catch (error) {
                console.warn('Adblock check failed:', error);
                // Fail safe: assume no adblock, but don't show warning to avoid annoyance on error
                if (mounted) setShowWarning(false);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        checkStatus();

        return () => {
            mounted = false;
        };
    }, []);

    return {
        loading,
        adblockEnabled,
        showWarning,
        setShowWarning // Expose setter for manual dismissal
    };
};
