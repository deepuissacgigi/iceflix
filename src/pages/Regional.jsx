import React, { useState } from 'react';
import Row from '../components/layout/Row';
import { Loader2, RefreshCw, Globe, ArrowDownUp } from 'lucide-react';
import Button from '../components/ui/Button';
import useRegionalContent from '../hooks/useRegionalContent';
import RegionalSpotlight from '../components/ui/RegionalSpotlight';
import useDocTitle from '../hooks/useDocTitle';

const Regional = () => {
    useDocTitle('Regional');
    const [selectedRegionId, setSelectedRegionId] = useState('in');
    const [selectedSort, setSelectedSort] = useState('popularity.desc');
    const { content, subRegionsData, loading, error, regions, activeRegion, spotlightItem, sortOptions } = useRegionalContent(selectedRegionId, selectedSort);

    if (error) {
        return (
            <div className="regional-page regional-page--error">
                <p className="error-text">{error}</p>
                <Button variant="primary" icon={RefreshCw} onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    return (
        <div className="regional-page">
            {/* Premium Spotlight Integration (Handles loading state visually better than full page loader) */}
            {spotlightItem && <RegionalSpotlight item={spotlightItem} />}

            <div className="regional-page__container">
                {/* Modern Glassmorphism Region Selector */}
                <div className="regional-page__filter-bar">
                    <div className="regional-page__filter-label">
                        <Globe size={20} className="text-primary" />
                        <h2>Explore by Region</h2>
                    </div>

                    <div className="regional-page__filters">
                        <div className="regional-page__select-wrapper">
                            <select
                                className="regional-page__select"
                                value={selectedRegionId}
                                onChange={(e) => setSelectedRegionId(e.target.value)}
                            >
                                {regions.map((region) => (
                                    <option key={region.id} value={region.id}>
                                        {region.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="regional-page__select-wrapper regional-page__select-wrapper--sort">
                            <ArrowDownUp size={16} className="regional-page__select-icon" />
                            <select
                                className="regional-page__select"
                                value={selectedSort}
                                onChange={(e) => setSelectedSort(e.target.value)}
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="regional-page__rows--loading">
                        <Loader2 className="animate-spin text-primary" size={48} />
                    </div>
                ) : (
                    <div className="regional-page__rows">
                        {content && content.length > 0 ? (
                            activeRegion.isSubRegion && subRegionsData?.length > 0 ? (
                                // Render multiple rows for sub-regions (e.g. Indian Cinema -> Bollywood, Tollywood)
                                subRegionsData.map(subRegion => (
                                    <Row
                                        key={subRegion.id}
                                        title={`Top ${subRegion.label}`}
                                        items={subRegion.items}
                                    />
                                ))
                            ) : (
                                // Render single row for standard regions
                                <Row
                                    title={`Top ${activeRegion.label}`}
                                    items={content}
                                />
                            )
                        ) : (
                            <div className="regional-page__empty">
                                <h2>No content available for this region.</h2>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Regional;
