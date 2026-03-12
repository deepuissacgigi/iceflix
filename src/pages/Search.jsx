import React, { useState, useEffect } from 'react';
import useDebounce from '../hooks/useDebounce';
import { searchMulti } from '../services/tmdb';
import MovieCard from '../components/cards/MovieCard';
import { SearchGridSkeleton } from '../components/loaders/Loaders';
import { Search as SearchIcon } from 'lucide-react';
import useDocTitle from '../hooks/useDocTitle';

const Search = () => {
    useDocTitle('Search');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        if (!debouncedQuery) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const data = await searchMulti(debouncedQuery);
                // Filter out results without any images
                setResults(data.filter(item => item.poster_path || item.profile_path));
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    return (
        <div className="search-page">
            <div className="search-page__input-container">
                <SearchIcon className="search-icon" />
                <input
                    type="text"
                    placeholder="Search movies, TV shows, people..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
            </div>

            {loading && <SearchGridSkeleton />}

            {!loading && results.length > 0 && (
                <>
                    <h2 className="search-page__heading">Results for <span>"{debouncedQuery}"</span></h2>
                    <div className="grid-list">
                        {results.map((item) => (
                            <MovieCard key={item.id} movie={item} />
                        ))}
                    </div>
                </>
            )}

            {!loading && debouncedQuery && results.length === 0 && (
                <div className="no-results">
                    No results found for "{debouncedQuery}"
                </div>
            )}
        </div>
    );
};

export default Search;
