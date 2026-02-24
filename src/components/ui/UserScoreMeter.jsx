import React from 'react';
import { motion } from 'framer-motion';

const UserScoreMeter = ({ score }) => {
    // Score is 0-10. We want a % display.
    const percentage = Math.round(score * 10); // 8.5 -> 85

    // SVG Config (Same as PopularityMeter)
    const radius = 20;
    const stroke = 3;
    const circumference = 18 * 2 * Math.PI; // r=18
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Color Logic (Standard Rating Colors)
    const getColor = (val) => {
        if (val >= 70) return '#46d369'; // Green
        if (val >= 50) return '#ffcd3c'; // Yellow
        return '#f44336'; // Red
    };

    const color = getColor(percentage);

    return (
        <div className="popularity-meter"> {/* Reuse same class for layout */}
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
                        r={18}
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
                        r={18}
                        cx={22}
                        cy={22}
                    />
                </svg>
                <div className="score-text">
                    {percentage}<span style={{ fontSize: '0.6em', marginLeft: '1px' }}>%</span>
                </div>
            </div>

            <div className="popularity-meter__labels">
                <span className="label">User Score</span>
                <span className="status" style={{ color: color }}>
                    {percentage >= 70 ? 'Positive' : percentage >= 50 ? 'Mixed' : 'Poor'}
                </span>
            </div>
        </div>
    );
};

export default UserScoreMeter;
