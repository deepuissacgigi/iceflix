import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, X, Trash2, Play, Plus, Minus, LogIn, LogOut, Info } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext';
import { searchMulti } from '../../services/tmdb';
import ENDPOINTS from '../../services/endpoints';
import { Spinner, SearchListSkeleton } from '../loaders/Loaders';
import { useNotification } from '../../context/NotificationContext';

const getNotifIcon = (type) => {
    switch (type) {
        case 'play': return <Play size={14} />;
        case 'add': return <Plus size={14} />;
        case 'remove': return <Minus size={14} />;
        case 'success': return <LogIn size={14} />;
        case 'info': return <LogOut size={14} />;
        case 'signup': return <User size={14} />;
        default: return <Info size={14} />;
    }
};

const getNotifColor = (type) => {
    switch (type) {
        case 'play': return '#4dff88';
        case 'add': return '#6366f1';
        case 'remove': return '#f87171';
        case 'success': return '#34d399';
        case 'info': return '#a78bfa';
        default: return '#94a3b8';
    }
};

const getRelativeTime = (timestamp) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const debouncedSearchValue = useDebounce(searchValue, 500);

    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const notifRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { notifications, unreadCount, markAllAsRead, clearAll } = useNotification();
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Click Outside to Close Search
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
                setResults([]); // Clear results on close
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Click Outside to Close Notifications
    useEffect(() => {
        const handleClickOutsideNotif = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };

        if (isNotifOpen) {
            document.addEventListener('mousedown', handleClickOutsideNotif);
        }
        return () => document.removeEventListener('mousedown', handleClickOutsideNotif);
    }, [isNotifOpen]);

    // Fetch Results on Debounce
    useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedSearchValue.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const data = await searchMulti(debouncedSearchValue);
                setResults(data.slice(0, 5));
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isSearchOpen) {
            fetchResults();
        }
    }, [debouncedSearchValue, isSearchOpen]);

    const handleSearchCheck = (e) => {
        if (e.key === 'Enter' && searchValue.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchValue)}`);
            setIsSearchOpen(false);
        }
    };

    const toggleSearch = () => {
        setIsSearchOpen(true);
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const handleResultClick = (id, type) => {
        navigate(type === 'tv' ? `/tv/${id}` : `/movie/${id}`);
        setIsSearchOpen(false);
        setSearchValue('');
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'TV Shows', path: '/tv-shows' },
        { name: 'Movies', path: '/movies' },
        { name: 'Regional', path: '/regional' },
        { name: 'My List', path: '/my-list' },
    ];

    return (
        <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
            <div className="navbar__left">
                <Link to="/" className="navbar__logo">
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

            <div className="navbar__actions">
                {/* Interactive Search Bar */}
                <div
                    ref={searchRef}
                    className={`navbar__search ${isSearchOpen ? 'open' : ''}`}
                    onClick={!isSearchOpen ? toggleSearch : undefined}
                >
                    <Search className="search-icon" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Box Office, Actors, Genres..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleSearchCheck}
                        className={isSearchOpen ? 'visible' : ''}
                    />

                    {/* Inline Results Dropdown */}
                    {isSearchOpen && searchValue && (
                        <div className="search-dropdown">
                            {loading ? (
                                <SearchListSkeleton />
                            ) : results.length > 0 ? (
                                <ul>
                                    {results.map((item) => (
                                        <li key={item.id} onClick={(e) => {
                                            e.stopPropagation();
                                            handleResultClick(item.id, item.media_type || 'movie');
                                        }}>
                                            <img
                                                src={item.poster_path ? `${ENDPOINTS.IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/50x75'}
                                                alt={item.title || item.name}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <div className="info">
                                                <h4>{item.title || item.name}</h4>
                                                <span>{item.release_date || item.first_air_date ? (item.release_date || item.first_air_date).substring(0, 4) : 'N/A'} • {item.media_type === 'tv' ? 'TV Show' : 'Movie'}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="no-results">No results found</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="navbar__notif-wrapper" ref={notifRef}>
                    <button
                        className="relative"
                        onClick={() => {
                            setIsNotifOpen(!isNotifOpen);
                            if (!isNotifOpen && unreadCount > 0) markAllAsRead();
                        }}
                    >
                        <Bell />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="notif-dropdown">
                            <div className="notif-header">
                                <h3>Activity</h3>
                                <span className="notif-count">{notifications.length} events</span>
                                {notifications.length > 0 && (
                                    <button onClick={clearAll} className="clear-btn" title="Clear All">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                            <div className="notif-body">
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div key={n.id} className={`notif-item notif-item--${n.type} ${n.read ? 'read' : 'unread'}`}>
                                            {/* Thumbnail or Icon */}
                                            {n.thumbnail ? (
                                                <div className="notif-thumb">
                                                    <img src={n.thumbnail} alt="" loading="lazy" />
                                                    <span className="notif-type-badge" style={{ background: getNotifColor(n.type) }}>
                                                        {getNotifIcon(n.type)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="notif-icon-circle" style={{ background: `${getNotifColor(n.type)}20`, color: getNotifColor(n.type) }}>
                                                    {getNotifIcon(n.type)}
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="notif-content">
                                                <div className="notif-top-row">
                                                    {n.title && <span className="notif-title">{n.title}</span>}
                                                    <span className="notif-time">{getRelativeTime(n.timestamp)}</span>
                                                </div>
                                                <p className="notif-message">{n.message}</p>
                                                {n.subtitle && <span className="notif-subtitle">{n.subtitle}</span>}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="notif-empty">
                                        <Bell size={32} strokeWidth={1} />
                                        <p>No activity yet</p>
                                        <span>Your actions will appear here</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {user ? (
                    <Link to="/profile" className="profile-icon">
                        {user.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="User"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '2px solid #e50914'
                                }}
                            />
                        ) : (
                            <User />
                        )}
                    </Link>
                ) : (
                    <Link to="/auth" className="navbar__signin">
                        Sign In
                    </Link>
                )}
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="bottom-nav">
                <Link to="/" className={`bottom-nav__item ${location.pathname === '/' ? 'active' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    <span>Home</span>
                </Link>
                <Link to="/search" className={`bottom-nav__item ${location.pathname === '/search' ? 'active' : ''}`}>
                    <Search size={20} />
                    <span>Search</span>
                </Link>
                <Link to="/my-list" className={`bottom-nav__item ${location.pathname === '/my-list' ? 'active' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    <span>My List</span>
                </Link>
                <Link to="/profile" className={`bottom-nav__item ${location.pathname === '/profile' ? 'active' : ''}`}>
                    {user?.user_metadata?.avatar_url ? (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt=""
                            style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <User size={20} />
                    )}
                    <span>Profile</span>
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;

