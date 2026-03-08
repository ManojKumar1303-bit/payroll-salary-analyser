import React from 'react';

const Card = ({ children, title, className = '' }) => {
  return (
    <div className={`modern-card ${className}`}>
      {title && <h2 className="modern-card-title">{title}</h2>}
      <div className="modern-card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
