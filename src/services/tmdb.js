import api from './api';
import ENDPOINTS from './endpoints';

// Helper to fetch multiple pages
const getMultiPageData = async (endpoint, pages = 3) => {
    try {
        const requests = [];
        for (let i = 1; i <= pages; i++) {
            requests.push(api.get(endpoint, { params: { page: i } }));
        }
        const responses = await Promise.all(requests);
        // Combine results and remove duplicates based on ID
        const allResults = responses.flatMap(r => r.data.results);
        const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());
        return uniqueResults;
    } catch (error) {
        console.error(`Error fetching multi-page data for ${endpoint}:`, error);
        return [];
    }
};

export const getTrending = async () => {
    return await getMultiPageData(ENDPOINTS.TRENDING, 3);
};

export const getTrendingMovies = async () => {
    const response = await api.get(ENDPOINTS.TRENDING_MOVIES);
    return response.data.results;
};

export const getTrendingTV = async () => {
    const response = await api.get(ENDPOINTS.TRENDING_TV);
    return response.data.results;
};

export const getPopularMovies = async () => {
    return await getMultiPageData(ENDPOINTS.POPULAR_MOVIES, 3);
};

export const getTopRatedMovies = async () => {
    return await getMultiPageData(ENDPOINTS.TOP_RATED_MOVIES, 3);
};

export const getUpcomingMovies = async () => {
    return await getMultiPageData(ENDPOINTS.UPCOMING_MOVIES, 3);
};

export const getNowPlayingMovies = async () => {
    return await getMultiPageData(ENDPOINTS.NOW_PLAYING_MOVIES, 3);
};

export const getTvShows = async () => {
    return await getMultiPageData(ENDPOINTS.TV_SHOWS, 3);
};

export const getTopRatedTV = async () => {
    return await getMultiPageData(ENDPOINTS.TV_TOP_RATED, 3);
};

export const getAiringTodayTV = async () => {
    return await getMultiPageData(ENDPOINTS.TV_AIRING_TODAY, 3);
};

export const getOnTheAirTV = async () => {
    return await getMultiPageData(ENDPOINTS.TV_ON_THE_AIR, 3);
};

export const getMovieDetails = async (id) => {
    const response = await api.get(ENDPOINTS.MOVIE_DETAILS(id));
    return response.data;
};

export const getMovieCredits = async (id) => {
    const response = await api.get(ENDPOINTS.MOVIE_CREDITS(id));
    return response.data;
};

export const getSimilarMovies = async (id) => {
    const response = await api.get(ENDPOINTS.SIMILAR_MOVIES(id));
    return response.data.results;
};

export const searchMulti = async (query) => {
    const response = await api.get(ENDPOINTS.SEARCH, {
        params: { query },
    });
    return response.data.results;
};

export const getMoviesByGenre = async (genreId) => {
    const response = await api.get(ENDPOINTS.DISCOVER_MOVIE, {
        params: { with_genres: genreId },
    });
    return response.data.results;
};

export const getDiscoverMovies = async (genreId, page = 1) => {
    const response = await api.get(ENDPOINTS.DISCOVER_MOVIE, {
        params: { with_genres: genreId, page },
    });
    return response.data.results;
};

export const getTVShowsByGenre = async (genreId) => {
    const response = await api.get(ENDPOINTS.DISCOVER_TV, {
        params: { with_genres: genreId },
    });
    return response.data.results;
};

export const getDiscoverTV = async (genreId, page = 1) => {
    const response = await api.get(ENDPOINTS.DISCOVER_TV, {
        params: { with_genres: genreId, page },
    });
    return response.data.results;
};

export const getTVDetails = async (id) => {
    const response = await api.get(ENDPOINTS.TV_DETAILS(id));
    return response.data;
};

export const getTVCredits = async (id) => {
    const response = await api.get(ENDPOINTS.TV_CREDITS(id));
    return response.data;
};

export const getSimilarTVShows = async (id) => {
    const response = await api.get(ENDPOINTS.SIMILAR_TV_SHOWS(id));
    return response.data.results;
};

export const getMovieImages = async (id) => {
    const response = await api.get(ENDPOINTS.MOVIE_IMAGES(id));
    return response.data;
};

export const getMovieVideos = async (id) => {
    const response = await api.get(ENDPOINTS.MOVIE_VIDEOS(id));
    return response.data.results || [];
};

export const getTVImages = async (id) => {
    const response = await api.get(ENDPOINTS.TV_IMAGES(id));
    return response.data;
};
export const getSeasonDetails = async (tvId, seasonNumber) => {
    const response = await api.get(ENDPOINTS.TV_SEASON_DETAILS(tvId, seasonNumber));
    return response.data;
};
export const getMoviesByLanguage = async (language, sortBy = 'primary_release_date.desc') => {
    try {
        const response = await api.get(ENDPOINTS.DISCOVER_MOVIE, {
            params: {
                with_original_language: language,
                sort_by: sortBy,
                'vote_count.gte': 10
            },
        });
        return response.data.results || [];
    } catch (error) {
        console.error(`getMoviesByLanguage error for ${language}:`, error);
        return [];
    }
};

export const getTVByLanguage = async (language, sortBy = 'popularity.desc') => {
    try {
        const response = await api.get(ENDPOINTS.DISCOVER_TV, {
            params: { with_original_language: language, sort_by: sortBy },
        });
        return response.data.results || [];
    } catch (error) {
        console.error(`getTVByLanguage error for ${language}:`, error);
        return [];
    }
};
