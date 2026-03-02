import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Eye, EyeOff, ArrowRight, ChevronRight, Mail, Lock, User } from 'lucide-react';
import ENDPOINTS from '../services/endpoints';
import { getTrendingMovies } from '../services/tmdb';
import useDocTitle from '../hooks/useDocTitle';

const Auth = () => {
    useDocTitle('Sign In');
    const [mode, setMode] = useState('login');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [bgImages, setBgImages] = useState([]);
    const [activeBg, setActiveBg] = useState(0);
    const [mounted, setMounted] = useState(false);

    const { signIn, signUp, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    // Fetch cinematic backgrounds
    useEffect(() => {
        const load = async () => {
            try {
                const movies = await getTrendingMovies();
                const paths = movies
                    .filter(m => m.backdrop_path && m.vote_average > 6)
                    .sort((a, b) => b.popularity - a.popularity)
                    .slice(0, 5)
                    .map(m => m.backdrop_path);
                setBgImages(paths);
            } catch { /* silent */ }
        };
        load();
    }, []);

    // Auto-cycle backgrounds
    useEffect(() => {
        if (bgImages.length <= 1) return;
        const timer = setInterval(() => {
            setActiveBg(prev => (prev + 1) % bgImages.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [bgImages.length]);

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

    return (
        <div className={`auth ${mounted ? 'auth--visible' : ''}`}>
            {/* ── Full-Bleed Cinematic Background ── */}
            <div className="auth__bg">
                {bgImages.map((path, i) => (
                    <img
                        key={path}
                        src={`${ENDPOINTS.IMAGE_BASE_URL_ORIGINAL}${path}`}
                        alt=""
                        className={`auth__bg-img ${i === activeBg ? 'auth__bg-img--active' : ''}`}
                        loading={i === 0 ? 'eager' : 'lazy'}
                    />
                ))}
                <div className="auth__bg-overlay" />
                <div className="auth__bg-noise" />
            </div>

            {/* ── Animated Gradient Orbs ── */}
            <div className="auth__orbs">
                <div className="auth__orb auth__orb--1" />
                <div className="auth__orb auth__orb--2" />
                <div className="auth__orb auth__orb--3" />
            </div>

            {/* ── Glass Form Card ── */}
            <div className="auth__card-wrap">
                <div className={`auth__card ${isLogin ? '' : 'auth__card--signup'}`}>
                    {/* Brand */}
                    <Link to="/" className="auth__brand">
                        <span className="auth__brand-ice">ICE</span>
                        <span className="auth__brand-flix">FLIX</span>
                    </Link>

                    {/* Header */}
                    <div className="auth__header">
                        <h1 key={mode} className="auth__title">
                            {isLogin ? 'Welcome back' : 'Create account'}
                        </h1>
                        <p className="auth__subtitle">
                            {isLogin
                                ? 'Enter your credentials to access your account'
                                : 'Start your free streaming journey today'}
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="auth__error">
                            <span>⚠</span> {error}
                        </div>
                    )}

                    {/* Google Sign-In */}
                    <button
                        type="button"
                        className="auth__google"
                        onClick={handleGoogleLogin}
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
                    <div className="auth__divider">
                        <div className="auth__divider-line" />
                        <span>or</span>
                        <div className="auth__divider-line" />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} autoComplete="off" className="auth__form">
                        {/* Username (signup only) */}
                        {!isLogin && (
                            <div className="auth__field">
                                <User size={16} className="auth__field-icon" />
                                <input
                                    type="text"
                                    id="auth-username"
                                    placeholder="Username"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="auth__field">
                            <Mail size={16} className="auth__field-icon" />
                            <input
                                type="email"
                                id="auth-email"
                                placeholder="Email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                name="email"
                            />
                        </div>

                        {/* Password */}
                        <div className="auth__field">
                            <Lock size={16} className="auth__field-icon" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="auth-password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                                name="password"
                            />
                            <button
                                type="button"
                                className="auth__field-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Forgot */}
                        {isLogin && (
                            <div className="auth__forgot">
                                <a href="#">Forgot password?</a>
                            </div>
                        )}

                        {/* Submit */}
                        <button type="submit" className="auth__submit" disabled={loading}>
                            {loading ? (
                                <Loader2 size={20} className="auth__spinner" />
                            ) : (
                                <>
                                    <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <p className="auth__switch">
                        {isLogin ? "Don't have an account?" : 'Already a member?'}
                        <a href="#" onClick={toggleMode}>
                            {isLogin ? 'Sign up free' : 'Sign in'}
                            <ChevronRight size={14} />
                        </a>
                    </p>

                    {/* Legal */}
                    <p className="auth__legal">
                        By continuing, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
