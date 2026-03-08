import React from 'react';
import { Activity } from 'lucide-react';

export default function Navbar() {
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
      </div>
    </header>
  );
}
