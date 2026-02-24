import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ENDPOINTS from '../../services/endpoints';
import LazyImage from '../ui/LazyImage';

const MovieCard = ({ movie }) => {
    const navigate = useNavigate();

    const posterPath = movie.poster_path
        ? `${ENDPOINTS.IMAGE_BASE_URL_W500}${movie.poster_path}`
        : 'https://placehold.co/500x750/1a1a1a/666666?text=No+Image';

    const title = movie.title || movie.name;
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'NR';

    return (
        <motion.div
            className="movie-card"
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => {
                const type = movie.media_type === 'tv' || movie.name ? 'tv' : 'movie';
                navigate(`/${type}/${movie.id}`);
            }}
        >
            <div className="movie-card__image-container">
                <LazyImage
                    src={posterPath}
                    alt={title}
                    draggable={false}
                    className="w-full h-full object-cover"
                />
                <div className="movie-card__rating-badge">
                    <Star size={12} fill="currentColor" />
                    <span>{rating}</span>
                </div>
            </div>

            <div className="movie-card__info">
                <h3 className="movie-card__title" title={title}>{title}</h3>
                <div className="movie-card__meta">
                    <span className="year">{year}</span>
                    {movie.media_type && <span className="type">{movie.media_type}</span>}
                </div>
            </div>
        </motion.div>
    );
};

export default MovieCard;
