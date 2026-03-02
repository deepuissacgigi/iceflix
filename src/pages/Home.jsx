import React, { useState, useEffect } from 'react';
import Hero from '../components/ui/Hero';
import Row from '../components/layout/Row';
import {
    getTrending,
    getPopularMovies,
    getTopRatedMovies,
    getTvShows,
    getUpcomingMovies,
    getNowPlayingMovies,
    getTopRatedTV,
    getAiringTodayTV,
    getMoviesByGenre,
    getTVShowsByGenre
} from '../services/tmdb';
import { HomeSkeleton } from '../components/loaders/Loaders';
import { useContinueWatching } from '../hooks/useContinueWatching';
import ContinueWatchingRow from '../components/layout/ContinueWatchingRow';
import useDocTitle from '../hooks/useDocTitle';

// Helper to filter out anime (Animation genre from Japan)
const filterAnime = (items) => {
    if (!items) return [];
    return items.filter(item => {
        const hasAnimationGenre = item.genre_ids?.includes(16);
        const isJapanese = item.origin_country?.includes('JP') || item.original_language === 'ja';
        return !(hasAnimationGenre && isJapanese);
    });
};

const Home = () => {
    useDocTitle('Home');
    const { history, removeHistoryItem } = useContinueWatching();
    const [data, setData] = useState({
        trending: [],
        nowPlayingMovies: [],
        popularMovies: [],
        popularTV: [],
        topRatedMovies: [],
        topRatedTV: [],
        upcomingMovies: [],
        airingTodayTV: [],
        actionMovies: [],
        comedyTV: [],
        scifiMovies: [],
        dramaTV: [],
        horrorMovies: [],
        crimeTV: [],
        thrillerMovies: [],
        realityTV: [],
        romanceMovies: [],
        animationTV: [],
        docMovies: [],
        mysteryTV: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const results = await Promise.all([
                    getTrending(),                // 0
                    getNowPlayingMovies(),        // 1
                    getPopularMovies(),           // 2
                    getTvShows(),                 // 3 (Popular TV)
                    getTopRatedMovies(),          // 4
                    getTopRatedTV(),              // 5
                    getUpcomingMovies(),          // 6
                    getAiringTodayTV(),           // 7
                    getMoviesByGenre(28),         // 8 Action Movies
                    getTVShowsByGenre(35),        // 9 Comedy TV
                    getMoviesByGenre(878),        // 10 SciFi Movies
                    getTVShowsByGenre(18),        // 11 Drama TV
                    getMoviesByGenre(27),         // 12 Horror Movies
                    getTVShowsByGenre(80),        // 13 Crime TV
                    getMoviesByGenre(53),         // 14 Thriller Movies
                    getTVShowsByGenre(10764),     // 15 Reality TV
                    getMoviesByGenre(10749),      // 16 Romance Movies
                    getTVShowsByGenre(16),        // 17 Animation TV
                    getMoviesByGenre(99),         // 18 Doc Movies
                    getTVShowsByGenre(9648),      // 19 Mystery TV
                ]);

                // Use external filterAnime

                setData({
                    trending: filterAnime(results[0]),
                    nowPlayingMovies: filterAnime(results[1]),
                    popularMovies: filterAnime(results[2]),
                    popularTV: filterAnime(results[3]),
                    topRatedMovies: filterAnime(results[4]),
                    topRatedTV: filterAnime(results[5]),
                    upcomingMovies: filterAnime(results[6]),
                    airingTodayTV: filterAnime(results[7]),
                    actionMovies: filterAnime(results[8]),
                    comedyTV: filterAnime(results[9]),
                    scifiMovies: filterAnime(results[10]),
                    dramaTV: filterAnime(results[11]),
                    horrorMovies: filterAnime(results[12]),
                    crimeTV: filterAnime(results[13]),
                    thrillerMovies: filterAnime(results[14]),
                    realityTV: filterAnime(results[15]),
                    romanceMovies: filterAnime(results[16]),
                    animationTV: filterAnime(results[17]),
                    docMovies: filterAnime(results[18]),
                    mysteryTV: filterAnime(results[19]),
                });
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <HomeSkeleton />;
    }

    return (
        <div className="home-page">
            <Hero />
            <div className="home-page__rows">
                {history.length > 0 && (
                    <ContinueWatchingRow
                        items={history}
                        onRemove={(id) => {
                            const item = history.find(i => i.id === id);
                            if (item) removeHistoryItem(item.id, item.mediaType, true, item);
                        }}
                    />
                )}


                <Row title="Trending Worldwide" items={data.trending} fetchMore={async (page) => filterAnime(await getTrending(page))} />
                <Row title="Now Playing in Theaters" items={data.nowPlayingMovies} fetchMore={async (page) => filterAnime(await getNowPlayingMovies(page))} />
                <Row title="Popular Movies" items={data.popularMovies} fetchMore={async (page) => filterAnime(await getPopularMovies(page))} />
                <Row title="Popular TV Shows" items={data.popularTV} fetchMore={async (page) => filterAnime(await getTvShows(page))} />
                <Row title="Critically Acclaimed Movies" items={data.topRatedMovies} fetchMore={async (page) => filterAnime(await getTopRatedMovies(page))} />
                <Row title="Top Rated TV Series" items={data.topRatedTV} fetchMore={async (page) => filterAnime(await getTopRatedTV(page))} />
                <Row title="Upcoming Movies" items={data.upcomingMovies} fetchMore={async (page) => filterAnime(await getUpcomingMovies(page))} />
                <Row title="TV Airing Today" items={data.airingTodayTV} fetchMore={async (page) => filterAnime(await getAiringTodayTV(page))} />

                <Row title="Action Blockbusters" items={data.actionMovies} fetchMore={async (page) => filterAnime(await getMoviesByGenre(28, page))} />
                <Row title="Comedy TV Hits" items={data.comedyTV} fetchMore={async (page) => filterAnime(await getTVShowsByGenre(35, page))} />
                <Row title="Sci-Fi Spectacles" items={data.scifiMovies} fetchMore={async (page) => filterAnime(await getMoviesByGenre(878, page))} />
                <Row title="Dramatic Masterpieces" items={data.dramaTV} fetchMore={async (page) => filterAnime(await getTVShowsByGenre(18, page))} />
                <Row title="Horror & Gore" items={data.horrorMovies} fetchMore={async (page) => filterAnime(await getMoviesByGenre(27, page))} />
                <Row title="Crime & Mystery Series" items={data.crimeTV} fetchMore={async (page) => filterAnime(await getTVShowsByGenre(80, page))} />
                <Row title="Edge of Your Seat Thrillers" items={data.thrillerMovies} fetchMore={async (page) => filterAnime(await getMoviesByGenre(53, page))} />
                <Row title="Reality TV Favorites" items={data.realityTV} fetchMore={async (page) => filterAnime(await getTVShowsByGenre(10764, page))} />
                <Row title="Romantic Getaways" items={data.romanceMovies} fetchMore={async (page) => filterAnime(await getMoviesByGenre(10749, page))} />
                <Row title="Animated Worlds" items={data.animationTV} fetchMore={async (page) => filterAnime(await getTVShowsByGenre(16, page))} />
                <Row title="True Stories & Docs" items={data.docMovies} fetchMore={async (page) => filterAnime(await getMoviesByGenre(99, page))} />
                <Row title="Whodunnit Mysteries" items={data.mysteryTV} fetchMore={async (page) => filterAnime(await getTVShowsByGenre(9648, page))} />
            </div>
        </div>
    );
};

export default Home;
