import React, { useRef } from 'react';
import ReactPlayer from 'react-player';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

const TrailerModal = ({ isOpen, onClose, videoKey }) => {
    const overlayRef = useRef(null);

    if (!isOpen || !videoKey) return null;

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    return createPortal(
        <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}>
                    <X /> Close
                </button>
                <ReactPlayer
                    url={`https://www.youtube.com/watch?v=${videoKey}`}
                    width="100%"
                    height="100%"
                    playing
                    controls
                />
            </div>
        </div>,
        document.body
    );
};

export default TrailerModal;
