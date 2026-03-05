import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import DailyReportsPage from './pages/DailyReportsPage';
import SummaryReportPage from './pages/SummaryReportPage';

// clearSessionData API call used to reset backend state when app loads
import { clearSessionData } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('upload');

  // clear any stale session data on initial mount so every user starts with a clean slate
  useEffect(() => {
    const reset = async () => {
      try {
        await clearSessionData();
      } catch (err) {
        // log but don't block rendering
        console.error('failed to clear session on app load', err);
      }
    };
    reset();
  }, []);

  return (
    <div className="app">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="main-content">
        {currentPage === 'upload' && <UploadPage />}
        {currentPage === 'daily-reports' && <DailyReportsPage />}
        {currentPage === 'summary-report' && <SummaryReportPage />}
      </main>

      <footer className="footer">
        <p>
          © 2026 Payroll Management System | Biometric Attendance Based Salary
          Calculator
        </p>
      </footer>
    </div>
  );
}

export default App;
