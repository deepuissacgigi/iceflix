import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Eye, EyeOff, ArrowRight, ChevronRight, Mail, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ENDPOINTS from '../services/endpoints';
import { getPopularMovies, getTopRatedMovies, getTvShows, getTopRatedTV } from '../services/tmdb';
import useDocTitle from '../hooks/useDocTitle';

const ANIMATION_GENRE_ID = 16;

const Auth = () => {
    useDocTitle('Sign In');
    const [mode, setMode] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [posters, setPosters] = useState([]);
    const [mounted, setMounted] = useState(false);

    const { signIn, signUp, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    // Fetch a massive pool of famous movie/TV posters
    useEffect(() => {
        const load = async () => {
            try {
                const [popular, topRated, tvPopular, tvTop] = await Promise.all([
                    getPopularMovies(),
                    getTopRatedMovies(),
                    getTvShows(),
                    getTopRatedTV()
                ]);

                const all = [...popular, ...topRated, ...tvPopular, ...tvTop]
                    .filter(item => {
                        const hasPoster = !!item.poster_path;
                        const isNotAnimation = !(item.genre_ids || []).includes(ANIMATION_GENRE_ID);
                        return hasPoster && isNotAnimation;
                    });

                // Deduplicate by ID
                const unique = Array.from(new Map(all.map(item => [item.id, item])).values());

                // Shuffle
                for (let i = unique.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [unique[i], unique[j]] = [unique[j], unique[i]];
                }

                // Take 40 posters for a dense mosaic grid
                setPosters(unique.slice(0, 40).map(m => m.poster_path));
            } catch { /* silent */ }
        };
        load();
    }, []);

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
            navigate('/');
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

    const isLogin = mode === 'login';

    // Framer Motion variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.3 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    // Split posters into rows for the scrolling mosaic
    const rows = [];
    const postersPerRow = 8;
    for (let i = 0; i < posters.length; i += postersPerRow) {
        rows.push(posters.slice(i, i + postersPerRow));
    }

    return (
        <div className={`auth ${mounted ? 'auth--visible' : ''}`}>
            {/* ═══ Scrolling Poster Mosaic Background ═══ */}
            <div className="auth__mosaic">
                {rows.map((row, rowIdx) => (
                    <div
                        key={rowIdx}
                        className={`auth__mosaic-row ${rowIdx % 2 === 0 ? 'auth__mosaic-row--left' : 'auth__mosaic-row--right'}`}
                    >
                        {/* Duplicate row for seamless infinite scroll */}
                        {[...row, ...row].map((path, i) => (
                            <div key={`${rowIdx}-${i}`} className="auth__mosaic-poster">
                                <img
                                    src={`${ENDPOINTS.IMAGE_BASE_URL_W500}${path}`}
                                    alt=""
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                ))}
                {/* Dark overlay + gradient on top of the mosaic */}
                <div className="auth__mosaic-overlay" />
            </div>

            {/* ═══ Floating Particles ═══ */}
            <div className="auth__particles">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`auth__particle auth__particle--${i + 1}`} />
                ))}
            </div>

            {/* ═══ Glass Card ═══ */}
            <div className="auth__card-wrap">
                <div
                    className={`auth__card ${isLogin ? '' : 'auth__card--signup'}`}
                >
                    <motion.div variants={containerVariants} initial="hidden" animate="show">
                        {/* Brand */}
                        <motion.div variants={itemVariants}>
                            <Link to="/" className="auth__brand">
                                <span className="auth__brand-ice">ICE</span>
                                <span className="auth__brand-flix">FLIX</span>
                            </Link>
                        </motion.div>

                        {/* Header */}
                        <motion.div variants={itemVariants} className="auth__header">
                            <AnimatePresence mode="wait">
                                <motion.h1
                                    key={mode}
                                    className="auth__title"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isLogin ? 'Welcome back' : 'Create account'}
                                </motion.h1>
                            </AnimatePresence>
                            <p className="auth__subtitle">
                                {isLogin
                                    ? 'Sign in to continue your cinematic journey'
                                    : 'Start your free streaming experience today'}
                            </p>
                        </motion.div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: '1.25rem' }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className="auth__error"
                                >
                                    <span>⚠</span> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Google */}
                        <motion.button variants={itemVariants} type="button" className="auth__google" onClick={handleGoogleLogin} disabled={loading}>
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span>Continue with Google</span>
                        </motion.button>

                        {/* Divider */}
                        <motion.div variants={itemVariants} className="auth__divider">
                            <div className="auth__divider-line" />
                            <span>or</span>
                            <div className="auth__divider-line" />
                        </motion.div>

                        {/* Form */}
                        <motion.form variants={containerVariants} onSubmit={handleSubmit} autoComplete="off" className="auth__form">
                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -20, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="auth__field-wrapper"
                                    >
                                        <div className="auth__field">
                                            <input
                                                type="text" id="auth-username" placeholder=" "
                                                value={username} onChange={e => setUsername(e.target.value)}
                                                required autoComplete="off"
                                            />
                                            <label htmlFor="auth-username">Username</label>
                                            <User size={16} className="auth__field-icon" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div variants={itemVariants} className="auth__field">
                                <input
                                    type="email" id="auth-email" placeholder=" "
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    required autoComplete="email" name="email"
                                />
                                <label htmlFor="auth-email">Email address</label>
                                <Mail size={16} className="auth__field-icon" />
                            </motion.div>

                            <motion.div variants={itemVariants} className="auth__field">
                                <input
                                    type={showPassword ? 'text' : 'password'} id="auth-password" placeholder=" "
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    required autoComplete="current-password" name="password"
                                />
                                <label htmlFor="auth-password">Password</label>
                                <Lock size={16} className="auth__field-icon" />
                                <button type="button" className="auth__field-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </motion.div>

                            {isLogin && (
                                <motion.div variants={itemVariants} className="auth__forgot">
                                    <a href="#">Forgot password?</a>
                                </motion.div>
                            )}

                            <motion.button variants={itemVariants} type="submit" className="auth__submit" disabled={loading}>
                                {loading ? (
                                    <Loader2 size={20} className="auth__spinner" />
                                ) : (
                                    <>
                                        <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </motion.button>
                        </motion.form>

                        <motion.p variants={itemVariants} className="auth__switch">
                            {isLogin ? "Don't have an account?" : 'Already a member?'}
                            <a href="#" onClick={toggleMode}>
                                {isLogin ? 'Sign up free' : 'Sign in'}
                                <ChevronRight size={14} />
                            </a>
                        </motion.p>

                        <motion.p variants={itemVariants} className="auth__legal">
                            By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
                        </motion.p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
