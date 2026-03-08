import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ text = 'Loading...', fullPage = false, className = '' }) => {
    if (fullPage) {
        return (
            <div className="loading-card-container">
                <div className={`loading-card ${className}`}>
                    <Loader2 className="loading-spinner" size={32} />
                    {text && <span className="loading-card-text">{text}</span>}
                </div>
            </div>
        );
    }

    return (
        <div className={`modern-loader ${className}`}>
            <Loader2 className="spinner-icon" size={24} />
            {text && <span className="loader-text">{text}</span>}
        </div>
    );
};

export default Loader;
