import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import ENDPOINTS from '../../services/endpoints';
import Button from '../ui/Button';
import { useApp } from '../../context/AppContext';
import ProgressiveHeroImage from '../ui/ProgressiveHeroImage';

const RegionalSpotlight = ({ item }) => {
    const navigate = useNavigate();
    const { playMovie, playTV } = useApp();

    if (!item || !item.backdrop_path) return null;

    const bannerUrl = `${ENDPOINTS.IMAGE_BASE_URL}${item.backdrop_path}`;

    return (
        <div className="regional-spotlight">
            {/* Background Layer */}
            <div className="regional-spotlight__bg">
                <ProgressiveHeroImage
                    path={item.backdrop_path}
                    alt={item.title || item.name}
                />
            </div>

            <div className="regional-spotlight__overlay" />

            {/* Content Layer */}
            <div className="regional-spotlight__content">
                <div className="regional-spotlight__badge">
                    <span>Featured Spotlight</span>
                </div>

                <h1 className="regional-spotlight__title">
                    {item.title || item.name}
                </h1>

                <p className="regional-spotlight__overview">
                    {item.overview}
                </p>

                <div className="regional-spotlight__actions">
                    <Button
                        variant="primary"
                        icon={Play}
                        onClick={() => {
                            if (item.media_type === 'tv') {
                                playTV(item.id, 1, 1, item.name, item.backdrop_path);
                            } else {
                                playMovie(item.id, item.title || item.name, item.backdrop_path);
                            }
                        }}
                    >
                        Play Now
                    </Button>

                    <Button
                        variant="secondary"
                        icon={Info}
                        onClick={() => {
                            const type = item.media_type === 'tv' ? 'tv' : 'movie';
                            navigate(`/${type}/${item.id}`);
                        }}
                    >
                        More Info
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RegionalSpotlight;
