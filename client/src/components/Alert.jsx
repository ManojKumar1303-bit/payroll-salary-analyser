import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const Alert = ({ type = 'warning', message, className = '' }) => {
    const isWarning = type === 'warning';

    return (
        <div className={`modern-alert alert-${type} ${className}`}>
            <span className="alert-icon">
                {isWarning ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            </span>
            <span className="alert-message">{message}</span>
        </div>
    );
};

export default Alert;
