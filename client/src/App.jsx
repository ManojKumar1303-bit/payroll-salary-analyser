import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import DailyReportsPage from './pages/DailyReportsPage';
import SummaryReportPage from './pages/SummaryReportPage';
import EmployeeSettingsPage from './pages/EmployeeSettingsPage';

// clearSessionData API call used to reset backend state when app loads
import { clearSessionData } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('upload');
  const [isDarkTheme, setIsDarkTheme] = useState(false);

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

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className={`app ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} isDarkTheme={isDarkTheme} onThemeToggle={toggleTheme} />

      <main className="main-content">
        {currentPage === 'upload' && <UploadPage />}
        {currentPage === 'employee-settings' && <EmployeeSettingsPage />}
        {currentPage === 'daily-reports' && <DailyReportsPage />}
        {currentPage === 'summary-report' && <SummaryReportPage />}
      </main>

      <footer className="footer">
        <p>
          © 2026 Kaaraalan Goli Soda and Cattle farm. All rights reserved. Developed and Maintained by Manoj Kumar U.
        </p>
      </footer>
    </div>
  );
}

export default App;
