import React from 'react';
import { Star, Trash2, Play, Film, Tv } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ENDPOINTS from '../../services/endpoints';
import LazyImage from '../ui/LazyImage';

const MyListCard = ({ movie, onRemove }) => {
    const navigate = useNavigate();

    const posterPath = movie.poster_path
        ? `${ENDPOINTS.IMAGE_BASE_URL_W500}${movie.poster_path}`
        : 'https://placehold.co/500x750/1a1a1a/666666?text=No+Image';

    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate && !isNaN(new Date(releaseDate).getFullYear()) ? new Date(releaseDate).getFullYear() : '';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';
    const mediaType = movie.media_type === 'tv' || movie.name ? 'tv' : 'movie';

    const handleClick = () => {
        navigate(`/${mediaType}/${movie.id}`);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        if (onRemove) onRemove(movie.id);
    };

    return (
        <div className="mylist-card" onClick={handleClick}>
            {/* Poster Image */}
            <div className="mylist-card__poster">
                <LazyImage
                    src={posterPath}
                    alt={title}
                    draggable={false}
                />

                {/* Rating Badge (always visible) */}
                <div className="mylist-card__rating">
                    <Star size={11} fill="currentColor" />
                    <span>{rating}</span>
                </div>

                {/* Media Type Badge */}
                <div className="mylist-card__type-badge">
                    {mediaType === 'tv' ? <Tv size={11} /> : <Film size={11} />}
                    <span>{mediaType === 'tv' ? 'Series' : 'Movie'}</span>
                </div>

                {/* Hover Overlay */}
                <div className="mylist-card__overlay">
                    <div className="mylist-card__overlay-actions">
                        <button className="mylist-card__play-btn" title="View Details">
                            <Play size={22} fill="currentColor" />
                        </button>
                    </div>

                    <div className="mylist-card__overlay-info">
                        <h3 className="mylist-card__overlay-title">{title}</h3>
                        {year && <span className="mylist-card__overlay-year">{year}</span>}
                    </div>

                    {/* Remove Button */}
                    <button
                        className="mylist-card__remove-btn"
                        onClick={handleRemove}
                        title="Remove from My List"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="mylist-card__info">
                <h3 className="mylist-card__title">{title}</h3>
                {year && <p className="mylist-card__meta">{year}</p>}
            </div>
        </div>
    );
};

export default React.memo(MyListCard);
