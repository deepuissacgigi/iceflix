import React, { useRef, useState, useEffect } from 'react';
import ContinueWatchingCard from '../cards/ContinueWatchingCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useInView from '../../hooks/useInView';

const ContinueWatchingRow = ({ items = [], onRemove }) => {
    const rowRef = useRef(null);
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeftState, setScrollLeftState] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const [sectionRef, isInView] = useInView({ rootMargin: '300px' });

    const velX = useRef(0);
    const momentumID = useRef(null);
    const lastX = useRef(0);

    useEffect(() => {
        return () => cancelAnimationFrame(momentumID.current);
    }, []);

    const scroll = (direction) => {
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
            rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const beginMomentum = () => {
        cancelAnimationFrame(momentumID.current);
        const loop = () => {
            if (!rowRef.current) return;
            rowRef.current.scrollLeft -= velX.current;
            velX.current *= 0.98;
            if (Math.abs(velX.current) > 0.1) {
                momentumID.current = requestAnimationFrame(loop);
            } else {
                velX.current = 0;
            }
        };
        loop();
    };

    const handleMouseDown = (e) => {
        setIsDown(true);
        setIsDragging(false);
        setStartX(e.pageX - rowRef.current.offsetLeft);
        setScrollLeftState(rowRef.current.scrollLeft);
        lastX.current = e.pageX;
        velX.current = 0;
        cancelAnimationFrame(momentumID.current);
        rowRef.current.style.cursor = 'grabbing';
        rowRef.current.style.scrollBehavior = 'auto';
    };

    const handleMouseLeave = () => {
        if (isDown) {
            setIsDown(false);
            setIsDragging(false);
            beginMomentum();
        }
        if (rowRef.current) {
            rowRef.current.style.cursor = 'grab';
            rowRef.current.style.scrollBehavior = 'smooth';
        }
    };

    const handleMouseUp = () => {
        setIsDown(false);
        beginMomentum();
        if (rowRef.current) {
            rowRef.current.style.cursor = 'grab';
            rowRef.current.style.scrollBehavior = 'smooth';
        }
        setTimeout(() => setIsDragging(false), 50);
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - rowRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        rowRef.current.scrollLeft = scrollLeftState - walk;
        const newVel = e.pageX - lastX.current;
        velX.current = newVel;
        lastX.current = e.pageX;
        if (Math.abs(x - startX) > 5) setIsDragging(true);
    };

    const handleCardClickCapture = (e) => {
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <div
            className={`row-section cw-row ${isInView ? 'row-section--visible' : ''}`}
            ref={sectionRef}
        >
            <h2>Continue Watching</h2>

            <div className="row-section__slider">
                <button
                    className="row-section__arrow row-section__arrow--left"
                    onClick={() => scroll('left')}
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={40} />
                </button>

                <div
                    className="cw-scroll"
                    ref={rowRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                >
                    {isInView && items.map((item, index) => (
                        <div
                            key={item.id}
                            className="cw-item"
                            style={{ '--item-index': index }}
                            onClickCapture={handleCardClickCapture}
                        >
                            <ContinueWatchingCard movie={item} onRemove={onRemove} />
                        </div>
                    ))}
                </div>

                <button
                    className="row-section__arrow row-section__arrow--right"
                    onClick={() => scroll('right')}
                    aria-label="Scroll right"
                >
                    <ChevronRight size={40} />
                </button>
            </div>
        </div>
    );
};

export default ContinueWatchingRow;
