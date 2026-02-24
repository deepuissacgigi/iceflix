import React from 'react';


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
        <button
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
        </button>
    );
};

export default Button;
