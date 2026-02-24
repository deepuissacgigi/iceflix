import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ score }) => {
    // Score is 0-10. Convert to 0-5.
    const rating = score / 2;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
        <div
            className="star-rating-badge"
            title={`Rating: ${rating.toFixed(1)}/5`}
        >
            <span className="rating-value">{rating.toFixed(1)}</span>
            <Star size={16} fill="currentColor" strokeWidth={0} />
        </div>
    );
};

export default StarRating;
