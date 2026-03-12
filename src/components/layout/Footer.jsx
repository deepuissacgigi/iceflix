import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__content">
                <Link to="/" className="footer__logo" data-darkreader-inline-color style={{ '--darkreader-inline-color': 'initial' }}>
                    ICEFLIX
                </Link>
                <p className="footer__copyright">&copy; {new Date().getFullYear()} ICEFLIX, Inc.</p>
            </div>
        </footer>
    );
};

export default Footer;
