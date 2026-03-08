import React from 'react';

const Table = ({ children, className = '' }) => {
    return (
        <div className={`modern-table-container ${className}`}>
            <table className="modern-table">
                {children}
            </table>
        </div>
    );
};

export default Table;
