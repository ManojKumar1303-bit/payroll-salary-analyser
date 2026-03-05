import React from 'react';

export default function Navbar({ currentPage, onPageChange }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>💰 Payroll Management System</h1>
          <p className="subtitle">Biometric Attendance Based Salary Calculator</p>
        </div>
        <ul className="navbar-menu">
          <li>
            <button
              className={`nav-link ${currentPage === 'upload' ? 'active' : ''}`}
              onClick={() => onPageChange('upload')}
            >
              Upload & Calculate
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'daily-reports' ? 'active' : ''}`}
              onClick={() => onPageChange('daily-reports')}
            >
              Daily Reports
            </button>
          </li>
          <li>
            <button
              className={`nav-link ${currentPage === 'summary-report' ? 'active' : ''}`}
              onClick={() => onPageChange('summary-report')}
            >
              Summary Report
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
