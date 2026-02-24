import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Eye, EyeOff, ArrowRight, ChevronRight, Star, Calendar, Mail, Lock, User, Film } from 'lucide-react';
import ENDPOINTS from '../services/endpoints';
import { getTrendingMovies, getMovieVideos } from '../services/tmdb';
const ReactPlayer = React.lazy(() => import('react-player'));
import useDocTitle from '../hooks/useDocTitle';

const SLIDE_INTERVAL = 10000;

const Auth = () => {
    useDocTitle('Sign In');
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [slides, setSlides] = useState([]);
    const [activeSlide, setActiveSlide] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const [trailerReady, setTrailerReady] = useState(false);

    const { signIn, signUp, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    // Mount animation
    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(t);
    }, []);

    // Fetch trending movies for the cinematic background
    useEffect(() => {
        const loadSlides = async () => {
            try {
                const movies = await getTrendingMovies();
                const top = movies
                    .filter(m => m.backdrop_path && m.vote_average > 6.5)
                    .sort((a, b) => b.popularity - a.popularity)
                    .slice(0, 6);

                const data = await Promise.all(
                    top.map(async (movie) => {
                        let trailerKey = null;
                        try {
                            const videos = await getMovieVideos(movie.id);
                            const trailer =
                                videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official) ||
                                videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
                                videos.find(v => v.site === 'YouTube');
                            if (trailer) trailerKey = trailer.key;
                        } catch { /* silent */ }

                        return {
                            id: movie.id,
                            title: movie.title || movie.name,
                            backdrop: `${ENDPOINTS.IMAGE_BASE_URL}${movie.backdrop_path}`,
                            year: (movie.release_date || '').substring(0, 4),
                            rating: movie.vote_average?.toFixed(1),
                            overview: movie.overview?.substring(0, 160),
                            trailerKey,
                        };
                    })
                );
                setSlides(data);
            } catch (err) {
                console.error('Auth: failed to load slides', err);
            }
        };
        loadSlides();
    }, []);

    // Auto-cycle slides
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setTrailerReady(false);
            setActiveSlide(prev => (prev + 1) % slides.length);
        }, SLIDE_INTERVAL);
        return () => clearInterval(timer);
    }, [slides.length]);

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                const { error } = await signIn(email, password);
                if (error) throw error;
            } else {
                const { error } = await signUp(email, password, username);
                if (error) throw error;
            }
            navigate('/profile');
        } catch (err) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const toggleMode = useCallback((e) => {
        e.preventDefault();
        setError('');
        setMode(prev => prev === 'login' ? 'signup' : 'login');
    }, []);

    const current = slides[activeSlide];
    const trailerKey = current?.trailerKey;
    const isLogin = mode === 'login';

    return (
        <div className={`auth-page ${mounted ? 'auth-page--visible' : ''}`}>
            {/* ═══════════ LEFT — CINEMATIC SHOWCASE ═══════════ */}
            <div className="auth-page__cinema">
                <div className="auth-cinema">
                    {/* Backdrop Images */}
                    {slides.map((slide, i) => (
                        <div
                            key={slide.id}
                            className={`auth-cinema__slide ${i === activeSlide ? 'auth-cinema__slide--active' : ''}`}
                        >
                            <img src={slide.backdrop} alt={slide.title} loading={i === 0 ? 'eager' : 'lazy'} />
                        </div>
                    ))}

                    {/* Trailer Layer */}
                    {trailerKey && (
                        <div className={`auth-cinema__trailer ${trailerReady ? 'auth-cinema__trailer--visible' : ''}`}>
                            <ReactPlayer
                                key={trailerKey}
                                url={`https://www.youtube.com/watch?v=${trailerKey}`}
                                playing muted loop
                                width="100%" height="100%"
                                controls={false}
                                onReady={() => setTrailerReady(true)}
                                config={{
                                    youtube: {
                                        playerVars: {
                                            autoplay: 1, controls: 0, showinfo: 0, rel: 0,
                                            modestbranding: 1, iv_load_policy: 3, disablekb: 1,
                                            fs: 0, playsinline: 1, start: 15,
                                            origin: window.location.origin,
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}

                    {/* Gradient Overlays */}
                    <div className="auth-cinema__gradient" />
                    <div className="auth-cinema__edge" />
                </div>

                {/* Movie Info */}
                {current && (
                    <div className="auth-cinema__info" key={current.id}>
                        <div className="auth-cinema__badges">
                            {current.rating && (
                                <span className="auth-cinema__badge">
                                    <Star size={11} /> {current.rating}
                                </span>
                            )}
                            {current.year && (
                                <span className="auth-cinema__badge">
                                    <Calendar size={11} /> {current.year}
                                </span>
                            )}
                            {trailerKey && trailerReady && (
                                <span className="auth-cinema__badge auth-cinema__badge--live">
                                    <Film size={11} /> NOW PLAYING
                                </span>
                            )}
                        </div>
                        <h2 className="auth-cinema__title">{current.title}</h2>
                        <p className="auth-cinema__overview">{current.overview}</p>
                    </div>
                )}

                {/* Slide Indicators */}
                {slides.length > 1 && (
                    <div className="auth-cinema__indicators">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                aria-label={`Slide ${i + 1}`}
                                className={`auth-cinema__dot ${i === activeSlide ? 'auth-cinema__dot--active' : ''}`}
                                onClick={() => { setTrailerReady(false); setActiveSlide(i); }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* ═══════════ RIGHT — AUTH FORM ═══════════ */}
            <div className="auth-page__form-side">
                <div className="auth-card">
                    {/* Brand */}
                    <Link to="/" className="auth-card__brand">
                        <span>ICE</span><span className="auth-card__brand-accent">FLIX</span>
                    </Link>

                    {/* Heading */}
                    <div className="auth-card__header">
                        <h1>{isLogin ? 'Welcome back' : 'Join the experience'}</h1>
                        <p>{isLogin ? 'Sign in to continue your cinematic journey' : 'Create your free account and start streaming'}</p>
                    </div>

                    {/* Error */}
                    {error && <div className="auth-card__error">{error}</div>}

                    {/* Google OAuth */}
                    <button type="button" className="auth-card__google" onClick={handleGoogleLogin} disabled={loading}>
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    {/* Divider */}
                    <div className="auth-card__divider">
                        <div className="auth-card__divider-line" />
                        <span>or</span>
                        <div className="auth-card__divider-line" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} autoComplete="off" className="auth-card__form">
                        {/* Username (signup only) */}
                        {!isLogin && (
                            <div className={`auth-input ${activeField === 'username' ? 'auth-input--active' : ''} ${username ? 'auth-input--has-value' : ''}`}>
                                <User size={16} className="auth-input__icon" />
                                <input
                                    type="text" id="auth-username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    onFocus={() => setActiveField('username')}
                                    onBlur={() => setActiveField(null)}
                                    required autoComplete="off"
                                />
                                <label htmlFor="auth-username">Username</label>
                                <span className="auth-input__bar" />
                            </div>
                        )}

                        {/* Email */}
                        <div className={`auth-input ${activeField === 'email' ? 'auth-input--active' : ''} ${email ? 'auth-input--has-value' : ''}`}>
                            <Mail size={16} className="auth-input__icon" />
                            <input
                                type="email" id="auth-email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onFocus={() => setActiveField('email')}
                                onBlur={() => setActiveField(null)}
                                required autoComplete="email" name="email"
                            />
                            <label htmlFor="auth-email">Email address</label>
                            <span className="auth-input__bar" />
                        </div>

                        {/* Password */}
                        <div className={`auth-input ${activeField === 'password' ? 'auth-input--active' : ''} ${password ? 'auth-input--has-value' : ''}`}>
                            <Lock size={16} className="auth-input__icon" />
                            <input
                                type={showPassword ? 'text' : 'password'} id="auth-password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onFocus={() => setActiveField('password')}
                                onBlur={() => setActiveField(null)}
                                required autoComplete="current-password" name="password"
                            />
                            <label htmlFor="auth-password">Password</label>
                            <span className="auth-input__bar" />
                            <button type="button" className="auth-input__toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Forgot Password */}
                        {isLogin && (
                            <div className="auth-card__forgot">
                                <a href="#">Forgot password?</a>
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" className="auth-card__submit" disabled={loading}>
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle */}
                    <p className="auth-card__switch">
                        {isLogin ? "Don't have an account?" : 'Already a member?'}
                        <a href="#" onClick={toggleMode}>
                            {isLogin ? 'Sign up free' : 'Sign in'}
                            <ChevronRight size={14} />
                        </a>
                    </p>

                    {/* Legal */}
                    <p className="auth-card__legal">
                        By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
