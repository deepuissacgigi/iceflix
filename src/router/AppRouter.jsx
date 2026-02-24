import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import TVShows from '../pages/TVShows';
import Movies from '../pages/Movies';
import Regional from '../pages/Regional';
import MyList from '../pages/MyList';
import MovieDetails from '../pages/MovieDetails';

import Search from '../pages/Search';
import Profile from '../pages/Profile';
import Auth from '../pages/Auth';

const AppRouter = () => {
    return (
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



            <Route path="*" element={<div className="text-white text-center mt-20">Page Not Found</div>} />
        </Routes>
    );
};

export default AppRouter;
