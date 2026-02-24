import { useEffect } from 'react';

/**
 * Lightweight page title hook — sets document.title on mount and restores on unmount.
 * @param {string} title - Page title (will be suffixed with " | ICEFLIX")
 */
const useDocTitle = (title) => {
    useEffect(() => {
        const prev = document.title;
        document.title = title ? `${title} | ICEFLIX` : 'ICEFLIX';
        return () => { document.title = prev; };
    }, [title]);
};

export default useDocTitle;
