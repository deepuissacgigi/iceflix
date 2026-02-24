import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { HomeSkeleton } from '../components/loaders/Loaders';

// Lazy-loaded pages — only downloaded when the user navigates to them
const Home = React.lazy(() => import('../pages/Home'));
const TVShows = React.lazy(() => import('../pages/TVShows'));
const Movies = React.lazy(() => import('../pages/Movies'));
const Regional = React.lazy(() => import('../pages/Regional'));
const MyList = React.lazy(() => import('../pages/MyList'));
const MovieDetails = React.lazy(() => import('../pages/MovieDetails'));
const Search = React.lazy(() => import('../pages/Search'));
const Profile = React.lazy(() => import('../pages/Profile'));
const Auth = React.lazy(() => import('../pages/Auth'));
const NotFound = React.lazy(() => import('../pages/NotFound'));

const PageFallback = () => (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <HomeSkeleton />
    </div>
);

const AppRouter = () => {
    return (
        <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
                <Routes>
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Home />} />
                        <Route path="tv-shows" element={<TVShows />} />
                        <Route path="movies" element={<Movies />} />
                        <Route path="regional" element={<Regional />} />
                        <Route path="my-list" element={<MyList />} />
                        <Route path="auth" element={<Auth />} />

                        <Route path="movie/:id" element={<MovieDetails />} />
                        <Route path="tv/:id" element={<MovieDetails />} />
                        <Route path="search" element={<Search />} />
                        <Route path="profile" element={<Profile />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    );
};

export default AppRouter;
