import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import VideoPlayerModal from '../components/player/VideoPlayerModal';

const MainLayout = () => {
    return (
        <div className="app-container">
            <Navbar />
            <VideoPlayerModal />
            <main>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
