import api from './api';
import ENDPOINTS from './endpoints';
import { cachedFetch } from '../utils/apiCache';

// Helper to fetch multiple pages
const getMultiPageData = async (endpoint, pages = 1) => {
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

// ── Cached list endpoints ──────────────────────────────────

export const getTrending = (page = 1) =>
    cachedFetch(`trending_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.TRENDING, { params: { page } });
        return response.data.results;
    });

export const getTrendingMovies = (page = 1) =>
    cachedFetch(`trending_movies_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.TRENDING_MOVIES, { params: { page } });
        return response.data.results;
    });

export const getTrendingTV = (page = 1) =>
    cachedFetch(`trending_tv_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.TRENDING_TV, { params: { page } });
        return response.data.results;
    });

export const getPopularMovies = (page = 1) =>
    cachedFetch(`popular_movies_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.POPULAR_MOVIES, { params: { page } });
        return response.data.results;
    });

export const getTopRatedMovies = (page = 1) =>
    cachedFetch(`top_rated_movies_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.TOP_RATED_MOVIES, { params: { page } });
        return response.data.results;
    });

export const getUpcomingMovies = (page = 1) =>
    cachedFetch(`upcoming_movies_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.UPCOMING_MOVIES, { params: { page } });
        return response.data.results;
    });

export const getNowPlayingMovies = (page = 1) =>
    cachedFetch(`now_playing_movies_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.NOW_PLAYING_MOVIES, { params: { page } });
        return response.data.results;
    });

export const getTvShows = (page = 1) =>
    cachedFetch(`tv_shows_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.TV_SHOWS, { params: { page } });
        return response.data.results;
    });

export const getTopRatedTV = (page = 1) =>
    cachedFetch(`top_rated_tv_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.TV_TOP_RATED, { params: { page } });
        return response.data.results;
    });

export const getAiringTodayTV = (page = 1) =>
    cachedFetch(`airing_today_tv_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.TV_AIRING_TODAY, { params: { page } });
        return response.data.results;
    });

export const getOnTheAirTV = (page = 1) =>
    cachedFetch(`on_the_air_tv_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.TV_ON_THE_AIR, { params: { page } });
        return response.data.results;
    });

// ── Detail endpoints (shorter cache — 2 min) ──────────────

export const getMovieDetails = (id) =>
    cachedFetch(`movie_details_${id}`, async () => {
        const response = await api.get(ENDPOINTS.MOVIE_DETAILS(id));
        return response.data;
    }, 2 * 60 * 1000);

export const getMovieCredits = (id) =>
    cachedFetch(`movie_credits_${id}`, async () => {
        const response = await api.get(ENDPOINTS.MOVIE_CREDITS(id));
        return response.data;
    }, 2 * 60 * 1000);

export const getSimilarMovies = (id) =>
    cachedFetch(`similar_movies_${id}`, async () => {
        const response = await api.get(ENDPOINTS.SIMILAR_MOVIES(id));
        return response.data.results;
    }, 2 * 60 * 1000);

export const searchMulti = async (query) => {
    // Search is NOT cached — always fresh results
    const response = await api.get(ENDPOINTS.SEARCH, {
        params: { query },
    });
    return response.data.results;
};

export const getMoviesByGenre = (genreId, page = 1) =>
    cachedFetch(`movies_genre_${genreId}_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.DISCOVER_MOVIE, {
            params: { with_genres: genreId, page },
        });
        return response.data.results;
    });

export const getDiscoverMovies = async (genreId, page = 1) => {
    // Paginated discovers are NOT cached (page changes)
    const response = await api.get(ENDPOINTS.DISCOVER_MOVIE, {
        params: { with_genres: genreId, page },
    });
    return response.data.results;
};

export const getTVShowsByGenre = (genreId, page = 1) =>
    cachedFetch(`tv_genre_${genreId}_page_${page}`, async () => {
        const response = await api.get(ENDPOINTS.DISCOVER_TV, {
            params: { with_genres: genreId, page },
        });
        return response.data.results;
    });

export const getDiscoverTV = async (genreId, page = 1) => {
    const response = await api.get(ENDPOINTS.DISCOVER_TV, {
        params: { with_genres: genreId, page },
    });
    return response.data.results;
};

export const getTVDetails = (id) =>
    cachedFetch(`tv_details_${id}`, async () => {
        const response = await api.get(ENDPOINTS.TV_DETAILS(id));
        return response.data;
    }, 2 * 60 * 1000);

export const getTVCredits = (id) =>
    cachedFetch(`tv_credits_${id}`, async () => {
        const response = await api.get(ENDPOINTS.TV_CREDITS(id));
        return response.data;
    }, 2 * 60 * 1000);

export const getSimilarTVShows = (id) =>
    cachedFetch(`similar_tv_${id}`, async () => {
        const response = await api.get(ENDPOINTS.SIMILAR_TV_SHOWS(id));
        return response.data.results;
    }, 2 * 60 * 1000);

export const getMovieImages = (id) =>
    cachedFetch(`movie_images_${id}`, async () => {
        const response = await api.get(ENDPOINTS.MOVIE_IMAGES(id));
        return response.data;
    }, 2 * 60 * 1000);

export const getMovieVideos = (id) =>
    cachedFetch(`movie_videos_${id}`, async () => {
        const response = await api.get(ENDPOINTS.MOVIE_VIDEOS(id));
        return response.data.results || [];
    }, 2 * 60 * 1000);

export const getTVImages = (id) =>
    cachedFetch(`tv_images_${id}`, async () => {
        const response = await api.get(ENDPOINTS.TV_IMAGES(id));
        return response.data;
    }, 2 * 60 * 1000);

export const getSeasonDetails = (tvId, seasonNumber) =>
    cachedFetch(`tv_season_${tvId}_${seasonNumber}`, async () => {
        const response = await api.get(ENDPOINTS.TV_SEASON_DETAILS(tvId, seasonNumber));
        return response.data;
    }, 2 * 60 * 1000);

export const getMoviesByLanguage = async (language, sortBy = 'primary_release_date.desc') => {
    return cachedFetch(`movies_lang_${language}_${sortBy}`, async () => {
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
    });
};

export const getTVByLanguage = async (language, sortBy = 'popularity.desc') => {
    return cachedFetch(`tv_lang_${language}_${sortBy}`, async () => {
        try {
            const response = await api.get(ENDPOINTS.DISCOVER_TV, {
                params: { with_original_language: language, sort_by: sortBy },
            });
            return response.data.results || [];
        } catch (error) {
            console.error(`getTVByLanguage error for ${language}:`, error);
            return [];
        }
    });
};
