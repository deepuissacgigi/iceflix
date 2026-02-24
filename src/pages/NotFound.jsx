import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="not-found-page">
            <div className="not-found-page__content">
                <h1 className="not-found-page__code">404</h1>
                <h2 className="not-found-page__title">Lost in the Stream</h2>
                <p className="not-found-page__desc">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="not-found-page__actions">
                    <Link to="/" className="not-found-page__btn not-found-page__btn--primary">
                        <Home size={18} />
                        Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="not-found-page__btn not-found-page__btn--secondary"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
