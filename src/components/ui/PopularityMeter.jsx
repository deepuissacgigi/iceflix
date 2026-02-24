import React from 'react';
import { motion } from 'framer-motion';

const PopularityMeter = ({ score }) => {
    const maxScore = 2000;
    const normalized = Math.min(score, maxScore);
    const percent = maxScore > 0 ? (normalized / maxScore) * 100 : 0;

    // SVG Config
    const radius = 20; // 44px container -> radius 20 + 2px stroke
    const stroke = 3;
    const normalizedRadius = radius - stroke * 2; // 20 - 6 = 14
    // Logic check: if container is 44px, center is 22. radius should be ~20.
    // Let's rely on CSS sizing, but SVG needs numbers.
    // If r=18, stroke=3 -> width = 18*2 + 3*2 = 36 + 6 = 42. Close enough.

    const svgRadius = 18;
    const circumference = svgRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    // Color Logic
    const getColor = (val) => {
        if (val > 1000) return '#46d369'; // Mega Hit (Green)
        if (val > 500) return '#ffcd3c'; // Popular (Yellow)
        return '#ffad1f'; // Standard (Orange)
    };

    const color = getColor(score);

    return (
        <div className="popularity-meter">
            <div className="popularity-meter__ring">
                <svg
                    height={44}
                    width={44}
                    style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
                >
                    <circle
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={stroke}
                        fill="transparent"
                        r={svgRadius}
                        cx={22}
                        cy={22}
                    />
                    <motion.circle
                        stroke={color}
                        strokeWidth={stroke}
                        strokeDasharray={circumference + ' ' + circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                        fill="transparent"
                        r={svgRadius}
                        cx={22}
                        cy={22}
                    />
                </svg>
                <div className="score-text">{Math.round(score)}</div>
            </div>

            <div className="popularity-meter__labels">
                <span className="label">Popularity</span>
                <span className="status" style={{ color: color }}>
                    {score > 1000 ? 'Mega Hit' : score > 500 ? 'Trending' : 'Rising'}
                </span>
            </div>
        </div>
    );
};

export default PopularityMeter;
