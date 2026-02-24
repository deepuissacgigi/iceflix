import { useState, useEffect, useRef } from 'react';

/**
 * IntersectionObserver hook — returns [ref, isInView].
 * Once visible, stays visible (no re-hiding). Perfect for lazy loading.
 * @param {Object} options - IntersectionObserver options
 * @param {string} options.rootMargin - How far before the element reaches the viewport to trigger (default: '200px')
 * @param {number} options.threshold - Visibility percentage to trigger (default: 0)
 */
const useInView = ({ rootMargin = '200px', threshold = 0 } = {}) => {
    const ref = useRef(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.unobserve(element); // Once visible, stop observing
                }
            },
            { rootMargin, threshold }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [rootMargin, threshold]);

    return [ref, isInView];
};

export default useInView;
