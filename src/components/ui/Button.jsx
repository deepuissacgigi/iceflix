import React from 'react';


import { motion } from 'framer-motion';

// Simple class utility if classnames package is removed/not wanted, but usually it's handy.
// Since we removed 'classnames' package, let's just use template strings or a helper.
const cx = (...args) => args.filter(Boolean).join(' ');

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    icon: Icon,
    loading = false,
    ...props
}) => {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={cx(
                'btn',
                `btn--${variant}`,
                `btn--${size}`,
                className
            )}
            disabled={loading}
            {...props}
        >
            {loading ? (
                <span className="spinner">...</span>
            ) : Icon && (
                <Icon />
            )}
            {children}
        </motion.button>
    );
};

export default Button;
