import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Bell, User, X } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import { useAuth } from '../../context/AuthContext';
import { searchMulti } from '../../services/tmdb';
import ENDPOINTS from '../../services/endpoints';
import { Spinner, SearchListSkeleton } from '../loaders/Loaders';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const debouncedSearchValue = useDebounce(searchValue, 500);

    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

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
                // Filter out generic people or items without posters if desired, but general popularity is requested
                setResults(data.slice(0, 5)); // Limit to 5 inline results
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
                                            e.stopPropagation(); // Prevent toggling search
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

                <button className="relative">
                    <Bell />
                    <span className="notification-dot"></span>
                </button>

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
        </nav>
    );
};

export default Navbar;
