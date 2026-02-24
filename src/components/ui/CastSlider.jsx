import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CastCard from '../cards/CastCard';

const CastSlider = ({ cast = [] }) => {
    const rowRef = useRef(null);
    const [isDown, setIsDown] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    // Physics
    const velX = useRef(0);
    const momentumID = useRef(null);
    const lastX = useRef(0);

    useEffect(() => {
        return () => cancelAnimationFrame(momentumID.current);
    }, []);

    const scroll = (direction) => {
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
            rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const beginMomentum = () => {
        cancelAnimationFrame(momentumID.current);
        const loop = () => {
            if (!rowRef.current) return;
            rowRef.current.scrollLeft -= velX.current;
            velX.current *= 0.95; // Decay
            if (Math.abs(velX.current) > 0.5) {
                momentumID.current = requestAnimationFrame(loop);
            }
        };
        loop();
    };

    const handleMouseDown = (e) => {
        setIsDown(true);
        setIsDragging(false);
        setStartX(e.pageX - rowRef.current.offsetLeft);
        setScrollLeft(rowRef.current.scrollLeft);
        lastX.current = e.pageX;
        velX.current = 0;
        cancelAnimationFrame(momentumID.current);
        rowRef.current.style.cursor = 'grabbing';
        rowRef.current.style.scrollBehavior = 'auto';
    };

    const handleMouseLeave = () => {
        if (!isDown) return;
        setIsDown(false);
        beginMomentum();
        rowRef.current.style.cursor = 'grab';
        rowRef.current.style.scrollBehavior = 'smooth';
    };

    const handleMouseUp = () => {
        setIsDown(false);
        beginMomentum();
        rowRef.current.style.cursor = 'grab';
        rowRef.current.style.scrollBehavior = 'smooth';
        setTimeout(() => setIsDragging(false), 50);
    };

    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - rowRef.current.offsetLeft;
        const walk = (x - startX) * 1.2;
        rowRef.current.scrollLeft = scrollLeft - walk;
        velX.current = e.pageX - lastX.current;
        lastX.current = e.pageX;
        if (Math.abs(x - startX) > 5) setIsDragging(true);
    };

    return (
        <div className="cast-slider">
            {/* Left Button */}
            <button
                className="slider-btn slider-btn--left"
                onClick={() => scroll('left')}
            >
                <ChevronLeft size={32} />
            </button>

            {/* Scroll Container */}
            <div
                ref={rowRef}
                className="cast-slider__container"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
            >
                {cast.map((person) => (
                    <div key={person.id} className="cast-slider__item" style={{ pointerEvents: isDragging ? 'none' : 'auto' }}>
                        <CastCard cast={person} />
                    </div>
                ))}
            </div>

            {/* Right Button */}
            <button
                className="slider-btn slider-btn--right"
                onClick={() => scroll('right')}
            >
                <ChevronRight size={32} />
            </button>
        </div>
    );
};

export default CastSlider;
