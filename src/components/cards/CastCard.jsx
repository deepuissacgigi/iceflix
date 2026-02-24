import React from 'react';
import LazyImage from '../ui/LazyImage';
import ENDPOINTS from '../../services/endpoints';
import { User } from 'lucide-react';

const CastCard = ({ cast }) => {
    return (
        <div className="cast-card">
            {cast.profile_path ? (
                <LazyImage
                    src={`${ENDPOINTS.IMAGE_BASE_URL}${cast.profile_path}`}
                    alt={cast.name}
                    className="cast-image"
                />
            ) : (
                <div className="placeholder">
                    <User size={32} className="text-gray-500" />
                </div>
            )}
            <h3>{cast.name}</h3>
            <p>{cast.character || cast.job}</p>
        </div>
    );
};

export default CastCard;
