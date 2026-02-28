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
        removeContinueWatching(movie.id, movie.mediaType);
        if (onRemove) onRemove(movie.id);
    };

    return (
        <div
            className="continue-watching-card"
            onClick={() => navigate(`/${movie.mediaType}/${movie.id}`)}
        >
            {/* Backdrop Image */}
            <LazyImage src={imageSrc} alt={title} className="cw-img" />

            {/* Centered Play */}
            <div className="cw-play">
                <Play size={20} fill="white" color="white" />
            </div>

            {/* Remove */}
            <button className="cw-close" onClick={handleRemove} title="Remove">
                <X size={13} />
            </button>

            {/* Bottom Info Strip */}
            <div className="cw-bottom">
                <h4 className="cw-title">{title}</h4>

                <div className="cw-subtitle">
                    {movie.mediaType === 'tv' && (
                        <>
                            <span>S{movie.season || 1} E{movie.episode || 1}</span>
                            <span className="dot" />
                        </>
                    )}
                    {percentage > 0 && (
                        <span className="cw-pct">{Math.round(percentage)}%</span>
                    )}
                </div>

                {/* Edge-to-edge progress bar */}
                <div className="cw-bar-track">
                    <div
                        className="cw-bar-fill"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ContinueWatchingCard;
