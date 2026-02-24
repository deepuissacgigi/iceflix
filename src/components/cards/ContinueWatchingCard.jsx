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
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            variants={{
                rest: { y: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
                hover: {
                    y: -6,
                    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.6), 0 0 25px rgba(161, 51, 255, 0.5)'
                },
                tap: { y: 0 }
            }}
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
            <motion.div
                className="cw-image-container"
                variants={{
                    rest: { filter: 'brightness(0.8) saturate(1)' },
                    hover: { filter: 'brightness(1.1) saturate(1.1)' }
                }}
                style={{ width: '100%', height: '100%', position: 'relative' }}
            >
                <LazyImage
                    src={imageSrc}
                    alt={title}
                    className="w-full h-full object-cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Play Icon Overlay */}
                <motion.div
                    variants={{
                        rest: { opacity: 0 },
                        hover: { opacity: 1 }
                    }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)',
                        zIndex: 10
                    }}
                >
                    <motion.div
                        variants={{
                            rest: { scale: 0.8, opacity: 0 },
                            hover: { scale: 1, opacity: 1 }
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '50%',
                            padding: '12px',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.4)',
                            boxShadow: '0 0 15px rgba(255,255,255,0.2)'
                        }}>
                        <Play size={24} fill="white" color="white" />
                    </motion.div>
                </motion.div>

                {/* Remove Button - Always visible on hover of card ideally */}
                <motion.div
                    className="remove-overlay"
                    variants={{
                        rest: { opacity: 0, scale: 0.8 },
                        hover: { opacity: 1, scale: 1 }
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                        whileHover={{ scale: 1.2, backgroundColor: 'rgba(229, 9, 20, 0.9)' }}
                        whileTap={{ scale: 0.9 }}
                        style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white',
                            backdropFilter: 'blur(4px)'
                        }}
                        title="Remove from Continue Watching"
                    >
                        <X size={14} />
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* Info & Progress */}
            <motion.div
                className="cw-info"
                variants={{
                    rest: { y: 0 },
                    hover: { y: -2 }
                }}
                transition={{ duration: 0.3 }}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)',
                    padding: '12px 10px 10px 10px',
                    zIndex: 15
                }}>
                <h4 style={{
                    fontSize: '0.95rem',
                    color: 'white',
                    margin: '0 0 6px 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}>
                    {title}
                </h4>

                {movie.mediaType === 'tv' && movie.season && (
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                        S{movie.season} E{movie.episode}
                    </span>
                )}

                {/* Progress Bar */}
                <div style={{
                    width: '100%',
                    height: '3px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        style={{
                            height: '100%',
                            background: '#a133ff', // Primary theme violet
                            borderRadius: '2px',
                            boxShadow: '0 0 8px rgba(161, 51, 255, 0.8)'
                        }}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ContinueWatchingCard;
