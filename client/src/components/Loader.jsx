import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ text = 'Loading...', fullPage = false, className = '' }) => {
    const content = (
        <div className={`modern-loader ${className}`}>
            <Loader2 className="spinner-icon" size={24} />
            {text && <span className="loader-text">{text}</span>}
        </div>
    );

    if (fullPage) {
        return (
            <div className="loader-overlay">
                {content}
            </div>
        );
    }

    return content;
};

export default Loader;
