import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LazyImage = ({ src, alt, className = '', style = {}, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    return (
        <div className={`lazy-image-container ${className}`} style={{ position: 'relative', overflow: 'hidden', ...style }}>
            {/* Skeleton / Loading State */}
            <AnimatePresence mode="popLayout">
                {!isLoaded && !hasError && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="skeleton-loader"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: '#1a1a1a',
                            zIndex: 2
                        }}
                    >
                        <motion.div
                            animate={{
                                x: ['-100%', '100%']
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: 'linear'
                            }}
                            style={{
                                width: '50%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.img
                src={src}
                alt={alt}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                onLoad={() => setIsLoaded(true)}
                onError={() => setHasError(true)}
                loading="lazy"
                decoding="async"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    willChange: 'transform, opacity'
                }}
                {...props}
            />

            {/* Error Fallback (Optional - could just be empty or icon) */}
            {hasError && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#1a1a1a',
                    color: '#666'
                }}>
                    <span style={{ fontSize: '0.8rem' }}>No Image</span>
                </div>
            )}
        </div>
    );
};

export default LazyImage;
