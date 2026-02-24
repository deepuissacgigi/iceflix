import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer__content">
                <div className="socials">
                    <a href="#" aria-label="Facebook"><Facebook size={24} /></a>
                    <a href="#" aria-label="Instagram"><Instagram size={24} /></a>
                    <a href="#" aria-label="Twitter"><Twitter size={24} /></a>
                    <a href="#" aria-label="YouTube"><Youtube size={24} /></a>
                </div>

                <ul className="links">
                    <li><a href="#">Audio and Subtitles</a></li>
                    <li><a href="#">Audio Description</a></li>
                    <li><a href="#">Help Center</a></li>
                    <li><a href="#">Gift Cards</a></li>
                    <li><a href="#">Media Center</a></li>
                    <li><a href="#">Investor Relations</a></li>
                    <li><a href="#">Jobs</a></li>
                    <li><a href="#">Terms of Use</a></li>
                    <li><a href="#">Privacy</a></li>
                    <li><a href="#">Legal Notices</a></li>
                    <li><a href="#">Cookie Preferences</a></li>
                    <li><a href="#">Corporate Information</a></li>
                    <li><a href="#">Contact Us</a></li>
                </ul>

                <button className="service-code">
                    Service Code
                </button>

                <p className="copyright-text">&copy; 2025 ICEFLIX, Inc.</p>
            </div>
        </footer>
    );
};

export default Footer;
