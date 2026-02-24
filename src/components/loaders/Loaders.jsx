import React from 'react';

/**
 * Cinematic Spinner (Inline)
 * A minimal ring for buttons/small areas, separate from the main page loader.
 * @param {Object} props
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - The size of the spinner
 * @param {string} [props.className=''] - Additional classes
 */
export const Spinner = ({ size = 'md', className = '' }) => {
    return (
        <div className={`spinner-ring ${size} ${className}`} role="status">
            <span className="sr-only">Loading...</span>
        </div>
    );
};

/**
 * Skeleton Loader Component
 * subtle placeholder for content
 */
export const Skeleton = ({ className = '', ...props }) => {
    return (
        <div
            className={`skeleton ${className}`}
            {...props}
        />
    );
};

/**
 * Cinematic Brand Intro Loader
 * "The Frozen Pulse" - Text-first loading experience.
 */
export const PageLoader = () => {
    return (
        <div className="loader-container">
            <div className="cinematic-loader">
                {/* The Hero: ICEFLIX Brand Text */}
                <div className="cinematic-loader__brand">ICEFLIX</div>

                {/* Minimalist Activity Indicator (3 Dots) */}
                <div className="activity-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    );
};

/**
 * Facebook-Style Search Grid Skeleton
 * Renders a grid of shimmering movie cards.
 */
export const SearchGridSkeleton = () => {
    return (
        <div className="grid-list animate-fadeIn">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="movie-card skeleton-card" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="skeleton poster" />
                    <div style={{ padding: '0.75rem' }}>
                        <div className="skeleton text title" />
                        <div className="skeleton text short" />
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Facebook-Style Inline List Skeleton
 * Renders rows of shimmering items (Thumbnail + Text) for the Navbar.
 */
export const SearchListSkeleton = () => {
    return (
        <ul className="search-dropdown-skeleton animate-fadeIn">
            {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="skeleton thumbnail" />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div className="skeleton text title" style={{ width: '80%', marginBottom: '0.5rem' }} />
                        <div className="skeleton text short" style={{ width: '40%' }} />
                    </div>
                </li>
            ))}
        </ul>
    );
};

/**
 * Home Page Skeleton
 * Simulates a large Hero banner and multiple content rows.
 */
export const HomeSkeleton = () => {
    return (
        <div className="home-skeleton animate-fadeIn" style={{ width: '100%', minHeight: '100vh', background: '#050505' }}>
            {/* Hero Skeleton */}
            <div style={{ position: 'relative', width: '100%', height: '80vh', marginBottom: '2rem' }}>
                <div className="skeleton" style={{ width: '100%', height: '100%' }} />
                <div style={{ position: 'absolute', bottom: '10%', left: '4%', width: '40%' }}>
                    <div className="skeleton text title" style={{ height: '40px', marginBottom: '1rem', width: '80%' }} />
                    <div className="skeleton text" style={{ height: '100px', marginBottom: '1.5rem' }} />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div className="skeleton" style={{ width: '120px', height: '45px', borderRadius: '4px' }} />
                        <div className="skeleton" style={{ width: '120px', height: '45px', borderRadius: '4px' }} />
                    </div>
                </div>
            </div>

            {/* Rows Skeleton */}
            <div style={{ padding: '0 4%', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                        <div className="skeleton text title" style={{ width: '200px', marginBottom: '1rem' }} />
                        <div style={{ display: 'flex', gap: '1rem', overflow: 'hidden' }}>
                            {Array.from({ length: 6 }).map((_, j) => (
                                <div key={j} style={{ width: '200px', flexShrink: 0 }}>
                                    <div className="skeleton poster" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/**
 * Details Page Skeleton
 * Simulates the immersive details view.
 */
export const DetailsSkeleton = () => {
    return (
        <div className="details-skeleton animate-fadeIn" style={{ width: '100%', minHeight: '100vh', background: '#050505' }}>
            {/* Hero Section */}
            <div style={{ position: 'relative', width: '100%', height: '70vh' }}>
                <div className="skeleton" style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Content Section */}
            <div style={{ padding: '0 4%', marginTop: '-10%', position: 'relative', zIndex: 10 }}>
                {/* Title & Meta */}
                <div style={{ marginBottom: '2rem', maxWidth: '60%' }}>
                    <div className="skeleton text title" style={{ height: '50px', marginBottom: '1rem' }} />
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div className="skeleton text" style={{ width: '60px' }} />
                        <div className="skeleton text" style={{ width: '60px' }} />
                        <div className="skeleton text" style={{ width: '60px' }} />
                    </div>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
                    <div className="skeleton" style={{ width: '150px', height: '50px', borderRadius: '50px' }} />
                    <div className="skeleton" style={{ width: '150px', height: '50px', borderRadius: '50px' }} />
                </div>

                {/* Synopsis */}
                <div style={{ maxWidth: '800px', marginBottom: '4rem' }}>
                    <div className="skeleton text title" style={{ width: '150px', marginBottom: '1rem' }} />
                    <div className="skeleton text" />
                    <div className="skeleton text" />
                    <div className="skeleton text short" />
                </div>

                {/* Cast Grid (Mini) */}
                <div style={{ marginBottom: '4rem' }}>
                    <div className="skeleton text title" style={{ width: '200px', marginBottom: '1.5rem' }} />
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} style={{ width: '140px' }}>
                                <div className="skeleton circle" style={{ width: '100px', height: '100px', marginBottom: '0.5rem' }} />
                                <div className="skeleton text short" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
