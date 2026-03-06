import React, { useState } from 'react';

export default function Navbar({ currentPage, onPageChange, isDarkTheme, onThemeToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavClick = (page) => {
    onPageChange(page);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>💼 CSD's Salary Calculator</h1>
          <p className="subtitle">Upload the attendance files to calculate salaries</p>
        </div>
        <ul className="navbar-menu">
          <li>
            <button
              className={`nav-link ${currentPage === 'upload' ? 'active' : ''}`}
              onClick={() => handleNavClick('upload')}
              title="Upload and calculate salaries"
            >
              📤 Upload & Calculate
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'daily-reports' ? 'active' : ''}`}
              onClick={() => handleNavClick('daily-reports')}
              title="View daily salary reports"
            >
              📅 Daily Reports
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'summary-report' ? 'active' : ''}`}
              onClick={() => handleNavClick('summary-report')}
              title="View summary report"
            >
              📊 Summary Report
            </button>
          </li>
          <li>
            <button
              className="nav-link theme-toggle"
              onClick={onThemeToggle}
              title={isDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
