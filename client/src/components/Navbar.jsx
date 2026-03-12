import React from 'react';
import { Activity, LogOut } from 'lucide-react';

export default function Navbar({ onLogout }) {
  return (
    <header className="top-header">
      <div className="header-title">
        <h1>CSD's Salary Calculator</h1>
      </div>
      <div className="header-actions">
        <div className="status-badge offline-badge hidden"></div>
        <div className="status-badge online-badge">
          <Activity size={16} />
          <span>System Online</span>
        </div>
        {onLogout && (
          <button 
            onClick={onLogout}
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
            title="Logout"
          >
            <LogOut size={16} />
            <span style={{ fontSize: '0.875rem' }}>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
