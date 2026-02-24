import { useState, useEffect } from 'react';
import { detectAdBlock } from '../utils/adblockDetector';
import { getAdsWarningSeen, setAdsWarningSeen } from '../utils/adblockStorage';

/**
 * Hook to check for adblock presence and determine if warning is needed.
 * Runs once on mount.
 */
export const useAdblockCheck = () => {
    const [adblockEnabled, setAdblockEnabled] = useState(false);
    const [shouldShowWarning, setShouldShowWarning] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const check = async () => {
            setLoading(true);

            try {
                const isBlocked = await detectAdBlock();
                const warningSeen = getAdsWarningSeen();

                setAdblockEnabled(isBlocked);

                // Logic:
                // 1. If Adblock is ON -> NO warning (user is safe).
                // 2. If Adblock is OFF -> Check if they've seen the warning before.
                // 3. If Adblock is OFF AND NOT SEEN -> SHOW warning.
                if (isBlocked) {
                    setShouldShowWarning(false);
                } else {
                    setShouldShowWarning(!warningSeen);
                }
            } catch (err) {
                console.error('Adblock check failed', err);
                // Fallback: If check fails, don't block user
                setShouldShowWarning(false);
            } finally {
                setLoading(false);
            }
        };

        check();
    }, []);

    return {
        loading,
        adblockEnabled,
        shouldShowWarning,
        setShouldShowWarning // Allow manual dismissal
    };
};
