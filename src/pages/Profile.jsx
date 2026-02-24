import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMyList from '../hooks/useMyList';
import { useAuth } from '../context/AuthContext';
import { useContinueWatching } from '../hooks/useContinueWatching';
import MovieCard from '../components/cards/MovieCard';
import ContinueWatchingCard from '../components/cards/ContinueWatchingCard';
import { Settings, Clock, List as ListIcon, User, LogOut, Shield, Play, Eye } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import useDocTitle from '../hooks/useDocTitle';

const TABS = [
    { id: 'mylist', label: 'My List', icon: ListIcon },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const Profile = () => {
    useDocTitle('Profile');
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('mylist');
    const { myList } = useMyList();
    const { history, removeHistoryItem } = useContinueWatching();
    const [autoplay, setAutoplay] = useState(true);
    const [adultContent, setAdultContent] = useState(false);

    const handleLogout = async () => {
        await logoutUser();
        navigate('/');
    };

    // Derived User Data
    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "Streamer";
    const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
    const joinedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : "Member since 2024";

    return (
        <div className="profile-page">
            <Navbar />

            {/* ── Hero Header ── */}
            <div className="profile-page__header">
                <div className="profile-page__header-bg" />
                <div className="profile-page__header-content">
                    <div className="profile-page__avatar">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={displayName} referrerPolicy="no-referrer" />
                        ) : (
                            <div className="profile-page__avatar-placeholder">
                                <User size={48} />
                            </div>
                        )}
                    </div>

                    <div className="profile-page__user-info">
                        <h1 className="profile-page__name">{displayName}</h1>
                        <span className="profile-page__badge">{joinedDate}</span>
                    </div>

                    <div className="profile-page__stats">
                        <div className="profile-page__stat">
                            <span className="profile-page__stat-count">{myList.length}</span>
                            <span className="profile-page__stat-label">My List</span>
                        </div>
                        <div className="profile-page__stat">
                            <span className="profile-page__stat-count">{history.length}</span>
                            <span className="profile-page__stat-label">Watched</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="profile-page__content">
                {/* Tabs */}
                <div className="profile-page__tabs">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                className={`profile-page__tab ${activeTab === tab.id ? 'profile-page__tab--active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="profile-page__tab-content" key={activeTab}>
                    {/* My List */}
                    {activeTab === 'mylist' && (
                        <>
                            {myList.length > 0 ? (
                                <div className="profile-page__grid">
                                    {myList.map(item => (
                                        <MovieCard key={item.id} movie={item} />
                                    ))}
                                </div>
                            ) : (
                                <div className="profile-page__empty">
                                    <ListIcon size={48} strokeWidth={1} />
                                    <p>Your list is empty. Add movies to watch later!</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* History */}
                    {activeTab === 'history' && (
                        <>
                            {history.length > 0 ? (
                                <div className="profile-page__history-grid">
                                    {history.map(item => (
                                        <div key={`${item.id}-${item.media_type}`} className="profile-page__history-item">
                                            <ContinueWatchingCard
                                                movie={{
                                                    ...item,
                                                    mediaType: item.media_type,
                                                }}
                                                onRemove={() => removeHistoryItem(item.id, item.media_type)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="profile-page__empty">
                                    <Clock size={48} strokeWidth={1} />
                                    <p>No watch history yet.</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* Settings */}
                    {activeTab === 'settings' && (
                        <div className="profile-page__settings">
                            {/* Account Info */}
                            <div className="profile-page__setting-card">
                                <div className="profile-page__setting-icon">
                                    <User size={20} />
                                </div>
                                <div className="profile-page__setting-info">
                                    <h3>Account</h3>
                                    <p>{user?.email}</p>
                                </div>
                            </div>

                            {/* Autoplay */}
                            <div className="profile-page__setting-card">
                                <div className="profile-page__setting-icon">
                                    <Play size={20} />
                                </div>
                                <div className="profile-page__setting-info">
                                    <h3>Autoplay Previews</h3>
                                    <p>Play trailers automatically while browsing</p>
                                </div>
                                <button
                                    className={`profile-page__toggle ${autoplay ? 'profile-page__toggle--on' : ''}`}
                                    onClick={() => setAutoplay(!autoplay)}
                                    aria-label="Toggle autoplay"
                                >
                                    <span className="profile-page__toggle-knob" />
                                </button>
                            </div>

                            {/* Adult Content */}
                            <div className="profile-page__setting-card">
                                <div className="profile-page__setting-icon">
                                    <Eye size={20} />
                                </div>
                                <div className="profile-page__setting-info">
                                    <h3>Adult Content</h3>
                                    <p>Show 18+ items in search results</p>
                                </div>
                                <button
                                    className={`profile-page__toggle ${adultContent ? 'profile-page__toggle--on' : ''}`}
                                    onClick={() => setAdultContent(!adultContent)}
                                    aria-label="Toggle adult content"
                                >
                                    <span className="profile-page__toggle-knob" />
                                </button>
                            </div>

                            {/* Sign Out */}
                            <button className="profile-page__logout" onClick={handleLogout}>
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
