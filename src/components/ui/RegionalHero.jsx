import React from 'react';
import { Play, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ENDPOINTS from '../../services/endpoints';
import { useApp } from '../../context/AppContext';
import ProgressiveHeroImage from '../ui/ProgressiveHeroImage';

const RegionalHero = ({ item }) => {
    const navigate = useNavigate();
    const { playMovie, playTV } = useApp();

    if (!item || !item.backdrop_path) return null;

    const bannerUrl = `${ENDPOINTS.IMAGE_BASE_URL}${item.backdrop_path}`;

    const handlePlay = () => {
        if (item.media_type === 'tv') {
            playTV(item.id, 1, 1, item.name, item.backdrop_path);
        } else {
            playMovie(item.id, item.title || item.name, item.backdrop_path);
        }
    };

    const handleInfo = () => {
        navigate(`/${item.media_type || 'movie'}/${item.id}`);
    };

    return (
        <div className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden shadow-2xl group flex flex-col justify-end">
            <div className="absolute inset-0 z-0">
                <ProgressiveHeroImage
                    path={item.backdrop_path}
                    alt={item.title || item.name}
                    className="transform scale-105 group-hover:scale-100 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 px-4 md:px-12 pb-16 md:pb-24 max-w-3xl">
                <h1 className="text-4xl md:text-6xl font-black mb-4 text-white drop-shadow-lg">
                    {item.title || item.name}
                </h1>
                <p className="text-lg text-gray-200 mb-8 line-clamp-3 drop-shadow-md">
                    {item.overview}
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={handlePlay}
                        className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-md font-bold hover:bg-opacity-80 transition"
                    >
                        <Play size={24} fill="currentColor" />
                        Play
                    </button>
                    <button
                        onClick={handleInfo}
                        className="flex items-center gap-2 bg-gray-500 bg-opacity-50 text-white px-8 py-3 rounded-md font-bold hover:bg-opacity-40 transition"
                    >
                        <Info size={24} />
                        More Info
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegionalHero;
