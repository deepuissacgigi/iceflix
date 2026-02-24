import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div style={{
                    minHeight: '60vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    textAlign: 'center',
                    padding: '2rem',
                    gap: '1rem',
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Something went wrong</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px' }}>
                        An unexpected error occurred. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#8f00ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            fontFamily: 'inherit',
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
