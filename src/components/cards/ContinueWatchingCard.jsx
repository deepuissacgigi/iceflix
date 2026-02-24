import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ENDPOINTS from '../../services/endpoints';
import LazyImage from '../ui/LazyImage';
import { removeContinueWatching } from '../../utils/continueWatching';

const ContinueWatchingCard = ({ movie, onRemove }) => {
    const navigate = useNavigate();

    const backdropPath = movie.backdrop || movie.backdrop_path;
    const imageSrc = backdropPath
        ? `${ENDPOINTS.IMAGE_BASE_URL_W500}${backdropPath}`
        : 'https://placehold.co/500x281/1a1a1a/666666?text=No+Image';

    const title = movie.title || movie.name;
    const percentage = movie.duration > 0
        ? Math.min((movie.progress / movie.duration) * 100, 100)
        : 0;

    const handleRemove = (e) => {
        e.stopPropagation();
        e.preventDefault();

        // Logical removal
        removeContinueWatching(movie.id, movie.mediaType);

        // UI update callback
        if (onRemove) onRemove(movie.id);
    };

    return (
        <motion.div
            className="continue-watching-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => {
                navigate(`/${movie.mediaType}/${movie.id}`);
            }}
            style={{
                minWidth: '280px',
                height: '160px',
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                marginRight: '1rem',
                backgroundColor: '#1a1a1a'
            }}
        >
            <div className="cw-image-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
                <LazyImage
                    src={imageSrc}
                    alt={title}
                    className="w-full h-full object-cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                />

                {/* Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                    style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)',
                        opacity: 0, // Initial state, driven by CSS usually but we'll leave inline approach if working
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                >
                    <div style={{
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        padding: '12px',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <Play size={24} fill="white" color="white" />
                    </div>
                </div>

                {/* Remove Button - Always visible on hover of card ideally */}
                <div
                    className="remove-overlay"
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        padding: '8px',
                        zIndex: 20
                    }}
                >
                    <motion.button
                        onClick={handleRemove}
                        whileHover={{ scale: 1.2, backgroundColor: 'rgba(255, 0, 0, 0.8)' }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                        title="Remove from Continue Watching"
                    >
                        <X size={14} />
                    </motion.button>
                </div>
            </div>

            {/* Info & Progress */}
            <div className="cw-info" style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,1), transparent)',
                padding: '10px'
            }}>
                <h4 style={{
                    fontSize: '0.9rem',
                    color: 'white',
                    margin: '0 0 6px 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 600,
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                }}>
                    {title}
                </h4>

                {movie.mediaType === 'tv' && movie.season && (
                    <span style={{ fontSize: '0.75rem', color: '#ccc', display: 'block', marginBottom: '4px' }}>
                        S{movie.season} E{movie.episode}
                    </span>
                )}

                {/* Progress Bar */}
                <div style={{
                    width: '100%',
                    height: '3px',
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        background: '#e50914', // Netflix red or primary color
                        borderRadius: '2px'
                    }} />
                </div>
            </div>
        </motion.div>
    );
};

export default ContinueWatchingCard;
