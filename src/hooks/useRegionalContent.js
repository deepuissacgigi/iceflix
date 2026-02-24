import { useState, useEffect } from 'react';
import { getMoviesByLanguage, getTVByLanguage } from '../services/tmdb';

const REGIONS = [
    {
        id: 'in',
        label: 'Indian Cinema',
        type: 'movie',
        isSubRegion: true,
        fetchers: [
            { id: 'hi', label: 'Bollywood (Hindi)', fetcher: getMoviesByLanguage },
            { id: 'ml', label: 'Mollywood (Malayalam)', fetcher: getMoviesByLanguage },
            { id: 'ta', label: 'Kollywood (Tamil)', fetcher: getMoviesByLanguage },
            { id: 'te', label: 'Tollywood (Telugu)', fetcher: getMoviesByLanguage },
        ]
    },
    { id: 'en', label: 'Hollywood Blockbusters (English)', fetcher: getMoviesByLanguage, type: 'movie' },
    { id: 'ko', label: 'K-Drama Wave (Korean)', fetcher: getTVByLanguage, type: 'tv' },
    { id: 'ja', label: 'Anime & Japanese TV', fetcher: getTVByLanguage, type: 'tv' },
    { id: 'es', label: 'Spanish Gems', fetcher: getMoviesByLanguage, type: 'movie' },
    { id: 'fr', label: 'French Cinema', fetcher: getMoviesByLanguage, type: 'movie' },
];

const SORT_OPTIONS = [
    { id: 'popularity.desc', label: 'Most Popular' },
    { id: 'primary_release_date.desc', label: 'Latest Release' },
    { id: 'vote_average.desc', label: 'Top Rated' },
    { id: 'revenue.desc', label: 'Highest Grossing' },
    { id: 'vote_count.desc', label: 'Most Voted' },
];

const useRegionalContent = (activeRegionId = 'in', sortBy = 'popularity.desc') => {
    const [content, setContent] = useState([]);
    const [subRegionsData, setSubRegionsData] = useState([]);
    const [spotlightItem, setSpotlightItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            setError(null);

            try {
                const region = REGIONS.find(r => r.id === activeRegionId) || REGIONS[0];

                if (region.isSubRegion) {
                    // Fetch multiple sub-regions in parallel
                    const results = await Promise.allSettled(
                        region.fetchers.map(sub => sub.fetcher(sub.id, sortBy))
                    );

                    const processedSubRegions = [];
                    let allItems = [];

                    results.forEach((result, index) => {
                        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
                            const sub = region.fetchers[index];
                            const items = result.value.map(item => ({
                                ...item,
                                media_type: item.media_type || region.type
                            }));

                            if (items.length > 0) {
                                processedSubRegions.push({
                                    id: sub.id,
                                    label: sub.label,
                                    items: items
                                });
                                allItems = [...allItems, ...items];
                            }
                        }
                    });

                    setSubRegionsData(processedSubRegions);
                    setContent(allItems); // flat list for spotlight selection

                    const validSpotlightItems = allItems.filter(item => item.backdrop_path);
                    if (validSpotlightItems.length > 0) {
                        setSpotlightItem(validSpotlightItems[Math.floor(Math.random() * validSpotlightItems.length)]);
                    } else {
                        setSpotlightItem(null);
                    }

                } else {
                    // Standard single region
                    const rawItems = await region.fetcher(region.id, sortBy);
                    const items = rawItems.map(item => ({
                        ...item,
                        media_type: item.media_type || region.type
                    }));

                    setSubRegionsData([]); // clear sub-regions
                    setContent(items);

                    const validSpotlightItems = items.filter(item => item.backdrop_path);
                    if (validSpotlightItems.length > 0) {
                        setSpotlightItem(validSpotlightItems[Math.floor(Math.random() * validSpotlightItems.length)]);
                    } else {
                        setSpotlightItem(null);
                    }
                }

            } catch (err) {
                console.error(`Critical error in useRegionalContent for ${activeRegionId}:`, err);
                setError("An unexpected error occurred. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [activeRegionId, sortBy]);

    return {
        content,
        subRegionsData,
        spotlightItem,
        loading,
        error,
        regions: REGIONS,
        activeRegion: REGIONS.find(r => r.id === activeRegionId) || REGIONS[0],
        sortOptions: SORT_OPTIONS
    };
};

export default useRegionalContent;
