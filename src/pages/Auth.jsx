import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Eye, EyeOff, ArrowRight, ChevronRight, Star, Calendar, Mail, Lock, UserIcon } from 'lucide-react';
import ENDPOINTS from '../services/endpoints';
import { getTrendingMovies, getMovieVideos } from '../services/tmdb';
import ReactPlayer from 'react-player';

const SLIDE_DURATION = 12000;

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [slides, setSlides] = useState([]);
    const [activeSlide, setActiveSlide] = useState(0);
    const [ready, setReady] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [videoReady, setVideoReady] = useState(false);

    const { signIn, signUp, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const t = setTimeout(() => setReady(true), 150);
        return () => clearTimeout(t);
    }, []);

    // Fetch famous movies + trailers
    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const movies = await getTrendingMovies();
                const famous = movies
                    .filter(m => m.backdrop_path && m.vote_average > 6)
                    .sort((a, b) => b.popularity - a.popularity)
                    .slice(0, 5);

                const slidesData = await Promise.all(
                    famous.map(async (movie) => {
                        let trailerKey = null;
                        try {
                            const videos = await getMovieVideos(movie.id);
                            const trailer = videos.find(
                                v => v.type === 'Trailer' && v.site === 'YouTube' && v.official
                            ) || videos.find(
                                v => v.type === 'Trailer' && v.site === 'YouTube'
                            ) || videos.find(
                                v => v.site === 'YouTube'
                            );
                            if (trailer) trailerKey = trailer.key;
                        } catch (e) { /* ignore */ }

                        return {
                            id: movie.id,
                            title: movie.title || movie.name,
                            backdrop: `${ENDPOINTS.IMAGE_BASE_URL}${movie.backdrop_path}`,
                            year: (movie.release_date || movie.first_air_date || '').substring(0, 4),
                            rating: movie.vote_average?.toFixed(1),
                            overview: movie.overview?.substring(0, 140),
                            trailerKey,
                        };
                    })
                );

                setSlides(slidesData);
            } catch (err) {
                console.error('Auth slides fetch error:', err);
            }
        };
        fetchSlides();
    }, []);

    // Auto-cycle
    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setVideoReady(false);
            setActiveSlide(prev => (prev + 1) % slides.length);
        }, SLIDE_DURATION);
        return () => clearInterval(interval);
    }, [slides.length]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
                navigate('/profile');
            } else {
                const { error } = await signUp(email, password, username);
                if (error) throw error;
                navigate('/profile');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = useCallback((e) => {
        e.preventDefault();
        setError('');
        setIsLogin(prev => !prev);
    }, []);

    const currentSlide = slides[activeSlide];
    const currentTrailer = currentSlide?.trailerKey;

    return (
        <div className={`auth-split ${ready ? 'auth-split--ready' : ''}`}>

            {/* ════════════ LEFT: CINEMATIC SHOWCASE ════════════ */}
            <div className="auth-split__left">
                <div className="auth-showcase">
                    {/* Backdrop Images — always behind */}
                    {slides.map((slide, i) => (
                        <div
                            key={slide.id}
                            className={`auth-showcase__slide ${i === activeSlide ? 'auth-showcase__slide--active' : ''}`}
                        >
                            <img src={slide.backdrop} alt={slide.title} loading={i === 0 ? 'eager' : 'lazy'} />
                        </div>
                    ))}

                    {/* Video Layer — sits ON TOP of images, fades in when ready */}
                    {currentTrailer && (
                        <div className={`auth-showcase__video-layer ${videoReady ? 'auth-showcase__video-layer--visible' : ''}`}>
                            <ReactPlayer
                                key={currentTrailer}
                                url={`https://www.youtube.com/watch?v=${currentTrailer}`}
                                playing={true}
                                muted={true}
                                loop={true}
                                width="100%"
                                height="100%"
                                controls={false}
                                onReady={() => setVideoReady(true)}
                                config={{
                                    youtube: {
                                        playerVars: {
                                            autoplay: 1,
                                            controls: 0,
                                            showinfo: 0,
                                            rel: 0,
                                            modestbranding: 1,
                                            iv_load_policy: 3,
                                            disablekb: 1,
                                            fs: 0,
                                            playsinline: 1,
                                            start: 15,
                                            origin: window.location.origin,
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}

                    {/* Overlays */}
                    <div className="auth-showcase__overlay" />
                    <div className="auth-showcase__edge" />
                </div>

                {/* Movie Info */}
                {currentSlide && (
                    <div className="auth-showcase__info" key={currentSlide.id}>
                        <div className="auth-showcase__meta">
                            {currentSlide.rating && (
                                <span className="auth-showcase__badge">
                                    <Star size={12} /> {currentSlide.rating}
                                </span>
                            )}
                            {currentSlide.year && (
                                <span className="auth-showcase__badge">
                                    <Calendar size={12} /> {currentSlide.year}
                                </span>
                            )}
                            {currentTrailer && videoReady && (
                                <span className="auth-showcase__badge auth-showcase__badge--live">
                                    ● NOW PLAYING
                                </span>
                            )}
                        </div>
                        <h2 className="auth-showcase__title">{currentSlide.title}</h2>
                        <p className="auth-showcase__desc">{currentSlide.overview}</p>
                    </div>
                )}

                {/* Indicators */}
                {slides.length > 1 && (
                    <div className="auth-showcase__dots">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                className={`auth-showcase__dot ${i === activeSlide ? 'auth-showcase__dot--active' : ''}`}
                                onClick={() => {
                                    setVideoReady(false);
                                    setActiveSlide(i);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ════════════ RIGHT: PREMIUM FORM ════════════ */}
            <div className="auth-split__right">
                <div className="auth-form-panel">
                    {/* Brand */}
                    <Link to="/" className="auth-form-panel__brand">
                        <span>ICE</span><span className="accent">FLIX</span>
                    </Link>

                    {/* Heading */}
                    <div className="auth-form-panel__header">
                        <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
                        <p>{isLogin ? 'Sign in to continue watching' : 'Start your streaming journey'}</p>
                    </div>

                    {/* Error */}
                    {error && <div className="auth-form-panel__error">{error}</div>}

                    {/* Google First */}
                    <button
                        type="button"
                        className="auth-btn-social"
                        onClick={() => {
                            setLoading(true);
                            loginWithGoogle().catch(err => {
                                setError(err.message);
                                setLoading(false);
                            });
                        }}
                        disabled={loading}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="auth-form-panel__divider">
                        <div /><span>or continue with email</span><div />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} autoComplete="off" className="auth-form-panel__form">
                        {!isLogin && (
                            <div className={`auth-field auth-field--delay-1 ${focusedField === 'username' ? 'auth-field--focused' : ''} ${username ? 'auth-field--filled' : ''}`}>
                                <span className="auth-field__icon"><UserIcon size={16} /></span>
                                <label htmlFor="auth-username">Username</label>
                                <input
                                    type="text"
                                    id="auth-username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    required
                                    autoComplete="off"
                                />
                                <div className="auth-field__highlight" />
                            </div>
                        )}

                        <div className={`auth-field auth-field--delay-2 ${focusedField === 'email' ? 'auth-field--focused' : ''} ${email ? 'auth-field--filled' : ''}`}>
                            <span className="auth-field__icon"><Mail size={16} /></span>
                            <label htmlFor="auth-email">Email address</label>
                            <input
                                type="email"
                                id="auth-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                                required
                                autoComplete="email"
                                name="email"
                            />
                            <div className="auth-field__highlight" />
                        </div>

                        <div className={`auth-field auth-field--delay-3 ${focusedField === 'password' ? 'auth-field--focused' : ''} ${password ? 'auth-field--filled' : ''}`}>
                            <span className="auth-field__icon"><Lock size={16} /></span>
                            <label htmlFor="auth-password">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="auth-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                required
                                autoComplete="current-password"
                                name="password"
                            />
                            <div className="auth-field__highlight" />
                            <button
                                type="button"
                                className="auth-field__eye"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="auth-form-panel__forgot">
                                <a href="#">Forgot password?</a>
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" className="auth-btn-submit" disabled={loading}>
                            <span className="auth-btn-submit__bg" />
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Sign in' : 'Get started'}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle */}
                    <p className="auth-form-panel__toggle">
                        {isLogin ? "Don't have an account?" : 'Already a member?'}
                        <a href="#" onClick={toggleMode}>
                            {isLogin ? 'Sign up free' : 'Sign in'}
                            <ChevronRight size={14} />
                        </a>
                    </p>

                    {/* Legal */}
                    <p className="auth-form-panel__legal">
                        Protected by reCAPTCHA. <a href="#">Privacy</a> · <a href="#">Terms</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
