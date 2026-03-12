import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Bell, Menu, X, ChevronDown, User, Heart, Settings, LogOut, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const location = useLocation();

    const { user, logoutUser } = useAuth();
    const isGuest = user?.isGuest;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menus when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileOpen(false);
    }, [location.pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'TV Shows', path: '/tv-shows' },
        { name: 'Movies', path: '/movies' },
        { name: 'Regional', path: '/regional' },
        { name: 'My List', path: '/my-list' },
    ];

    const showNotAuthLinks = !user && !isGuest;

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="navbar__left">
                <Link to="/" className="navbar__logo logo" data-darkreader-inline-color style={{ '--darkreader-inline-color': 'initial' }}>
                    ICEFLIX
                </Link>
                <ul className="navbar__links">
                    {navLinks.map((link) => (
                        <li key={link.name}>
                            <Link to={link.path}>{link.name}</Link>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="navbar__right">
                <Link to="/search" className="navbar__icon action-btn" aria-label="Search">
                    <SearchIcon size={20} />
                </Link>

                {!showNotAuthLinks && (
                    <button className="navbar__icon action-btn" aria-label="Notifications" title="Notifications">
                        <Bell size={20} />
                    </button>
                )}

                {!showNotAuthLinks && (
                    <div className="navbar__profile">
                        <button
                            className="profile-btn"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            aria-label="Profile Menu"
                        >
                            <img
                                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'guest'}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`}
                                alt="User Avatar"
                                className="profile-btn__avatar"
                            />
                            <ChevronDown
                                size={14}
                                className={`profile-btn__icon ${isProfileOpen ? 'rotate' : ''}`}
                            />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    className="profile-dropdown-menu"
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                >
                                    <div className="pdm-header">
                                        <div className="pdm-header__avatar">
                                            <img
                                                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'guest'}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf,ffd5dc`}
                                                alt="Current user"
                                            />
                                        </div>
                                        <div className="pdm-header__info">
                                            <span className="name">{isGuest ? 'Guest User' : (user?.name || user?.email?.split('@')[0] || 'User')}</span>
                                            {!isGuest && <span className="email">{user?.email}</span>}
                                        </div>
                                    </div>

                                    {!isGuest && (
                                        <div className="pdm-group">
                                            <Link to="/profile" className="pdm-item" onClick={() => setIsProfileOpen(false)}>
                                                <User size={16} /> Account Details
                                            </Link>
                                            <Link to="/my-list" className="pdm-item" onClick={() => setIsProfileOpen(false)}>
                                                <Heart size={16} /> My Watchlist
                                            </Link>
                                            <Link to="/profile?tab=settings" className="pdm-item" onClick={() => setIsProfileOpen(false)}>
                                                <Settings size={16} /> Preferences
                                            </Link>
                                        </div>
                                    )}

                                    <div className="pdm-group pdm-group--danger">
                                        <button
                                            className="pdm-item pdm-item--danger"
                                            onClick={() => {
                                                logoutUser();
                                                setIsProfileOpen(false);
                                            }}
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {showNotAuthLinks && (
                    <Link to="/auth" className="navbar__login-btn">
                        Sign In
                    </Link>
                )}

                <button
                    className="navbar__mobile-toggle action-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle Mobile Menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="mobile-menu"
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className="mobile-menu__header">
                            <span className="logo">ICEFLIX</span>
                            <button
                                className="close-btn"
                                onClick={() => setIsMobileMenuOpen(false)}
                                aria-label="Close Menu"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <ul className="mobile-menu__links">
                            {navLinks.map((link) => (
                                <motion.li
                                    key={link.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Link to={link.path}>{link.name}</Link>
                                </motion.li>
                            ))}
                            {showNotAuthLinks && (
                                <motion.li
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mobile-auth-link"
                                >
                                    <Link to="/auth">Sign In</Link>
                                </motion.li>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
